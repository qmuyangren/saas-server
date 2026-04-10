import { Controller, Get, Post, Body, Query, Headers, UseGuards, Request, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginAccountDto, LoginWechatQrcodeDto, LoginThirdpartyDto } from './dto/login.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CacheService } from '@/infrastructure/cache/cache.service';

// 导出 UserController 供模块注册使用
export { UserController } from './user.controller';

/**
 * RSA 公钥缓存键
 */
const RSA_PUBLIC_KEY_CACHE_KEY = 'crypto:rsa:public_key';
const RSA_PRIVATE_KEY_CACHE_KEY = 'crypto:rsa:private_key';

/**
 * 认证控制器
 *
 * @description
 * 提供认证相关的接口：
 * - 系统配置
 * - 第三方登录配置
 * - 账密登录
 * - 微信扫码登录
 * - 第三方登录
 * - Token 刷新
 */
@ApiTags('认证')
@Controller('system')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cache: CacheService,
  ) {}

  /**
   * 获取系统配置
   */
  @Get('config')
  @ApiOperation({ summary: '获取系统配置（基于 clientId）' })
  @ApiResponse({ status: 200, description: '系统配置' })
  async getSystemConfig(@Query('clientId') clientId: string) {
    return this.authService.getSystemConfig(clientId);
  }

  /**
   * 获取第三方登录配置
   */
  @Get('thirdparty/config')
  @ApiOperation({ summary: '获取第三方登录配置（基于 clientId）' })
  @ApiResponse({ status: 200, description: '第三方登录配置' })
  async getThirdPartyConfig(@Query('clientId') clientId: string) {
    return this.authService.getThirdPartyConfig(clientId);
  }

  /**
   * 账密登录
   */
  @Post('login/account')
  @ApiOperation({ summary: '账密登录' })
  @ApiResponse({ status: 200, description: '登录成功，返回 token' })
  async loginAccount(@Body() dto: LoginAccountDto): Promise<any> {
    return this.authService.loginAccount(dto);
  }

  /**
   * 生成微信二维码
   */
  @Post('login/wechat/qrcode')
  @ApiOperation({ summary: '生成微信扫码登录二维码' })
  @ApiResponse({ status: 200, description: '二维码信息' })
  async createWechatQrcode(@Body() dto: LoginWechatQrcodeDto) {
    return this.authService.createWechatQrcode(dto);
  }

  /**
   * 轮询扫码状态
   */
  @Get('login/wechat/status')
  @ApiOperation({ summary: '轮询扫码状态' })
  @ApiResponse({ status: 200, description: '扫码状态' })
  async pollWechatStatus(@Query('state') state: string) {
    return this.authService.pollWechatStatus(state);
  }

  /**
   * 微信回调（由微信服务器调用）
   */
  @Get('login/wechat/callback')
  @ApiOperation({ summary: '微信扫码回调（微信服务器调用）' })
  @ApiResponse({ status: 200, description: '回调处理结果' })
  async handleWechatCallback(@Query() params: { code: string; state: string }) {
    return this.authService.handleWechatCallback(params);
  }

  /**
   * 第三方登录
   */
  @Post('login/thirdparty')
  @ApiOperation({ summary: '第三方登录' })
  @ApiResponse({ status: 200, description: '登录成功，返回 token' })
  async loginThirdparty(@Body() dto: LoginThirdpartyDto): Promise<any> {
    return this.authService.loginThirdparty(dto);
  }

  /**
   * Token 刷新
   */
  @Post('token/refresh')
  @ApiOperation({ summary: '刷新 token' })
  @ApiResponse({ status: 200, description: '新的 token' })
  @ApiHeader({ name: 'Authorization', description: 'Refresh Token' })
  async refreshTokens(
    @Headers('authorization') authorization: string,
    @Body('clientId') clientId: string,
    @Body('deviceId') deviceId?: string,
  ) {
    const refreshToken = authorization?.replace('Bearer ', '');
    return this.authService.refreshToken(refreshToken, clientId, deviceId);
  }

  /**
   * 退出登录
   */
  @Post('logout')
  @ApiOperation({ summary: '退出登录' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logout(accessToken);
  }

  /**
   * 获取 RSA 公钥（用于前端密码加密）
   */
  @Get('rsa/public-key')
  @ApiOperation({ summary: '获取 RSA 公钥' })
  @ApiResponse({ status: 200, description: 'RSA 公钥' })
  async getRsaPublicKey(): Promise<{ publicKey: string | null }> {
    // 从缓存获取公钥，如果没有则生成
    let publicKey = await this.cache.get<string | null>(RSA_PUBLIC_KEY_CACHE_KEY);
    if (!publicKey) {
      const { publicKey: genPublicKey, privateKey: genPrivateKey } = await import('@/common/utils/rsa.util').then(m => m.generateRsaKeyPair());
      publicKey = genPublicKey;
      // 私钥缓存 10 分钟（与公钥生命周期一致）
      await this.cache.set(RSA_PRIVATE_KEY_CACHE_KEY, genPrivateKey, 600);
      await this.cache.set(RSA_PUBLIC_KEY_CACHE_KEY, publicKey, 600);
    }
    return { publicKey };
  }
}
