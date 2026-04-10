import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

/**
 * JWT 配置
 */
interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

/**
 * JWT 载荷接口
 */
export interface JwtPayload {
  userId: string | number;
  clientId: string;
  deviceId?: string;
  tenantId?: string | number;
  businessId?: string | number;
  app?: string;
  permissions?: string[];
  roles?: string[];
  jti: string;
  iat: number;
  exp: number;
  type?: 'access' | 'refresh';
}

/**
 * JWT 策略
 *
 * @description
 * 提供 JWT 生成、验证、刷新功能
 * 支持多租户、多业务、多应用的 token 结构
 */
@Injectable()
export class JwtStrategy {
  private jwtConfig: JwtConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.jwtConfig = {
      secret: this.configService.get<string>('JWT_SECRET', 'your-secret-key'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '2h'),
      refreshSecret: this.configService.get<string>('JWT_REFRESH_SECRET', 'your-refresh-secret-key'),
      refreshExpiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    };
  }

  /**
   * 生成 access token
   * @param payload 载荷（userId, clientId, deviceId, tenantId, businessId, permissions）
   * @returns access token
   */
  generateAccessToken(payload: any): string {
    const jti = crypto.randomUUID();
    const tokenPayload: JwtPayload = {
      ...payload,
      jti,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7200, // 2小时
      type: 'access',
    };
    return this.jwtService.sign(tokenPayload, {
      secret: this.jwtConfig.secret,
    }) as string;
  }

  /**
   * 生成 refresh token
   * @param payload 载荷
   * @returns refresh token
   */
  generateRefreshToken(payload: any): string {
    const jti = crypto.randomUUID();
    const tokenPayload: JwtPayload = {
      ...payload,
      jti,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 604800, // 7天
    };
    return this.jwtService.sign(tokenPayload, {
      secret: this.jwtConfig.refreshSecret,
    }) as string;
  }

  /**
   * 验证 access token
   * @param token token 字符串
   * @returns 解析后的 payload
   */
  verifyAccessToken(token: string): JwtPayload {
    return this.jwtService.verify(token, {
      secret: this.jwtConfig.secret,
    }) as JwtPayload;
  }

  /**
   * 验证 refresh token
   * @param token token 字符串
   * @returns 解析后的 payload
   */
  verifyRefreshToken(token: string): JwtPayload {
    return this.jwtService.verify(token, {
      secret: this.jwtConfig.refreshSecret,
    }) as JwtPayload;
  }

  /**
   * 刷新 token
   * @param refreshToken 刷新 token
   * @returns 新的 access token 和 refresh token
   */
  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const payload = this.verifyRefreshToken(refreshToken);
      const newAccessToken = this.generateAccessToken(payload);
      const newRefreshToken = this.generateRefreshToken(payload);
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new Error('token 刷新失败');
    }
  }

  /**
   * 获取 JWT 配置
   */
  getJwtConfig(): JwtConfig {
    return this.jwtConfig;
  }
}
