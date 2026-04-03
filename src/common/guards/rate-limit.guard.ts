import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { ErrorCode } from '../constants';

/**
 * 接口限流装饰器 - 用于限制接口访问频率
 *
 * @description
 * 标记需要限流的接口，配合 `RateLimitGuard` 使用。
 * 基于 Redis 实现滑动窗口限流，支持自定义时间窗口和最大请求数。
 * 限流键由 IP + URL 自动生成，防止恶意刷接口。
 *
 * @param options - 限流配置选项
 * @param options.windowMs - 时间窗口（毫秒），默认 60000ms（1 分钟）
 * @param options.maxRequests - 窗口内最大请求数，默认 100 次
 *
 * @example
 * ```typescript
 * // 基础用法 - 1 分钟最多 50 次请求
 * @RateLimit({ windowMs: 60000, maxRequests: 50 })
 * @Get('list')
 * async findAll() {
 *   return this.service.findAll();
 * }
 *
 * // 严格限流 - 10 秒最多 5 次
 * @RateLimit({ windowMs: 10000, maxRequests: 5 })
 * @Post('login')
 * async login(@Body() dto: LoginDto) {
 *   return this.authService.login(dto);
 * }
 *
 * // 宽松限流 - 1 小时最多 1000 次
 * @RateLimit({ windowMs: 3600000, maxRequests: 1000 })
 * @Get('export')
 * async exportData() {
 *   return this.service.export();
 * }
 * ```
 *
 * @see {@link RateLimitGuard} 配合使用的限流守卫
 */
export const RateLimit = (options?: {
  windowMs?: number;
  maxRequests?: number;
}) => {
  const metadata = {
    windowMs: options?.windowMs ?? 60000,
    maxRequests: options?.maxRequests ?? 100,
  };
  return Reflect.decorate([Reflect.metadata('rateLimit', metadata)], Object);
};

/**
 * 限流守卫 - 控制接口访问频率
 *
 * @description
 * 基于 Redis 的滑动窗口限流实现，防止接口被恶意刷取。
 * 限流键格式：`rate_limit:{ip}:{url}`
 *
 * 工作流程：
 * 1. 检查接口是否配置了 `@RateLimit()` 装饰器，未配置则放行
 * 2. 生成限流键（客户端 IP + 请求 URL）
 * 3. 使用 Redis ZSET 记录请求时间戳
 * 4. 清理窗口外的旧记录
 * 5. 检查窗口内请求数是否超过限制
 * 6. 超过限制则拒绝请求，返回 429 状态码
 *
 * @example
 * ```typescript
 * // main.ts 全局注册
 * app.useGlobalGuards(new RateLimitGuard());
 *
 * // 控制器中使用
 * @RateLimit({ windowMs: 60000, maxRequests: 50 })
 * @Get('sensitive-data')
 * async getSensitiveData() {
 *   return this.service.getSecret();
 * }
 * ```
 *
 * @see {@link RateLimit} 限流配置装饰器
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const rateLimitMeta = Reflect.getMetadata(
      'rateLimit',
      context.getHandler(),
    );

    if (!rateLimitMeta) {
      return true;
    }

    const { windowMs, maxRequests } = rateLimitMeta;
    const clientIp =
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.ip ||
      'unknown';
    const url = request.originalUrl || request.url;
    const rateLimitKey = `rate_limit:${clientIp}:${url}`;

    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // 清理窗口外的旧记录
      await this.redis.zremrangebyscore(rateLimitKey, -Infinity, windowStart);

      // 获取窗口内的请求数
      const currentRequests = await this.redis.zrangebyscore(
        rateLimitKey,
        windowStart,
        Infinity,
      );

      if (currentRequests.length >= maxRequests) {
        this.logger.warn(
          `Rate limit exceeded: ${clientIp} ${url} (${currentRequests.length}/${maxRequests})`,
        );
        throw {
          code: ErrorCode.RATE_LIMIT_EXCEEDED,
          message: `请求过于频繁，请 ${Math.ceil(windowMs / 1000)} 秒后再试`,
        };
      }

      // 记录当前请求
      await this.redis.zadd(rateLimitKey, now, `${now}-${Math.random()}`);
      await this.redis.expire(rateLimitKey, Math.ceil(windowMs / 1000) + 1);

      return true;
    } catch (error: any) {
      if (error.code === ErrorCode.RATE_LIMIT_EXCEEDED) {
        throw error;
      }
      this.logger.warn(`Rate limit check failed: ${error.message}`);
      return true;
    }
  }
}
