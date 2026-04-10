import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CacheService } from '@/infrastructure/cache/cache.service';

/**
 * 账号验证服务
 *
 * @description
 * 提供账号相关的验证功能：
 * - 账号唯一性验证（用户名、邮箱、手机）
 * - 账号存在性验证
 * - 账号状态验证
 *
 * 使用场景：用户注册、修改资料、导入用户等需要验证账号唯一性的场景
 */
@Injectable()
export class AccountValidationService {
  private readonly logger = new Logger(AccountValidationService.name);
  private readonly cacheTtl = 60; // 1分钟

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /**
   * 验证用户名是否唯一
   */
  async validateUsernameUnique(
    username: string,
    excludeId?: number,
  ): Promise<void> {
    const cacheKey = `validate:username:${username}`;
    const cached = await this.cache.get<boolean>(cacheKey);

    if (cached !== undefined) {
      if (!cached) {
        throw new BadRequestException('用户名已被占用');
      }
      return;
    }

    const where: any = { username, isDeleted: 0 };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const exists = await this.prisma.baseUser.findFirst({ where });

    if (exists) {
      await this.cache.set(cacheKey, false, this.cacheTtl);
      throw new BadRequestException('用户名已被占用');
    }

    await this.cache.set(cacheKey, true, this.cacheTtl);
  }

  /**
   * 验证邮箱是否唯一
   */
  async validateEmailUnique(
    email: string,
    excludeId?: number,
  ): Promise<void> {
    if (!email) return;

    // 格式验证
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('邮箱格式不正确');
    }

    const cacheKey = `validate:email:${email.toLowerCase()}`;
    const cached = await this.cache.get<boolean>(cacheKey);

    if (cached !== undefined) {
      if (!cached) {
        throw new BadRequestException('邮箱已被占用');
      }
      return;
    }

    const where: any = { email, isDeleted: 0 };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const exists = await this.prisma.baseUser.findFirst({ where });

    if (exists) {
      await this.cache.set(cacheKey, false, this.cacheTtl);
      throw new BadRequestException('邮箱已被占用');
    }

    await this.cache.set(cacheKey, true, this.cacheTtl);
  }

  /**
   * 验证手机号是否唯一
   */
  async validatePhoneUnique(
    phone: string,
    excludeId?: number,
  ): Promise<void> {
    if (!phone) return;

    // 格式验证
    if (!this.isValidPhone(phone)) {
      throw new BadRequestException('手机号格式不正确');
    }

    const cacheKey = `validate:phone:${phone}`;
    const cached = await this.cache.get<boolean>(cacheKey);

    if (cached !== undefined) {
      if (!cached) {
        throw new BadRequestException('手机号已被占用');
      }
      return;
    }

    const where: any = { phone, isDeleted: 0 };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const exists = await this.prisma.baseUser.findFirst({ where });

    if (exists) {
      await this.cache.set(cacheKey, false, this.cacheTtl);
      throw new BadRequestException('手机号已被占用');
    }

    await this.cache.set(cacheKey, true, this.cacheTtl);
  }

  /**
   * 验证账号是否存在
   */
  async validateAccountExists(userId: number): Promise<void> {
    const cacheKey = `validate:account:${userId}`;
    const cached = await this.cache.get<boolean>(cacheKey);

    if (cached !== undefined) {
      if (!cached) {
        throw new NotFoundException('账号不存在');
      }
      return;
    }

    const exists = await this.prisma.baseUser.findUnique({
      where: { id: userId, isDeleted: 0 },
    });

    if (!exists) {
      await this.cache.set(cacheKey, false, this.cacheTtl);
      throw new NotFoundException('账号不存在');
    }

    await this.cache.set(cacheKey, true, this.cacheTtl);
  }

  /**
   * 验证账号状态
   */
  async validateAccountStatus(userId: number): Promise<void> {
    const user = await this.prisma.baseUser.findUnique({
      where: { id: userId, isDeleted: 0 },
    });

    if (!user) {
      throw new NotFoundException('账号不存在');
    }

    if (user.status !== 1) {
      throw new BadRequestException('账号已被禁用');
    }
  }

  /**
   * 验证第三方账号是否绑定
   */
  async validateOAuthNotBinded(
    platform: string,
    oauthId: string,
  ): Promise<void> {
    const cacheKey = `validate:oAuth:${platform}:${oauthId}`;
    const cached = await this.cache.get<boolean>(cacheKey);

    if (cached !== undefined) {
      if (!cached) {
        throw new BadRequestException('该第三方账号已被绑定');
      }
      return;
    }

    const fieldMap: Record<string, string> = {
      wechat: 'wechatOpenid',
      dingtalk: 'dingtalkUserid',
      wework: 'weworkUserid',
      github: 'githubId',
    };

    const field = fieldMap[platform];
    if (!field) {
      throw new BadRequestException('不支持的第三方平台');
    }

    const exists = await this.prisma.baseUser.findFirst({
      where: { [field]: oauthId, isDeleted: 0 },
    });

    if (exists) {
      await this.cache.set(cacheKey, false, this.cacheTtl);
      throw new BadRequestException('该第三方账号已被绑定');
    }

    await this.cache.set(cacheKey, true, this.cacheTtl);
  }

  // ==================== 私有方法 ====================

  /**
   * 验证邮箱格式
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证手机号格式
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 清除验证缓存
   */
  async clearValidateCache(key: string): Promise<void> {
    await this.cache.del(key);
  }

  /**
   * 清除所有验证缓存（用于账号更新后）
   */
  async clearAllValidateCache(userId: number): Promise<void> {
    const patterns = [
      `validate:username:*`,
      `validate:email:*`,
      `validate:phone:*`,
      `validate:account:${userId}`,
    ];

    for (const pattern of patterns) {
      const keys = await this.cache.keys(pattern);
      for (const key of keys) {
        await this.cache.del(key);
      }
    }
  }
}
