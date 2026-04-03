import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { LocalCacheService } from './local-cache.service';

/**
 * 缓存工厂 - 根据配置选择 Redis 或本地缓存
 *
 * @description
 * 根据应用配置自动选择使用 Redis 分布式缓存或本地内存缓存。
 * 提供统一的缓存接口，业务代码无需关心底层缓存实现。
 *
 * 选择策略：
 * - 优先使用 Redis（支持多实例共享）
 * - Redis 不可用时降级为本地缓存
 * - 可通过配置强制使用本地缓存
 *
 * @example
 * ```typescript
 * // 在模块中使用
 * const cache = this.cacheFactory.create();
 * await cache.set('key', 'value', 300);
 * const value = await cache.get('key');
 *
 * // 获取底层缓存类型
 * const type = this.cacheFactory.getType(); // 'redis' | 'local'
 * ```
 */
@Injectable()
export class CacheFactory {
  private readonly logger = new Logger(CacheFactory.name);

  constructor(
    private readonly redis: RedisService,
    private readonly localCache: LocalCacheService,
  ) {}

  /**
   * 获取缓存服务实例
   *
   * @returns Redis 或 LocalCache 服务实例
   */
  create(): RedisService | LocalCacheService {
    if (this.redis.isConnected()) {
      return this.redis;
    }

    this.logger.warn('Redis not available, falling back to local cache');
    return this.localCache;
  }

  /**
   * 获取当前缓存类型
   *
   * @returns 'redis' 或 'local'
   */
  getType(): 'redis' | 'local' {
    return this.redis.isConnected() ? 'redis' : 'local';
  }
}
