import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { CacheService } from '@/infrastructure/cache/cache.service';

/**
 * JWT 认证守卫
 *
 * @description
 * 校验 JWT Token + 校验 X-Client-Id 一致性 + 黑名单检查
 *
 * 使用方式：
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Get('user/info')
 * getUserInfo(@Request() req) {
 *   return req.user;
 * }
 * ```
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as any;
    const token = this.extractTokenFromHeader(request);

    // 如果没有 token，允许通过（某些接口不需要认证）
    if (!token) {
      return true;
    }

    try {
      // 验证 token
      const payload = this.jwtService.verify(token) as any;

      // 黑名单检查（token 被注销）
      const isBlacklisted = await this.isTokenBlacklisted(payload.jti);
      if (isBlacklisted) {
        throw new UnauthorizedException('token 已被注销');
      }

      // 将 payload 挂载到 request 上
      request.user = payload;

      // 校验 X-Client-Id 一致性
      const clientId = this.extractClientIdFromHeader(request);
      if (clientId && payload.clientId !== clientId) {
        throw new UnauthorizedException('客户端ID不匹配');
      }

      // 校验 X-Device-Id 一致性（如果存在）
      const deviceId = this.extractDeviceIdFromHeader(request);
      if (deviceId && payload.deviceId !== deviceId) {
        throw new UnauthorizedException('设备ID不匹配');
      }

      // 标记请求已认证
      request.authenticated = true;

      return true;
    } catch (error) {
      this.cache.del(`token:${token}`);
      throw new UnauthorizedException('token 无效或已过期');
    }
  }

  /**
   * 从请求头中提取 Token
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  /**
   * 从请求头中提取 ClientId
   */
  private extractClientIdFromHeader(request: Request): string | undefined {
    return request.headers['x-client-id'] as string;
  }

  /**
   * 从请求头中提取 DeviceId
   */
  private extractDeviceIdFromHeader(request: Request): string | undefined {
    return request.headers['x-device-id'] as string;
  }

  /**
   * 检查 token 是否在黑名单中
   */
  private async isTokenBlacklisted(jti: string): Promise<boolean> {
    const blacklisted = await this.cache.get(`blacklist:${jti}`);
    return blacklisted !== null;
  }
}
