import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '../../infrastructure/cache/redis.service';

/**
 * 缓存拦截器 - 自动缓存 GET 请求响应数据
 *
 * @description
 * 拦截 GET 请求，自动从 Redis 缓存中读取或写入响应数据。
 * 配合 `@Cacheable()` 装饰器使用，支持自定义 TTL 和缓存键。
 * 仅对 GET 请求生效，其他请求方法直接放行。
 *
 * 工作流程：
 * 1. 检查请求方法是否为 GET，非 GET 直接放行
 * 2. 根据 `@Cacheable()` 配置生成缓存键
 * 3. 尝试从 Redis 读取缓存，命中则直接返回
 * 4. 未命中则执行实际逻辑，并将结果写入 Redis
 *
 * @example
 * ```typescript
 * // main.ts 全局注册
 * app.useGlobalInterceptors(new CacheInterceptor());
 *
 * // 控制器中使用
 * @Cacheable({ ttl: 300, key: 'dict:list' })
 * @Get('list')
 * async findAll() {
 *   return this.dictService.findAll();
 * }
 *
 * // 动态缓存键
 * @Cacheable({ ttl: 600, key: 'user:profile::id' })
 * @Get(':id')
 * async findOne(@Param('id') id: string) {
 *   return this.userService.findOne(+id);
 * }
 * ```
 *
 * @see {@link Cacheable} 缓存配置装饰器
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);
  private readonly DEFAULT_TTL = 300;
  private readonly DEFAULT_PREFIX = 'cache';

  constructor(private readonly redis: RedisService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cacheMeta =
      Reflect.getMetadata('cacheable', context.getHandler()) ??
      Reflect.getMetadata('cacheable', context.getClass());

    if (!cacheMeta) {
      return next.handle();
    }

    const ttl = cacheMeta.ttl ?? this.DEFAULT_TTL;
    const prefix = cacheMeta.prefix ?? this.DEFAULT_PREFIX;
    const keyTemplate = cacheMeta.key ?? this.buildDefaultKey(request);
    const cacheKey = this.resolveKey(keyTemplate, request, prefix);

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return of(JSON.parse(cached));
    }

    return next.handle().pipe(
      tap(async (data) => {
        try {
          await this.redis.set(cacheKey, JSON.stringify(data), ttl);
          this.logger.debug(`Cache set: ${cacheKey} (TTL: ${ttl}s)`);
        } catch (error) {
          this.logger.warn(`Cache set failed: ${cacheKey}`, error);
        }
      }),
    );
  }

  private buildDefaultKey(request: any): string {
    return request.originalUrl.replace(/\//g, ':');
  }

  private resolveKey(template: string, request: any, prefix: string): string {
    let key = template;
    const params = request.params || {};
    const query = request.query || {};

    Object.keys(params).forEach((param) => {
      key = key.replace(`:${param}`, params[param]);
    });
    Object.keys(query).forEach((q) => {
      key = key.replace(`:${q}`, query[q]);
    });

    return `${prefix}:${key}`;
  }
}
