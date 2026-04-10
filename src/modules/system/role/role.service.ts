import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CacheService } from '@/infrastructure/cache/cache.service';

import {
  CreateRoleDto,
  UpdateRoleDto,
  QueryRoleDto,
  RoleAssignDto,
} from './dto/role.dto';
import { RoleInfo, RoleTree } from './entities/role.entity';

/**
 * 角色服务
 *
 * @description
 * 角色业务逻辑处理：
 * - 角色的 CRUD 操作
 * - 用户角色分配
 * - 角色权限配置（预留）
 */
@Injectable()
export class RoleService {
  private readonly cacheTtl = 3600; // 1小时

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(query?: QueryRoleDto): Promise<{ list: RoleInfo[]; total: number }> {
    const where: any = { isDeleted: 0 };
    if (query?.keyword) {
      where.OR = [
        { name: { contains: query.keyword, mode: 'insensitive' } },
        { code: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }
    if (query?.status !== undefined) where.status = query.status;

    const [roles, total] = await this.prisma.$transaction([
      this.prisma.baseRole.findMany({
        where,
        orderBy: { sort: 'asc' },
        take: query?.pageSize ?? undefined,
        skip: query?.page && query.pageSize ? (query.page - 1) * query.pageSize : undefined,
      }),
      this.prisma.baseRole.count({ where }),
    ]);

    const list = roles.map((r) => this.toRoleInfo(r));
    return { list, total };
  }

  async findTree(): Promise<RoleTree[]> {
    const cacheKey = 'role:tree';
    const cached = await this.cache.get<RoleTree[]>(cacheKey);
    if (cached) return cached;

    const roles = await this.prisma.baseRole.findMany({
      where: { isDeleted: 0 },
      orderBy: { sort: 'asc' },
    });

    const roleMap = new Map<number, RoleTree>();
    const rootNodes: RoleTree[] = [];

    // 先创建所有节点的映射
    roles.forEach((r) => {
      const info = this.toRoleInfo(r);
      roleMap.set(info.id, {
        id: info.id,
        label: info.name,
        value: info.id,
        parentId: info.parentId ?? undefined,
        children: [],
        name: info.name,
        code: info.code,
        status: info.status,
        sort: info.sort,
        remark: info.remark ?? undefined,
      });
    });

    // 再构建树形结构
    roleMap.forEach((node) => {
      if (node.parentId && node.parentId !== 0 && roleMap.has(node.parentId)) {
        const parent = roleMap.get(node.parentId);
        if (parent) {
          parent.children?.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    await this.cache.set(cacheKey, rootNodes, this.cacheTtl);
    return rootNodes;
  }

  async findOne(id: number): Promise<RoleInfo> {
    const cacheKey = `role:${id}`;
    const cached = await this.cache.get<RoleInfo>(cacheKey);
    if (cached) return cached;

    const role = await this.prisma.baseRole.findUnique({
      where: { id, isDeleted: 0 },
      include: { users: true },
    });

    if (!role) {
      throw new NotFoundException(`角色不存在: ${id}`);
    }

    const result = this.toRoleInfo(role);
    result.userCount = role.users.length;

    await this.cache.set(cacheKey, result, this.cacheTtl);
    return result;
  }

  async create(createdBy: bigint, dto: CreateRoleDto): Promise<RoleInfo> {
    // 检查角色编码是否已存在
    const exists = await this.prisma.baseRole.findUnique({
      where: { code: dto.code, isDeleted: 0 },
    });
    if (exists) {
      throw new BadRequestException(`角色编码已存在: ${dto.code}`);
    }

    const role = await this.prisma.baseRole.create({
      data: {
        name: dto.name,
        code: dto.code,
        status: dto.status ?? 1,
        sort: dto.sort ?? 0,
        remark: dto.remark || null,
        createdBy,
      },
    });

    await this.cache.del('role:tree');
    await this.cache.del(`role:${role.id}`);

    return this.toRoleInfo(role);
  }

  async update(updatedBy: bigint, id: number, dto: UpdateRoleDto): Promise<RoleInfo> {
    const role = await this.prisma.baseRole.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!role) {
      throw new NotFoundException(`角色不存在: ${id}`);
    }

    // 检查角色编码是否被其他角色使用
    if (dto.code && dto.code !== role.code) {
      const exists = await this.prisma.baseRole.findUnique({
        where: { code: dto.code, isDeleted: 0 },
      });
      if (exists && Number(exists.id) !== id) {
        throw new BadRequestException(`角色编码已存在: ${dto.code}`);
      }
    }

    const updates: any = { ...dto };
    delete updates.code; // 编码不允许修改

    const updated = await this.prisma.baseRole.update({
      where: { id },
      data: {
        ...updates,
        updatedBy,
        updatedAt: new Date(),
      },
    });

    await this.cache.del('role:tree');
    await this.cache.del(`role:${id}`);

    return this.toRoleInfo(updated);
  }

  async remove(id: number): Promise<{ deleted: number }> {
    const role = await this.prisma.baseRole.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!role) {
      throw new NotFoundException(`角色不存在: ${id}`);
    }

    // 检查是否有用户绑定该角色
    const users = await this.prisma.baseUser.findMany({
      where: { roles: { some: { roleId: id } } },
      select: { id: true },
    });
    if (users.length > 0) {
      throw new BadRequestException(`角色已分配给 ${users.length} 个用户，无法删除`);
    }

    await this.prisma.baseRole.update({
      where: { id },
      data: {
        isDeleted: 1,
        deletedBy: role.updatedBy,
        deletedAt: new Date(),
      },
    });

    await this.cache.del('role:tree');
    await this.cache.del(`role:${id}`);

    return { deleted: 1 };
  }

  /**
   * 为角色分配用户
   */
  async assignUsers(updatedBy: bigint, dto: RoleAssignDto): Promise<{ assigned: number }> {
    const role = await this.prisma.baseRole.findUnique({
      where: { id: dto.roleId, isDeleted: 0 },
    });
    if (!role) {
      throw new NotFoundException(`角色不存在: ${dto.roleId}`);
    }

    // 获取已绑定该角色的用户
    const existing = await this.prisma.mapUserRole.findMany({
      where: { roleId: dto.roleId },
      select: { userId: true },
    });
    const existingUserIds = new Set(existing.map((e) => e.userId));

    // 需要新增的关联
    const toAdd = dto.userIds.filter((uid) => !existingUserIds.has(BigInt(uid)));

    // 需要删除的关联
    const toRemove = Array.from(existingUserIds).filter((uid) => !dto.userIds.includes(Number(uid)));

    // 批量删除
    if (toRemove.length > 0) {
      await this.prisma.mapUserRole.deleteMany({
        where: {
          roleId: dto.roleId,
          userId: { in: toRemove },
        },
      });
    }

    // 批量新增
    if (toAdd.length > 0) {
      await this.prisma.$transaction(
        toAdd.map((userId) =>
          this.prisma.mapUserRole.create({
            data: {
              userId: BigInt(userId),
              roleId: dto.roleId,
              createdBy: updatedBy,
            },
          }),
        ),
      );
    }

    await this.cache.del('role:tree');
    await this.cache.del(`role:${dto.roleId}`);

    // 清除相关用户的缓存
    const allUserIds = [...toAdd, ...toRemove];
    for (const userId of allUserIds) {
      await this.cache.del(`user:${userId}`);
    }

    return { assigned: toAdd.length + toRemove.length };
  }

  /**
   * 获取用户的角色列表
   */
  async getUserRoles(userId: number): Promise<RoleInfo[]> {
    const user = await this.prisma.baseUser.findUnique({
      where: { id: userId, isDeleted: 0 },
    });

    if (!user) {
      throw new NotFoundException(`用户不存在: ${userId}`);
    }

    // 获取用户的角色ID列表
    const userRoles = await this.prisma.mapUserRole.findMany({
      where: { userId: BigInt(userId) },
      select: { role: true },
    });

    return userRoles.map((ur) => this.toRoleInfo(ur.role));
  }

  /**
   * 获取角色的用户列表
   */
  async getRoleUsers(roleId: number): Promise<{ list: any[]; total: number }> {
    const role = await this.prisma.baseRole.findUnique({
      where: { id: roleId, isDeleted: 0 },
    });
    if (!role) {
      throw new NotFoundException(`角色不存在: ${roleId}`);
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.baseUser.findMany({
        where: { roles: { some: { roleId } } },
        select: {
          id: true,
          uuid: true,
          username: true,
          nickname: true,
          avatar: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.baseUser.count({
        where: { roles: { some: { roleId } } },
      }),
    ]);

    return { list: users, total };
  }

  private toRoleInfo(data: any): RoleInfo {
    return {
      id: Number(data.id),
      name: data.name,
      code: data.code,
      status: data.status,
      sort: data.sort,
      remark: data.remark,
      createdBy: data.createdBy ? Number(data.createdBy) : null,
      createdAt: data.createdAt,
      updatedBy: data.updatedBy ? Number(data.updatedBy) : null,
      updatedAt: data.updatedAt,
      isDeleted: data.isDeleted,
      deletedBy: data.deletedBy ? Number(data.deletedBy) : null,
      deletedAt: data.deletedAt,
    };
  }
}
