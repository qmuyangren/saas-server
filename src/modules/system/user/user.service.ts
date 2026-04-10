import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CacheService } from '@/infrastructure/cache/cache.service';

import { CreateUserDto, UpdateUserDto, QueryUserDto, ResetPasswordDto } from './dto/user.dto';
import { UserInfo } from './entities/user.entity';
import { AccountValidationService } from '../captcha/services/account-validation.service';

/**
 * 用户服务
 *
 * @description
 * 用户业务逻辑处理：
 * - 用户 CRUD 操作
 * - 密码加密管理
 * - UUID 生成
 */
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly accountValidation: AccountValidationService,
  ) {}

  private readonly cacheTtl = 3600; // 1小时

  /**
   * 获取用户列表
   *
   * @param query 查询参数
   * @returns 用户列表和总数
   */
  async findAll(query: QueryUserDto): Promise<{ list: UserInfo[]; total: number }> {
    const where: any = { isDeleted: 0 };
    if (query.keyword) {
      where.OR = [
        { username: { contains: query.keyword, mode: 'insensitive' } },
        { nickname: { contains: query.keyword, mode: 'insensitive' } },
        { phone: { contains: query.keyword } },
        { email: { contains: query.keyword } },
      ];
    }
    if (query.status !== undefined) where.status = query.status;
    if (query.companyId) where.companyId = query.companyId;
    if (query.departmentId) where.departmentId = query.departmentId;

    const [list, total] = await this.prisma.$transaction([
      this.prisma.baseUser.findMany({
        where,
        skip: query?.page && query.pageSize ? (query.page - 1) * query.pageSize : undefined,
        take: query?.pageSize ?? undefined,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.baseUser.count({ where }),
    ]);

    return {
      list: list.map((u) => this.toEntity(u)),
      total,
    };
  }

  /**
   * 获取用户详情
   *
   * @param id 用户ID
   * @returns 用户信息
   */
  async findOne(id: number): Promise<UserInfo> {
    const cacheKey = `user:${id}`;
    const cached = await this.cache.get<UserInfo>(cacheKey);
    if (cached) return cached;

    const user = await this.prisma.baseUser.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!user) {
      throw new NotFoundException(`用户不存在: ${id}`);
    }

    const result = this.toEntity(user);
    await this.cache.set(cacheKey, result, this.cacheTtl);
    return result;
  }

  /**
   * 通过 UUID 获取用户详情
   *
   * @param uuid 用户UUID
   * @returns 用户信息
   */
  async findByUuid(uuid: string): Promise<UserInfo> {
    const user = await this.prisma.baseUser.findUnique({
      where: { uuid, isDeleted: 0 },
    });
    if (!user) {
      throw new NotFoundException(`用户不存在: ${uuid}`);
    }
    return this.toEntity(user);
  }

  /**
   * 创建用户
   *
   * @param createdBy 创建人ID
   * @param dto 用户数据
   * @returns 创建的用户
   */
  async create(createdBy: bigint, dto: CreateUserDto, tenantId: bigint = BigInt(1)): Promise<UserInfo> {
    // 验证账号唯一性
    await this.accountValidation.validateUsernameUnique(dto.username);
    if (dto.email) {
      await this.accountValidation.validateEmailUnique(dto.email);
    }
    if (dto.phone) {
      await this.accountValidation.validatePhoneUnique(dto.phone);
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // 检查关联数据是否存在
    if (dto.companyId) {
      const company = await this.prisma.baseCompany.findUnique({
        where: { id: dto.companyId, isDeleted: 0 },
      });
      if (!company) {
        throw new BadRequestException(`公司不存在: ${dto.companyId}`);
      }
    }

    if (dto.departmentId) {
      const department = await this.prisma.baseDepartment.findUnique({
        where: { id: dto.departmentId, isDeleted: 0 },
      });
      if (!department) {
        throw new BadRequestException(`部门不存在: ${dto.departmentId}`);
      }
    }

    if (dto.positionId) {
      const position = await this.prisma.basePosition.findUnique({
        where: { id: dto.positionId, isDeleted: 0 },
      });
      if (!position) {
        throw new BadRequestException(`岗位不存在: ${dto.positionId}`);
      }
    }

    const user = await this.prisma.baseUser.create({
      data: {
        uuid: uuidv4(),
        username: dto.username,
        password: passwordHash,
        nickname: dto.nickname || null,
        avatar: dto.avatar || null,
        phone: dto.phone || null,
        email: dto.email || null,
        status: dto.status ?? 1,
        userType: dto.userType ?? 2,
        companyId: dto.companyId || null,
        departmentId: dto.departmentId || null,
        positionId: dto.positionId || null,
        wechatOpenid: null,
        dingtalkUserid: null,
        weworkUserid: null,
        githubId: null,
        lastLoginIp: null,
        lastLoginTime: null,
        loginCount: 0,
        registerTime: new Date(),
        registerIp: null,
        tokenVersion: 1,
        passwordExpireTime: null,
        createdBy,
        version: 1,
      },
    });

    // 清除缓存
    await this.cache.del('users:all');
    await this.accountValidation.clearAllValidateCache(Number(user.id));

    return this.toEntity(user);
  }

  /**
   * 更新用户
   *
   * @param updatedBy 更新人ID
   * @param id 用户ID
   * @param dto 用户数据
   * @returns 更新后的用户
   */
  async update(updatedBy: bigint, id: number, dto: UpdateUserDto): Promise<UserInfo> {
    const user = await this.prisma.baseUser.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!user) {
      throw new NotFoundException(`用户不存在: ${id}`);
    }

    // 验证账号唯一性（排除当前用户）
    if (dto.phone && dto.phone !== user.phone) {
      await this.accountValidation.validatePhoneUnique(dto.phone, id);
    }
    if (dto.email && dto.email !== user.email) {
      await this.accountValidation.validateEmailUnique(dto.email, id);
    }

    const updates: any = { ...dto };

    const updated = await this.prisma.baseUser.update({
      where: { id },
      data: {
        ...updates,
        updatedBy,
        updatedAt: new Date(),
        version: { increment: 1 },
      },
    });

    // 清除缓存
    await this.cache.del(`user:${id}`);
    await this.accountValidation.clearAllValidateCache(id);

    return this.toEntity(updated);
  }

  /**
   * 删除用户
   *
   * @param id 用户ID
   * @returns 删除数量
   */
  async remove(id: number): Promise<{ deleted: number }> {
    const user = await this.prisma.baseUser.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!user) {
      throw new NotFoundException(`用户不存在: ${id}`);
    }

    await this.prisma.baseUser.update({
      where: { id },
      data: {
        isDeleted: 1,
        deletedBy: user.updatedBy,
        deletedAt: new Date(),
      },
    });

    // 清除缓存
    await this.cache.del(`user:${id}`);

    return { deleted: 1 };
  }

  /**
   * 重置密码
   *
   * @param updatedBy 更新人ID
   * @param id 用户ID
   * @param dto 密码数据
   * @returns 操作结果
   */
  async resetPassword(
    updatedBy: bigint,
    id: number,
    dto: ResetPasswordDto,
  ): Promise<{ success: boolean }> {
    const user = await this.prisma.baseUser.findUnique({
      where: { id, isDeleted: 0 },
    });
    if (!user) {
      throw new NotFoundException(`用户不存在: ${id}`);
    }

    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.baseUser.update({
      where: { id },
      data: {
        password: passwordHash,
        updatedBy,
        updatedAt: new Date(),
        passwordExpireTime: dto.forceChange ? new Date() : null,
      },
    });

    // 清除缓存
    await this.cache.del(`user:${id}`);

    return { success: true };
  }

  /**
   * 将 Prisma 模型转换为实体
   *
   * @param data Prisma 模型
   * @returns 实体对象
   */
  private toEntity(data: any): UserInfo {
    return {
      id: Number(data.id),
      uuid: data.uuid,
      username: data.username,
      nickname: data.nickname,
      avatar: data.avatar,
      phone: data.phone,
      email: data.email,
      status: data.status,
      userType: data.userType,
      companyId: data.companyId ? Number(data.companyId) : null,
      departmentId: data.departmentId ? Number(data.departmentId) : null,
      positionId: data.positionId ? Number(data.positionId) : null,
      wechatOpenid: data.wechatOpenid,
      dingtalkUserid: data.dingtalkUserid,
      weworkUserid: data.weworkUserid,
      githubId: data.githubId,
      lastLoginIp: data.lastLoginIp,
      lastLoginTime: data.lastLoginTime,
      loginCount: data.loginCount,
      registerTime: data.registerTime,
      registerIp: data.registerIp,
      tokenVersion: data.tokenVersion,
      passwordExpireTime: data.passwordExpireTime,
      createdBy: data.createdBy ? Number(data.createdBy) : null,
      createdAt: data.createdAt,
      updatedBy: data.updatedBy ? Number(data.updatedBy) : null,
      updatedAt: data.updatedAt,
      isDeleted: data.isDeleted,
      deletedBy: data.deletedBy ? Number(data.deletedBy) : null,
      deletedAt: data.deletedAt,
      version: data.version,
    };
  }
}
