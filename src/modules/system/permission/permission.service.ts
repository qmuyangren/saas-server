import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CacheService } from '@/infrastructure/cache/cache.service';

import {
  CreatePermissionDto,
  UpdatePermissionDto,
  QueryPermissionDto,
  PermissionGroupAssignDto,
} from './dto/permission.dto';
import { PermissionInfo, PermissionTree, TargetType } from './entities/permission.entity';

/**
 * 权限服务
 *
 * @description
 * 权限业务逻辑处理：
 * - 权限的 CRUD 操作
 * - 权限树构建
 * - 权限组管理
 * - 资源授权
 */
@Injectable()
export class PermissionService {
  private readonly cacheTtl = 3600; // 1小时

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(query?: QueryPermissionDto): Promise<{ list: PermissionInfo[]; total: number }> {
    const where: any = { isDeleted: 0 };
    if (query?.keyword) {
      where.OR = [
        { name: { contains: query.keyword, mode: 'insensitive' } },
        { code: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }
    if (query?.type !== undefined) where.type = query.type;
    if (query?.status !== undefined) where.status = query.status;

    const [permissions, total] = await this.prisma.$transaction([
      this.prisma.basePermission.findMany({
        where,
        orderBy: { sort: 'asc' },
        take: query?.pageSize ?? undefined,
        skip: query?.page && query.pageSize ? (query.page - 1) * query.pageSize : undefined,
      }),
      this.prisma.basePermission.count({ where }),
    ]);

    const list = permissions.map((p) => this.toPermissionInfo(p));
    return { list, total };
  }

  async findTree(): Promise<PermissionTree[]> {
    const cacheKey = 'permission:tree';
    const cached = await this.cache.get<PermissionTree[]>(cacheKey);
    if (cached) return cached;

    const permissions = await this.prisma.basePermission.findMany({
      where: { isDeleted: 0 },
      orderBy: { sort: 'asc' },
    });

    const result = this.buildTree(
      permissions.map((p) => this.toPermissionInfo(p)),
      0,
    ).map((node) => this.toPermissionTree(node));

    await this.cache.set(cacheKey, result, this.cacheTtl);
    return result;
  }

  async findOne(id: number): Promise<PermissionInfo> {
    const cacheKey = `permission:${id}`;
    const cached = await this.cache.get<PermissionInfo>(cacheKey);
    if (cached) return cached;

    const permission = await this.prisma.basePermission.findUnique({
      where: { id, isDeleted: 0 },
      include: { permissionGroups: true },
    });

    if (!permission) {
      throw new NotFoundException(`权限不存在: ${id}`);
    }

    const result = this.toPermissionInfo(permission);

    await this.cache.set(cacheKey, result, this.cacheTtl);
    return result;
  }

  async create(createdBy: bigint, dto: CreatePermissionDto): Promise<PermissionInfo> {
    // 检查权限编码是否已存在
    const exists = await this.prisma.basePermission.findUnique({
      where: { code: dto.code, isDeleted: 0 },
    });
    if (exists) {
      throw new BadRequestException(`权限编码已存在: ${dto.code}`);
    }

    // 检查父权限是否存在
    if (dto.parentId && dto.parentId !== 0) {
      const parent = await this.prisma.basePermission.findUnique({
        where: { id: dto.parentId, isDeleted: 0 },
      });
      if (!parent) {
        throw new BadRequestException(`父权限不存在: ${dto.parentId}`);
      }
    }

    const permission = await this.prisma.basePermission.create({
      data: {
        parentId: dto.parentId ?? 0,
        name: dto.name,
        code: dto.code,
        type: dto.type,
        path: dto.path || null,
        component: dto.component || null,
        icon: dto.icon || null,
        sort: dto.sort ?? 0,
        status: dto.status ?? 1,
        remark: dto.remark || null,
        createdBy,
      },
    });

    await this.cache.del('permission:tree');
    await this.cache.del(`permission:${permission.id}`);

    return this.toPermissionInfo(permission);
  }

  async update(updatedBy: bigint, id: number, dto: UpdatePermissionDto): Promise<PermissionInfo> {
    const permission = await this.prisma.basePermission.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!permission) {
      throw new NotFoundException(`权限不存在: ${id}`);
    }

    // 检查权限编码是否被其他权限使用
    if (dto.code && dto.code !== permission.code) {
      const exists = await this.prisma.basePermission.findUnique({
        where: { code: dto.code, isDeleted: 0 },
      });
      if (exists && Number(exists.id) !== id) {
        throw new BadRequestException(`权限编码已存在: ${dto.code}`);
      }
    }

    // 检查父权限是否存在
    if (dto.parentId !== undefined && dto.parentId !== 0) {
      const parent = await this.prisma.basePermission.findUnique({
        where: { id: dto.parentId, isDeleted: 0 },
      });
      if (!parent) {
        throw new BadRequestException(`父权限不存在: ${dto.parentId}`);
      }

      // 检查循环引用
      if (dto.parentId === id) {
        throw new BadRequestException('不能将自身设置为父权限');
      }
    }

    const updates: any = { ...dto };
    delete updates.code; // 编码不允许修改

    const updated = await this.prisma.basePermission.update({
      where: { id },
      data: {
        ...updates,
        updatedBy,
        updatedAt: new Date(),
      },
    });

    await this.cache.del('permission:tree');
    await this.cache.del(`permission:${id}`);

    return this.toPermissionInfo(updated);
  }

  async remove(id: number): Promise<{ deleted: number }> {
    const permission = await this.prisma.basePermission.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!permission) {
      throw new NotFoundException(`权限不存在: ${id}`);
    }

    // 检查是否有子权限
    const children = await this.prisma.basePermission.findMany({
      where: { parentId: id, isDeleted: 0 },
      select: { id: true },
    });
    if (children.length > 0) {
      throw new BadRequestException(`权限下有 ${children.length} 个子权限，无法删除`);
    }

    await this.prisma.basePermission.update({
      where: { id },
      data: {
        isDeleted: 1,
        deletedBy: permission.updatedBy,
        deletedAt: new Date(),
      },
    });

    await this.cache.del('permission:tree');
    await this.cache.del(`permission:${id}`);

    return { deleted: 1 };
  }

  /**
   * 为权限组分配权限
   */
  async assignPermissionsToGroup(
    updatedBy: bigint,
    dto: PermissionGroupAssignDto,
  ): Promise<{ assigned: number }> {
    const group = await this.prisma.basePermissionGroup.findUnique({
      where: { id: dto.permissionGroupId, isDeleted: 0 },
    });
    if (!group) {
      throw new NotFoundException(`权限组不存在: ${dto.permissionGroupId}`);
    }

    // 获取已分配的权限
    const existing = await this.prisma.mapPermissionGroupPermission.findMany({
      where: { permissionGroupId: dto.permissionGroupId },
      select: { permissionId: true },
    });
    const existingPermissionIds = new Set(existing.map((e) => e.permissionId));

    // 需要新增的关联
    const toAdd = dto.permissionIds.filter(
      (pid) => !existingPermissionIds.has(BigInt(pid)),
    );

    // 需要删除的关联
    const toRemove = Array.from(existingPermissionIds).filter(
      (pid) => !dto.permissionIds.includes(Number(pid)),
    );

    // 批量删除
    if (toRemove.length > 0) {
      await this.prisma.mapPermissionGroupPermission.deleteMany({
        where: {
          permissionGroupId: dto.permissionGroupId,
          permissionId: { in: toRemove },
        },
      });
    }

    // 批量新增
    if (toAdd.length > 0) {
      await this.prisma.$transaction(
        toAdd.map((permissionId) =>
          this.prisma.mapPermissionGroupPermission.create({
            data: {
              permissionGroupId: dto.permissionGroupId,
              permissionId: BigInt(permissionId),
            },
          }),
        ),
      );
    }

    await this.cache.del('permission:tree');
    await this.cache.del(`permission-group:${dto.permissionGroupId}`);

    return { assigned: toAdd.length + toRemove.length };
  }

  /**
   * 获取用户的权限列表
   */
  async getUserPermissions(userId: number): Promise<PermissionInfo[]> {
    const user = await this.prisma.baseUser.findUnique({
      where: { id: userId, isDeleted: 0 },
    });

    if (!user) {
      throw new NotFoundException(`用户不存在: ${userId}`);
    }

    // 获取用户所有角色的ID
    const userRoles = await this.prisma.mapUserRole.findMany({
      where: { userId: BigInt(userId) },
      select: { roleId: true },
    });
    const roleIds = userRoles.map((r) => r.roleId);
    if (roleIds.length === 0) {
      return [];
    }

    const permissions = await this.prisma.basePermission.findMany({
      where: {
        isDeleted: 0,
        permissionGroups: {
          some: {
            permissionGroup: {
              targets: {
                some: {
                  targetType: TargetType.ROLE, // 角色类型
                  targetId: { in: roleIds },
                },
              },
            },
          },
        },
      },
      orderBy: { sort: 'asc' },
    });

    return permissions.map((p) => this.toPermissionInfo(p));
  }

  /**
   * 获取权限组的权限列表
   */
  async getGroupPermissions(groupIds: number[]): Promise<PermissionInfo[]> {
    const permissions = await this.prisma.basePermission.findMany({
      where: {
        isDeleted: 0,
        permissionGroups: {
          some: {
            permissionGroupId: { in: groupIds },
          },
        },
      },
      orderBy: { sort: 'asc' },
    });

    return permissions.map((p) => this.toPermissionInfo(p));
  }

  private buildTree(nodes: PermissionInfo[], rootParentId: number): PermissionInfo[] {
    const map: Record<number, PermissionInfo> = {};
    const result: PermissionInfo[] = [];

    nodes.forEach((node) => {
      map[node.id] = { ...node, children: [] };
    });

    nodes.forEach((node) => {
      const parent = map[node.parentId];
      if (parent && node.parentId !== rootParentId) {
        parent.children?.push(node);
      } else {
        result.push(node);
      }
    });

    return result;
  }

  private toPermissionInfo(data: any): PermissionInfo {
    return {
      id: Number(data.id),
      parentId: Number(data.parentId),
      name: data.name,
      code: data.code,
      type: data.type,
      path: data.path,
      component: data.component,
      icon: data.icon,
      sort: data.sort,
      status: data.status,
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

  private toPermissionTree(node: PermissionInfo): PermissionTree {
    return {
      id: node.id,
      label: node.name,
      value: node.id,
      parentId: node.parentId,
      children: node.children?.map((c) => this.toPermissionTree(c)),
      type: node.type,
      code: node.code,
      path: node.path ?? undefined,
      component: node.component ?? undefined,
      icon: node.icon ?? undefined,
      sort: node.sort,
      status: node.status,
    };
  }
}
