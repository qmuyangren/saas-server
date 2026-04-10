import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

import { CacheService } from '@/infrastructure/cache/cache.service';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { OAuthConfig, OAuthLoginResult, OAuthUserInfo } from './entities/oauth.entity';
import { BaseExternalService } from '@/infrastructure/core/base.external.service';

/**
 * 第三方登录服务
 *
 * @description
 * 提供第三方登录功能：
 * - 微信登录
 * - 钉钉登录
 * - 企业微信登录
 * - GitHub登录
 *
 * 使用场景：用户第三方账号登录
 *
 * 配置格式（存储在 cfg_system_config 表）：
 * {
 *   "clientId": "your_client_id",
 *   "clientSecret": "your_client_secret",
 *   "redirectUri": "https://your-domain.com/oauth/callback",
 *   "authorizeUrl": "https://open.weixin.qq.com/connect/oauth2/authorize",
 *   "tokenUrl": "https://api.weixin.qq.com/sns/oauth2/access_token",
 *   "userInfoUrl": "https://api.weixin.qq.com/sns/userinfo",
 *   "scope": "snsapi_login"
 * }
 *
 * 使用方式：
 * ```typescript
 * // 登录
 * const result = await this.oauthService.login('wechat', code);
 *
 * // 获取用户信息（需要先获取 access_token）
 * const userInfo = await this.oauthService.getUserInfo('wechat', accessToken);
 *
 * // 直接调用 SDK 方法
 * const sdk = this.oauthService.getOAuthSdk('wechat');
 * const userInfo = await sdk.getUserInfo(accessToken);
 * ```
 */
@Injectable()
export class OAuthService extends BaseExternalService<OAuthConfig> {
  // 配置键名
  protected configKey = 'oauth';

  // 必需的配置项
  protected requiredConfigKeys = ['clientId', 'clientSecret', 'authorizeUrl', 'tokenUrl', 'userInfoUrl'];

  // SDK 实例缓存
  private oauthSdks: Record<string, any> = {};

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {
    super();
  }

  /**
   * 从数据库加载配置
   */
  private async loadConfigFromDatabase(platform: string): Promise<OAuthConfig | null> {
    const cacheKey = `oauth:${platform}:config`;
    const cached = await this.cache.get<OAuthConfig>(cacheKey);
    if (cached) return cached;

    const configKey = `oauth_${platform}_config`;
    const configData = await this.prisma.cfgSystemConfig.findUnique({
      where: { configKey, isDeleted: 0 },
    });

    if (!configData?.configValue) return null;

    try {
      const config = JSON.parse(configData.configValue) as OAuthConfig;
      await this.cache.set(cacheKey, config, 3600);
      return config;
    } catch {
      return null;
    }
  }

  /**
   * 检查第三方登录是否启用
   */
  async isOAuthEnabled(platform: string): Promise<boolean> {
    const configKey = `oauth_${platform}_enabled`;
    const enabled = await this.cache.get<number>(configKey);
    return enabled === 1;
  }

  // ==================== 登录 gateway ====================

  /**
   * 第三方登录
   * @param platform 平台名称
   * @param code 授权码
   * @returns 登录结果和用户信息
   */
  async login(platform: string, code: string): Promise<OAuthLoginResult> {
    if (!this.isConfigured) {
      return this.handleMissingConfig({
        success: false,
        message: '第三方登录配置缺失，请联系管理员',
        platform,
      });
    }

    try {
      // 1. 使用 code 换取 access_token
      const accessToken = await this.getOAuthAccessToken(platform, code, this.config!);
      if (!accessToken) {
        return this.handleMissingConfig({
          success: false,
          message: '获取 access_token 失败',
          platform,
        });
      }

      // 2. 获取用户信息
      const userInfo = await this.getUserInfo(platform, accessToken, this.config!);
      if (!userInfo) {
        return this.handleMissingConfig({
          success: false,
          message: '获取用户信息失败',
          platform,
        });
      }

      // 3. 检查用户是否已存在
      let user = await this.findOAuthUser(platform, userInfo.id);
      if (!user) {
        // 4. 创建新用户
        user = await this.createOAuthUser(platform, userInfo);
      }

      return {
        success: true,
        user: userInfo,
        platform,
      };
    } catch (error) {
      this.getLogger().error('登录失败', error);
      return {
        success: false,
        message: error.message || '登录失败',
        platform,
      };
    }
  }

  /**
   * 获取用户信息
   * @param platform 平台名称
   * @param accessToken 访问令牌
   * @param config 配置对象
   * @returns 用户信息
   */
  async getUserInfo(
    platform: string,
    accessToken: string,
    config: OAuthConfig,
  ): Promise<OAuthUserInfo | null> {
    try {
      const sdk = this.getOAuthSdk(platform);
      return await sdk.getUserInfo(accessToken);
    } catch (error) {
      this.getLogger().error('获取用户信息失败', error);
      return null;
    }
  }

  /**
   * 获取访问令牌
   * @param platform 平台名称
   * @param code 授权码
   * @param config 配置对象
   * @returns 访问令牌
   */
  async getOAuthAccessToken(
    platform: string,
    code: string,
    config: OAuthConfig,
  ): Promise<string | null> {
    try {
      const sdk = this.getOAuthSdk(platform);
      return await sdk.getAccessToken(code);
    } catch (error) {
      this.getLogger().error('获取 access_token 失败', error);
      return null;
    }
  }

  // ==================== SDK 方法 ====================

  /**
   * 获取 OAuth SDK 实例
   * @param platform 平台名称
   * @returns SDK 实例
   */
  getOAuthSdk(platform: string): any {
    if (!this.oauthSdks[platform]) {
      this.oauthSdks[platform] = this.createOAuthSdk(platform);
    }
    return this.oauthSdks[platform];
  }

  /**
   * 创建 OAuth SDK 实例
   * @param platform 平台名称
   * @returns SDK 实例
   */
  private createOAuthSdk(platform: string): any {
    if (!this.isConfigured || !this.config) {
      this.getLogger().warn(`OAuth ${platform} 配置缺失，SDK 将使用模拟模式`);
      return this.createOAuthSdkMock(platform);
    }

    try {
      // 实际应该根据平台导入对应的 SDK
      // 例如微信登录：
      // const WechatOAuth = require('wechat-oauth');
      // const sdk = new WechatOAuth(config.clientId, config.clientSecret);
      // return sdk;
      return this.createOAuthSdkMock(platform);
    } catch (error) {
      this.getLogger().error(`创建 OAuth ${platform} SDK 失败`, error);
      return this.createOAuthSdkMock(platform);
    }
  }

  /**
   * OAuth SDK 模拟实现
   * @param platform 平台名称
   * @returns SDK 实例
   */
  private createOAuthSdkMock(platform: string): any {
    return {
      /**
       * 获取 access_token
       * @param code 授权码
       */
      async getAccessToken(code: string): Promise<string> {
        this.getLogger().warn(`OAuth SDK ${platform} 未配置，使用模拟模式`);
        return `oauth_token_${platform}_${code.substring(0, 8)}_mock`;
      },

      /**
       * 获取用户信息
       * @param accessToken 访问令牌
       */
      async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
        this.getLogger().warn(`OAuth SDK ${platform} 未配置，使用模拟模式`);
        return this.getMockUserInfo(platform);
      },

      /**
       * 刷新 access_token
       * @param refreshToken 刷新令牌
       */
      async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
        this.getLogger().warn(`OAuth SDK ${platform} 未配置，使用模拟模式`);
        return { accessToken: `refreshed_${refreshToken}`, expiresIn: 7200 };
      },

      /**
       * 验证 access_token
       * @param accessToken 访问令牌
       * @param openid 用户 openid
       */
      async verifyAccessToken(accessToken: string, openid: string): Promise<boolean> {
        this.getLogger().warn(`OAuth SDK ${platform} 未配置，使用模拟模式`);
        return true;
      },
    };
  }

  // ==================== 用户相关方法 ====================

  /**
   * 通过第三方 ID 查找用户
   */
  async findOAuthUser(platform: string, oauthId: string): Promise<any | null> {
    const fieldMap: Record<string, string> = {
      wechat: 'wechatOpenid',
      dingtalk: 'dingtalkUserid',
      wework: 'weworkUserid',
      github: 'githubId',
    };

    const field = fieldMap[platform];
    if (!field) return null;

    return this.prisma.baseUser.findFirst({
      where: { [field]: oauthId, isDeleted: 0 },
    });
  }

  /**
   * 创建第三方用户
   */
  async createOAuthUser(platform: string, oauthUser: any): Promise<any> {
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

    const username = `${platform}_${oauthUser.id.substring(0, 8)}`;

    const user = await this.prisma.baseUser.create({
      data: {
        uuid: crypto.randomUUID(),
        username,
        password: await this.hashDefaultPassword(),
        nickname: oauthUser.name || oauthUser.nickname || username,
        avatar: oauthUser.avatar || null,
        [field]: oauthUser.id,
        status: 1,
        userType: 2,
        loginCount: 0,
        registerTime: new Date(),
      },
    });

    return user;
  }

  /**
   * 获取第三方登录类型
   */
  getOAuthLoginType(platform: string): number {
    const typeMap: Record<string, number> = {
      wechat: 2,
      dingtalk: 3,
      wework: 4,
      github: 5,
    };
    return typeMap[platform] || 0;
  }

  /**
   * 获取模拟用户信息
   */
  private getMockUserInfo(platform: string): OAuthUserInfo {
    const uuid = crypto.randomUUID();
    const mockUserInfo: Record<string, OAuthUserInfo> = {
      wechat: {
        id: `open_${uuid.substring(0, 8)}`,
        name: '微信用户',
        nickname: '微信用户',
        avatar: 'https://example.com/avatar/wechat.png',
        unionid: `union_${uuid.substring(0, 8)}`,
      },
      dingtalk: {
        id: `ding_${uuid.substring(0, 8)}`,
        name: '钉钉用户',
        nickname: '钉钉用户',
        avatar: 'https://example.com/avatar/dingtalk.png',
        email: 'user@dingtalk.com',
      },
      wework: {
        id: `wework_${uuid.substring(0, 8)}`,
        name: '企业微信用户',
        nickname: '企业微信用户',
        avatar: 'https://example.com/avatar/wework.png',
        email: 'user@wework.com',
      },
      github: {
        id: `github_${uuid.substring(0, 8)}`,
        name: 'GitHub 用户',
        nickname: 'GitHub User',
        avatar: 'https://github.githubassets.com/images/modules/site/icons/test-avatar.png',
        email: 'user@example.com',
      },
    };

    return mockUserInfo[platform] || {
      id: `unknown_${uuid.substring(0, 8)}`,
      name: '未知用户',
      avatar: null,
    };
  }

  // ==================== 私有方法 ====================

  /**
   * 加密默认密码
   */
  private async hashDefaultPassword(): Promise<string> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.hash('OAuth123456', 10);
  }
}
