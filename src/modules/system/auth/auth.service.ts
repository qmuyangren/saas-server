import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

import { CacheService } from '@/infrastructure/cache/cache.service';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { OAuthService } from '@/infrastructure/oauth/oauth.service';
import { OAuthLoginResult } from '@/infrastructure/oauth/entities/oauth.entity';
import { LoginAccountDto, LoginWechatQrcodeDto, LoginThirdpartyDto } from './dto/login.dto';
import { JwtStrategy, JwtPayload } from '@/common/strategy/jwt.strategy';
import { rsaDecrypt } from '@/common/utils/rsa.util';

/**
 * 客户端配置接口
 */
interface ClientConfig {
  clientId: string;
  name: string;
  logo?: string;
  themeColor?: string;
  enableLoginMethods?: string[];
  enableCaptcha?: boolean;
}

/**
 * 微信扫码登录状态
 */
interface WechatLoginSession {
  state: string;
  clientId: string;
  openid: string;
  userInfo?: any;
  status: 'pending' | 'scanned' | 'confirmed' | 'completed' | 'expired';
  scanTime?: string;
  confirmTime?: string;
  userId?: string;
}

/**
 * 登录结果接口
 */
interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    nickname: string;
    avatar: string;
  };
}

/**
 * 租户信息接口
 */
interface TenantInfo {
  id: number;
  name: string;
  code: string;
  logo?: string | null;
  isDefault: number;
}

/**
 * 认证服务
 *
 * @description
 * 处理用户认证相关逻辑：
 * - 账密登录（支持多租户）
 * - 微信扫码登录
 * - 第三方登录
 * - Token 生成和验证
 * - 设备管理
 * - 租户切换
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // 客户端配置映射
  private readonly clientConfigs: Record<string, ClientConfig> = {
    business_a_web: {
      clientId: 'business_a_web',
      name: '业务A前端',
      themeColor: '#1890ff',
      enableLoginMethods: ['account', 'wechat'],
      enableCaptcha: true,
    },
    business_a_mobile: {
      clientId: 'business_a_mobile',
      name: '业务A移动端',
      themeColor: '#1890ff',
      enableLoginMethods: ['account', 'wechat'],
      enableCaptcha: false,
    },
    business_b_web: {
      clientId: 'business_b_web',
      name: '业务B前端',
      themeColor: '#52c41a',
      enableLoginMethods: ['account', 'wechat', 'dingtalk'],
      enableCaptcha: true,
    },
    business_c_web: {
      clientId: 'business_c_web',
      name: '业务C前端',
      themeColor: '#fa8c16',
      enableLoginMethods: ['account', 'wechat'],
      enableCaptcha: true,
    },
    admin_web: {
      clientId: 'admin_web',
      name: '后台管理前端',
      themeColor: '#0052d9',
      enableLoginMethods: ['account', 'wechat'],
      enableCaptcha: true,
    },
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly jwtStrategy: JwtStrategy,
    private readonly oauthService: OAuthService,
  ) {}

  // ==================== 系统配置 ====================

  /**
   * 获取系统配置（基于 client_id）
   */
  async getSystemConfig(clientId: string): Promise<{
    name: string;
    logo?: string;
    themeColor: string;
    enableLoginMethods: string[];
    enableCaptcha: boolean;
    captchaType?: string;
  }> {
    const clientConfig = this.clientConfigs[clientId];
    if (!clientConfig) {
      throw new BadRequestException('无效的客户端ID');
    }

    // 检查验证码是否启用
    const captchaEnabled = await this.cache.get<number>('login:captcha:enabled');
    const enableCaptcha = !!(clientConfig.enableCaptcha && (captchaEnabled === 1));

    return {
      name: clientConfig.name,
      logo: clientConfig.logo,
      themeColor: clientConfig.themeColor || '#1890ff',
      enableLoginMethods: clientConfig.enableLoginMethods || [],
      enableCaptcha,
      captchaType: 'slider',
    };
  }

  /**
   * 获取第三方登录配置（基于 client_id）
   */
  async getThirdPartyConfig(clientId: string): Promise<{
    wechat: { enabled: boolean; name: string; clientId: string };
    dingtalk: { enabled: boolean; name: string; clientId: string };
    github: { enabled: boolean; name: string; clientId: string };
  }> {
    const clientConfig = this.clientConfigs[clientId];
    if (!clientConfig) {
      throw new BadRequestException('无效的客户端ID');
    }

    const enabledLoginMethods = clientConfig.enableLoginMethods || [];

    return {
      wechat: {
        enabled: enabledLoginMethods.includes('wechat') && this.oauthService.isReady(),
        name: '微信',
        clientId: clientId,
      },
      dingtalk: {
        enabled: enabledLoginMethods.includes('dingtalk') && this.oauthService.isReady(),
        name: '钉钉',
        clientId: clientId,
      },
      github: {
        enabled: enabledLoginMethods.includes('github') && this.oauthService.isReady(),
        name: 'GitHub',
        clientId: clientId,
      },
    };
  }

  // ==================== 账密登录 ====================

  /**
   * 账密登录（支持多租户）
   * 1. 验证用户凭据
   * 2. 获取用户可访问的租户列表
   * 3. 生成 token（包含租户信息）
   * 4. 保存设备信息
   */
  async loginAccount(dto: LoginAccountDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      username: string;
      nickname: string;
      avatar: string;
    };
    tenants: TenantInfo[];
    needSelectTenant: boolean;
    defaultTenant?: TenantInfo;
  }> {
    // 检查验证码
    if (dto.captchaId && dto.captchaValue) {
      // 验证码逻辑可以在这里添加
    }

    // 解密密码（如果前端使用了 RSA 加密）
    const decryptedPassword = await this.decryptPassword(dto.password);

    // 查询用户
    const user = await this.prisma.baseUser.findFirst({
      where: {
        username: dto.account,
        isDeleted: 0,
        status: 1,
      },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 验证密码（使用 bcrypt 验证解密后的密码）
    const valid = bcrypt.compareSync(decryptedPassword, user.password);
    if (!valid) {
      throw new BadRequestException('密码错误');
    }

    // 生成设备ID（如果客户端没有提供）
    const deviceId = dto.deviceId || crypto.randomUUID();
    const deviceName = dto.deviceName || 'Unknown Device';

    // 获取用户可访问的租户列表
    const userTenants = await this.prisma.userTenant.findMany({
      where: {
        userId: user.id,
        isDeleted: 0,
        status: 1,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            code: true,
            logo: true,
          },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });

    // 如果用户没有租户，返回特殊标记
    if (userTenants.length === 0) {
      throw new BadRequestException('用户未分配租户，请联系管理员');
    }

    const tenants = userTenants.map(ut => ({
      id: Number(ut.tenant.id),
      name: ut.tenant.name,
      code: ut.tenant.code,
      logo: ut.tenant.logo,
      isDefault: ut.isDefault,
    }));

    // 确定默认租户
    const defaultTenant = tenants.find(t => t.isDefault === 1) || tenants[0];

    // 如果是多租户登录，标记需要选择租户
    const needSelectTenant = userTenants.length > 1;

    // 生成 token（如果需要选择租户，先不设置 tenantId）
    // 或者根据登录请求中的 tenantId 参数
    let payload: any = {
      userId: user.id.toString(),
      clientId: dto.clientId,
      deviceId,
      permissions: [],
      roles: [],
    };

    // 如果请求中指定了 tenantId，生成包含租户信息的 token
    if (dto.tenantId && !needSelectTenant) {
      payload.tenantId = dto.tenantId;
    }

    const accessToken = this.jwtStrategy.generateAccessToken(payload);
    const refreshToken = this.jwtStrategy.generateRefreshToken(payload);

    // 保存设备信息（会踢掉旧 token）
    await this.saveDeviceToken({
      deviceId,
      deviceName,
      userId: user.id.toString(),
      clientId: dto.clientId,
      accessToken,
      refreshToken,
    });

    // 保存用户租户列表到缓存（用于快速权限验证）
    await this.cache.set(
      `user:tenants:${user.id}`,
      tenants.map(t => t.id.toString()),
      3600, // 1小时
    );

    this.logger.log(`用户登录成功: ${user.username}, clientId: ${dto.clientId}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id.toString(),
        username: user.username,
        nickname: user.nickname || user.username,
        avatar: user.avatar || '',
      },
      tenants,
      needSelectTenant,
      defaultTenant: needSelectTenant ? undefined : defaultTenant,
    };
  }

  /**
   * 切换租户
   * 用户选择租户后，重新生成 token
   */
  async switchTenant(
    userId: string,
    tenantId: number,
    clientId: string,
    deviceId?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      username: string;
      nickname: string;
      avatar: string;
    };
  }> {
    // 验证租户访问权限
    const userTenant = await this.prisma.userTenant.findFirst({
      where: {
        userId: BigInt(userId),
        tenantId,
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

    // 查询用户信息
    const user = await this.prisma.baseUser.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 生成新 token（包含新的租户信息）
    const payload = this.buildUserPayload(user, clientId, deviceId);
    payload.tenantId = tenantId.toString();

    const accessToken = this.jwtStrategy.generateAccessToken(payload);
    const refreshToken = this.jwtStrategy.generateRefreshToken(payload);

    // 保存设备信息
    await this.saveDeviceToken({
      deviceId: deviceId || crypto.randomUUID(),
      deviceName: 'Unknown Device',
      userId: user.id.toString(),
      clientId,
      accessToken,
      refreshToken,
    });

    this.logger.log(`租户切换成功: userId=${userId}, tenantId=${tenantId}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id.toString(),
        username: user.username,
        nickname: user.nickname || user.username,
        avatar: user.avatar || '',
      },
    };
  }

  // ==================== 微信扫码登录 ====================

  /**
   * 生成微信扫码登录二维码
   */
  async createWechatQrcode(dto: LoginWechatQrcodeDto): Promise<{
    state: string;
    qrcodeUrl: string;
    expireSeconds: number;
  }> {
    // 检查客户端配置
    const clientConfig = this.clientConfigs[dto.clientId];
    if (!clientConfig) {
      throw new BadRequestException('无效的客户端ID');
    }

    // 检查微信配置
    if (!this.oauthService.isReady()) {
      // 降级模式：返回模拟数据
      this.logger.warn('微信配置缺失，使用模拟模式');
      return this.getMockQrcode(dto.clientId);
    }

    // 生成 state（防止 CSRF）
    const state = `wechat_${dto.clientId}_${crypto.randomUUID()}`;
    const expireSeconds = 300; // 5分钟

    // 保存 session 到缓存
    await this.cache.set(`login:wechat:${state}`, {
      state,
      clientId: dto.clientId,
      status: 'pending',
      scanTime: null,
      confirmTime: null,
    }, expireSeconds);

    // 构建微信扫码 URL
    const qrcodeUrl = this.buildWechatQrcodeUrl(dto.clientId, state);

    this.logger.log(`微信二维码生成: state=${state}, clientId=${dto.clientId}`);

    return {
      state,
      qrcodeUrl,
      expireSeconds,
    };
  }

  /**
   * 轮询扫码状态
   */
  async pollWechatStatus(state: string): Promise<{
    status: 'pending' | 'scanned' | 'confirmed' | 'completed' | 'expired';
    userId?: string;
    nickname?: string;
    avatar?: string;
  }> {
    const cacheKey = `login:wechat:${state}`;
    const session = await this.cache.get<WechatLoginSession>(cacheKey);

    if (!session) {
      return { status: 'expired' };
    }

    // 检查是否过期
    if (!session) {
      return { status: 'expired' };
    }

    return {
      status: session.status as any,
      userId: session.userId,
      nickname: session.userInfo?.nickname,
      avatar: session.userInfo?.avatar,
    };
  }

  /**
   * 微信扫码回调处理（由微信服务器调用）
   */
  async handleWechatCallback(params: {
    code: string;
    state: string;
  }): Promise<{
    success: boolean;
    message: string;
    redirectUrl?: string;
  }> {
    const cacheKey = `login:wechat:${params.state}`;
    const session = await this.cache.get<WechatLoginSession>(cacheKey);

    if (!session) {
      return {
        success: false,
        message: 'state 无效或已过期',
      };
    }

    try {
      // 更新扫描状态
      await this.cache.set(cacheKey, {
        ...session,
        status: 'scanned',
        scanTime: new Date().toISOString(),
      }, 300);

      // 检查微信配置
      if (!this.oauthService.isReady()) {
        return {
          success: true,
          message: '微信扫码成功（模拟模式）',
          redirectUrl: this.buildRedirectUrl(session.clientId, 'success', session.state),
        };
      }

      // 获取 access_token 和用户信息
      const accessToken = await this.oauthService.getOAuthAccessToken(
        'wechat',
        params.code,
        this.oauthService.getConfig()!,
      );

      if (!accessToken) {
        return {
          success: false,
          message: '获取 access_token 失败',
        };
      }

      // 获取用户信息
      const userInfo = await this.oauthService.getUserInfo(
        'wechat',
        accessToken,
        this.oauthService.getConfig()!,
      );

      if (!userInfo) {
        return {
          success: false,
          message: '获取用户信息失败',
        };
      }

      // 更新扫码状态
      await this.cache.set(cacheKey, {
        ...session,
        status: 'confirmed',
        openid: userInfo.id,
        userInfo,
        confirmTime: new Date().toISOString(),
      }, 300);

      // 检查用户是否已存在
      let user = await this.oauthService.findOAuthUser('wechat', userInfo.id);
      if (!user) {
        // 创建新用户
        user = await this.oauthService.createOAuthUser('wechat', userInfo);
      }

      // 更新 session，绑定用户
      await this.cache.set(cacheKey, {
        ...session,
        status: 'completed',
        userId: user.id.toString(),
      }, 300);

      return {
        success: true,
        message: '微信扫码成功',
        redirectUrl: this.buildRedirectUrl(session.clientId, 'success', session.state, user.id.toString()),
      };
    } catch (error) {
      this.logger.error('微信回调处理失败', error);
      return {
        success: false,
        message: '微信扫码失败: ' + error.message,
      };
    }
  }

  // ==================== 第三方登录 ====================

  /**
   * 第三方登录
   */
  async loginThirdparty(dto: LoginThirdpartyDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      username: string;
      nickname: string;
      avatar: string;
    };
    tenants: TenantInfo[];
    needSelectTenant: boolean;
  }> {
    // 检查配置
    if (!this.oauthService.isReady()) {
      // 降级模式：返回模拟数据
      return {
        ...this.getMockLoginResult(dto.clientId),
        tenants: [],
        needSelectTenant: false,
      };
    }

    // 获取用户信息
    const userInfo = await this.oauthService.getUserInfo(
      dto.provider,
      dto.code,
      this.oauthService.getConfig()!,
    );

    if (!userInfo) {
      throw new BadRequestException('获取用户信息失败');
    }

    // 检查用户是否已存在
    let user = await this.oauthService.findOAuthUser(dto.provider, userInfo.id);
    if (!user) {
      user = await this.oauthService.createOAuthUser(dto.provider, userInfo);
    }

    // 获取用户可访问的租户列表
    const userTenants = await this.prisma.userTenant.findMany({
      where: {
        userId: user.id,
        isDeleted: 0,
        status: 1,
      },
      include: {
        tenant: { select: { id: true, name: true, code: true, logo: true } },
      },
      orderBy: [{ isDefault: 'desc' }],
    });

    const tenants = userTenants.map(ut => ({
      id: Number(ut.tenant.id),
      name: ut.tenant.name,
      code: ut.tenant.code,
      logo: ut.tenant.logo,
      isDefault: ut.isDefault,
    }));

    // 生成 token
    const payload = this.buildUserPayload(user, dto.clientId);
    if (tenants.length === 1) {
      payload.tenantId = tenants[0].id.toString();
    }

    const accessToken = this.jwtStrategy.generateAccessToken(payload);
    const refreshToken = this.jwtStrategy.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id.toString(),
        username: user.username,
        nickname: user.nickname || user.username,
        avatar: user.avatar || '',
      },
      tenants,
      needSelectTenant: tenants.length > 1,
    };
  }

  // ==================== Token 管理 ====================

  /**
   * 刷新 token
   */
  async refreshToken(
    refreshToken: string,
    clientId: string,
    deviceId?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const payload = this.jwtStrategy.verifyRefreshToken(refreshToken);

      // 验证 clientId
      if (payload.clientId !== clientId) {
        throw new BadRequestException('客户端ID不匹配');
      }

      // 验证 device
      if (deviceId && payload.deviceId !== deviceId) {
        throw new BadRequestException('设备ID不匹配');
      }

      // 生成新 token
      const newAccessToken = this.jwtStrategy.generateAccessToken(payload);
      const newRefreshToken = this.jwtStrategy.generateRefreshToken(payload);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new BadRequestException('token 刷新失败: ' + error.message);
    }
  }

  /**
   * 注销 token（加入黑名单）
   */
  async logout(accessToken: string): Promise<void> {
    try {
      const payload = this.jwtStrategy.verifyAccessToken(accessToken);
      const jti = payload.jti;

      // 将 jti 加入黑名单
      await this.cache.set(`blacklist:${jti}`, '1', 7200); // 2小时后自动过期

      this.logger.log(`用户退出登录: jti=${jti}`);
    } catch (error) {
      this.logger.error('退出登录失败', error);
    }
  }

  // ==================== 账号绑定 ====================

  /**
   * 绑定微信账号
   */
  async bindWechatAccount(userId: string, openid: string): Promise<{ success: boolean }> {
    const user = await this.prisma.baseUser.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 检查是否已绑定
    if (user.wechatOpenid) {
      throw new BadRequestException('账号已绑定微信');
    }

    // 更新用户
    await this.prisma.baseUser.update({
      where: { id: BigInt(userId) },
      data: { wechatOpenid: openid },
    });

    return { success: true };
  }

  // ==================== 租户相关 ====================

  /**
   * 获取用户可访问的租户列表
   */
  async getUserTenants(userId: string): Promise<TenantInfo[]> {
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

    return userTenants.map((ut: any) => ({
      id: Number(ut.tenant.id),
      name: ut.tenant.name,
      code: ut.tenant.code,
      logo: ut.tenant.logo ?? undefined,
      isDefault: ut.isDefault,
    }));
  }

  /**
   * 获取租户已开通的业务列表
   */
  async getTenantBusinesses(tenantId: number): Promise<any[]> {
    const tenantBusinesses = await (this.prisma as any).tenantBusiness.findMany({
      where: {
        tenantId: BigInt(tenantId),
        status: 1,
        isDeleted: 0,
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
   * 获取业务下的应用列表
   */
  async getBusinessApps(businessId: number): Promise<any[]> {
    const businessApps = await (this.prisma as any).businessApp.findMany({
      where: {
        businessId: BigInt(businessId),
        status: 1,
        isDeleted: 0,
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
      name: ba.app.code,
      code: ba.app.code,
      type: ba.app.type,
      description: ba.app.description,
      logo: ba.app.logo,
      domain: ba.app.domain,
    }));
  }

  // ==================== 私有方法 ====================

  /**
   * 构建用户 Payload（支持多租户）
   */
  private buildUserPayload(
    user: any,
    clientId: string,
    deviceId?: string,
    tenantId?: string | number,
  ): {
    userId: string;
    clientId: string;
    deviceId?: string;
    tenantId?: string;
    permissions: string[];
    roles: string[];
  } {
    return {
      userId: user.id.toString(),
      clientId,
      deviceId,
      tenantId: tenantId?.toString(),
      permissions: [],
      roles: [],
    };
  }

  /**
   * 保存设备 Token（会踢掉旧 token）
   */
  private async saveDeviceToken(params: {
    deviceId: string;
    deviceName: string;
    userId: string;
    clientId: string;
    accessToken: string;
    refreshToken: string;
  }): Promise<void> {
    const cacheKey = `device:${params.userId}:${params.deviceId}`;
    const deviceData = {
      userId: params.userId,
      clientId: params.clientId,
      deviceName: params.deviceName,
      lastLogin: new Date(),
    };

    // 保存设备信息（7天）
    await this.cache.set(cacheKey, deviceData, 604800);

    // 保存 token 映射
    const tokenMapKey = `tokenMap:${params.deviceId}`;
    await this.cache.set(tokenMapKey, {
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
      createdAt: new Date(),
    }, 604800);

    // 保存当前有效的 token（用于快速验证）
    const currentTokenKey = `token:${params.userId}:${params.deviceId}`;
    await this.cache.set(currentTokenKey, params.accessToken, 7200);
  }

  /**
   * 构建微信二维码 URL
   */
  private buildWechatQrcodeUrl(clientId: string, state: string): string {
    const clientConfig = this.clientConfigs[clientId];
    const redirectUri = encodeURIComponent(
      this.configService.get<string>(
        'WECHAT_REDIRECT_URI',
        'https://your-domain.com/api/system/login/wechat/callback',
      ),
    );
    return `https://open.weixin.qq.com/connect/qrconnect?appid=APPID&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
  }

  /**
   * 构建回调跳转 URL
   */
  private buildRedirectUrl(
    clientId: string,
    status: string,
    state: string,
    userId?: string,
  ): string {
    const clientConfig = this.clientConfigs[clientId];
    const redirectBase = clientConfig.clientId === 'admin_web'
      ? this.configService.get<string>('ADMIN_WEB_URL', 'http://localhost:3000')
      : this.configService.get<string>('CLIENT_WEB_URL', 'http://localhost:3000');

    return `${redirectBase}/login/callback?status=${status}&state=${state}${userId ? `&userId=${userId}` : ''}`;
  }

  /**
   * 获取模拟二维码（配置缺失时）
   */
  private getMockQrcode(clientId: string): {
    state: string;
    qrcodeUrl: string;
    expireSeconds: number;
  } {
    const state = `wechat_${clientId}_${crypto.randomUUID()}`;
    return {
      state,
      qrcodeUrl: `data:image/png;base64, MOCK_QRCODE_${state}`,
      expireSeconds: 300,
    };
  }

  /**
   * 获取模拟登录结果（配置缺失时）
   */
  private getMockLoginResult(clientId: string): {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      username: string;
      nickname: string;
      avatar: string;
    };
  } {
    const mockUser = {
      id: crypto.randomUUID(),
      username: `wechat_user_${crypto.randomUUID().substring(0, 8)}`,
      nickname: '微信用户',
      avatar: 'https://example.com/avatar/wechat.png',
    };

    const payload = this.buildUserPayload(mockUser, clientId);
    const accessToken = this.jwtStrategy.generateAccessToken(payload);
    const refreshToken = this.jwtStrategy.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: mockUser,
    };
  }

  // ==================== 私有方法 ====================

  /**
   * 解密密码（支持 RSA 加密）
   * 如果密码是.encrypted.开头，说明被前端 RSA 加密过，需要解密
   */
  private async decryptPassword(password: string): Promise<string> {
    try {
      // 检查是否为加密后的密码（base64 编码，长度较长）
      if (password.length > 100 && password.includes('+')) {
        const privateKey = await this.cache.get<string>('crypto:rsa:private_key');
        if (privateKey) {
          try {
            return rsaDecrypt(password, privateKey);
          } catch (e) {
            this.logger.warn('密码解密失败，使用原始密码');
          }
        }
      }
      return password;
    } catch (error) {
      this.logger.error('密码解密异常', error);
      return password;
    }
  }
}
