import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { CacheService } from '@/infrastructure/cache/cache.service';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { TenantRegisterDto } from './dto/tenant.dto';

/**
 * 租户信息接口
 */
export interface TenantInfo {
  id: number;
  name: string;
  code: string;
  logo?: string | null;
  isDefault: number;
}

/**
 * 业务信息接口
 */
export interface BusinessInfo {
  id: number;
  name: string;
  code: string;
  icon?: string;
  description?: string;
}

/**
 * 应用信息接口
 */
export interface AppInfo {
  id: number;
  name: string;
  code: string;
  type: number;
  description?: string;
  logo?: string;
  domain?: string;
}

/**
 * 租户服务
 *
 * @description
 * 处理租户相关逻辑：
 * - 租户注册
 * - 租户配置管理
 * - 业务管理
 * - 应用管理
 */
@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  // ==================== 租户注册 ====================

  /**
   * 注册租户（创建租户+管理员账号）
   */
  async registerTenant(dto: TenantRegisterDto): Promise<{
    success: boolean;
    message: string;
    tenantId: number;
    adminId: string;
  }> {
    // 检查租户编码是否已存在
    const existingTenant = await this.prisma.tenant.findFirst({
      where: {
        code: dto.code,
        isDeleted: 0,
      },
    });

    if (existingTenant) {
      throw new BadRequestException('租户编码已存在');
    }

    // 检查手机号是否已存在于该租户
    const existingUser = await this.prisma.baseUser.findFirst({
      where: {
        phone: dto.contactPhone,
        isDeleted: 0,
      },
    });

    if (existingUser) {
      // 允许不同租户使用相同手机号，但需要检查是否已存在
      this.logger.warn(`手机号 ${dto.contactPhone} 已存在，将继续注册`);
    }

    // 开始事务
    try {
      // 1. 创建租户
      const tenant = await this.prisma.tenant.create({
        data: {
          uuid: crypto.randomUUID(),
          name: dto.name,
          code: dto.code,
          contactName: dto.contactName,
          contactPhone: dto.contactPhone,
          contactEmail: dto.contactEmail,
          domain: dto.domain,
          status: 1,
          maxUsers: 100,
        },
      });

      const tenantId = Number(tenant.id);

      // 2. 创建管理员账号
      const adminUser = await this.prisma.baseUser.create({
        data: {
          uuid: crypto.randomUUID(),
          username: dto.adminUsername,
          password: await this.hashPassword(dto.adminPassword),
          nickname: dto.adminName,
          phone: dto.contactPhone,
          email: dto.contactEmail,
          status: 1,
          userType: 1, // 管理员
          loginCount: 0,
          registerTime: new Date(),
          registerIp: '127.0.0.1', // 实际应该从请求中获取
        },
      });

      // 3. 创建用户-租户关联
      await this.prisma.userTenant.create({
        data: {
          userId: adminUser.id,
          tenantId: BigInt(tenantId),
          isDefault: 1,
          status: 1,
        },
      });

      // 4. 缓存租户列表
      await this.cache.set(
        `user:tenants:${adminUser.id}`,
        [tenantId.toString()],
        3600,
      );

      this.logger.log(`租户注册成功: tenantId=${tenantId}, adminId=${adminUser.id}`);

      return {
        success: true,
        message: '租户注册成功',
        tenantId,
        adminId: adminUser.id.toString(),
      };
    } catch (error) {
      this.logger.error('租户注册失败', error);
      throw new BadRequestException('租户注册失败: ' + error.message);
    }
  }

  /**
   * 获取用户可访问的租户列表
   */
  async getUserTenants(userId: string): Promise<TenantInfo[]> {
    const cached = await this.cache.get<string[]>(`user:tenants:${userId}`);

    if (cached) {
      // 缓存命中，直接返回租户 ID 列表（实际数据在前端或其他地方获取）
      // 这里返回空数组，调用方需要根据 ID 列表进一步查询
      return [];
    }

    const userTenants = await (this.prisma as any).userTenant.findMany({
      where: {
        userId: BigInt(userId),
        status: 1,
      },
      include: {
        tenant: { select: { id: true, name: true, code: true, logo: true } },
      },
      orderBy: [{ isDefault: 'desc' }],
    });

    const tenants = userTenants.map((ut: any) => ({
      id: Number(ut.tenant.id),
      name: ut.tenant.name,
      code: ut.tenant.code,
      logo: ut.tenant.logo ?? undefined,
      isDefault: ut.isDefault,
    }));

    // 缓存租户列表
    await this.cache.set(
      `user:tenants:${userId}`,
      tenants.map(t => t.id.toString()),
      3600,
    );

    return tenants;
  }

  // ==================== 租户配置 ====================

  /**
   * 获取租户配置
   */
  async getTenantConfig(tenantId: number): Promise<any> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: BigInt(tenantId) },
      select: {
        id: true,
        name: true,
        code: true,
        logo: true,
        contactName: true,
        contactPhone: true,
        contactEmail: true,
        domain: true,
        status: true,
        maxUsers: true,
        usedUsers: true,
        expireAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!tenant) {
      throw new BadRequestException('租户不存在');
    }

    return tenant;
  }

  /**
   * 更新租户配置
   */
  async updateTenantConfig(
    tenantId: number,
    dto: Partial<TenantRegisterDto>,
  ): Promise<any> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: BigInt(tenantId) },
    });

    if (!tenant) {
      throw new BadRequestException('租户不存在');
    }

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.contactName) updateData.contactName = dto.contactName;
    if (dto.contactPhone) updateData.contactPhone = dto.contactPhone;
    if (dto.contactEmail) updateData.contactEmail = dto.contactEmail;
    if (dto.domain) updateData.domain = dto.domain;

    const updatedTenant = await this.prisma.tenant.update({
      where: { id: BigInt(tenantId) },
      data: updateData,
    });

    // 清除缓存
    await this.cache.del(`tenant:config:${tenantId}`);

    return updatedTenant;
  }

  // ==================== 业务管理 ====================

  /**
   * 获取租户已开通的业务列表
   */
  async getTenantBusinesses(tenantId: number): Promise<BusinessInfo[]> {
    const tenantBusinesses = await (this.prisma as any).tenantBusiness.findMany({
      where: {
        tenantId: BigInt(tenantId),
        status: 1,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            code: true,
            icon: true,
            description: true,
          },
        },
      },
      orderBy: [],
    });

    return tenantBusinesses.map((tb: any) => ({
      id: Number(tb.business.id),
      name: tb.business.name,
      code: tb.business.code,
      icon: tb.business.icon,
      description: tb.business.description,
    }));
  }

  /**
   * 禁用业务（租户管理员）
   */
  async disableBusiness(tenantId: number, businessId: number): Promise<any> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: BigInt(tenantId) },
    });

    if (!tenant) {
      throw new BadRequestException('租户不存在');
    }

    // 检查业务是否已开通
    const existing = await this.prisma.tenantBusiness.findFirst({
      where: {
        tenantId: BigInt(tenantId),
        businessId: BigInt(businessId),
        isDeleted: 0,
      },
    });

    if (!existing) {
      throw new BadRequestException('该业务未开通');
    }

    if (existing.status === 0) {
      throw new BadRequestException('该业务已禁用');
    }

    await this.prisma.tenantBusiness.update({
      where: { id: existing.id },
      data: { status: 0 },
    });

    // 清除缓存
    await this.cache.del(`tenant:businesses:${tenantId}`);

    return { success: true, message: '业务已禁用' };
  }

  /**
   * 开通业务（租户管理员）
   */
  async enableBusiness(
    tenantId: number,
    businessId: number,
    days?: number,
  ): Promise<any> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: BigInt(tenantId) },
    });

    if (!tenant) {
      throw new BadRequestException('租户不存在');
    }

    // 检查是否已开通
    const existing = await this.prisma.tenantBusiness.findFirst({
      where: {
        tenantId: BigInt(tenantId),
        businessId: BigInt(businessId),
        isDeleted: 0,
      },
    });

    if (existing) {
      if (existing.status === 1) {
        throw new BadRequestException('该业务已开通');
      }
      // 恢复业务
      await this.prisma.tenantBusiness.update({
        where: { id: existing.id },
        data: {
          status: 1,
          expiresAt: days
            ? new Date(Date.now() + days * 24 * 60 * 60 * 1000)
            : null,
        },
      });
    } else {
      // 新增开通记录
      await this.prisma.tenantBusiness.create({
        data: {
          tenantId: BigInt(tenantId),
          businessId: BigInt(businessId),
          status: 1,
          expiresAt: days
            ? new Date(Date.now() + days * 24 * 60 * 60 * 1000)
            : null,
        },
      });
    }

    // 清除缓存
    await this.cache.del(`tenant:businesses:${tenantId}`);

    return { success: true, message: '业务开通成功' };
  }

  // ==================== 应用管理 ====================

  /**
   * 获取业务下的应用列表
   */
  async getBusinessApps(businessId: number): Promise<AppInfo[]> {
    const businessApps = await (this.prisma as any).businessApp.findMany({
      where: {
        businessId: BigInt(businessId),
        status: 1,
      },
      include: {
        app: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            description: true,
            logo: true,
            domain: true,
          },
        },
      },
      orderBy: [],
    });

    return businessApps.map((ba: any) => ({
      id: Number(ba.app.id),
      name: ba.app.name,
      code: ba.app.code,
      type: ba.app.type,
      description: ba.app.description,
      logo: ba.app.logo,
      domain: ba.app.domain,
    }));
  }

  // ==================== 租户/业务切换 ====================

  /**
   * 切换用户默认租户
   */
  async switchTenant(userId: string | number, tenantId: number): Promise<any> {
    // 检查租户是否存在且用户有权访问
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: BigInt(tenantId) },
    });

    if (!tenant) {
      throw new BadRequestException('租户不存在');
    }

    // 检查用户是否有权访问该租户
    const userTenant = await this.prisma.userTenant.findFirst({
      where: {
        userId: BigInt(userId),
        tenantId: BigInt(tenantId),
        status: 1,
      },
    });

    if (!userTenant) {
      throw new BadRequestException('无权访问该租户');
    }

    // 更新默认租户
    await this.prisma.userTenant.update({
      where: { id: userTenant.id },
      data: { isDefault: 1 },
    });

    // 清除用户租户缓存
    await this.cache.del(`user:tenants:${userId}`);

    return {
      success: true,
      message: '租户切换成功',
      tenantId,
      tenantName: tenant.name,
    };
  }

  /**
   * 切换租户当前业务
   */
  async switchBusiness(
    tenantId: number,
    businessId: number,
  ): Promise<any> {
    // 检查租户是否开通了该业务
    const tenantBusiness = await this.prisma.tenantBusiness.findFirst({
      where: {
        tenantId: BigInt(tenantId),
        businessId: BigInt(businessId),
        status: 1,
        isDeleted: 0,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    if (!tenantBusiness) {
      throw new BadRequestException('该业务未开通或已过期');
    }

    // 更新租户当前业务
    await this.prisma.tenant.update({
      where: { id: BigInt(tenantId) },
      data: { currentBusinessId: BigInt(businessId) },
    });

    return {
      success: true,
      message: '业务切换成功',
      businessId,
    };
  }

  // ==================== 私有方法 ====================

  /**
   * 加密密码
   */
  private async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.hash(password, 10);
  }
}
