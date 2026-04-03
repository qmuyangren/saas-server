import { Injectable, Logger } from '@nestjs/common';

/**
 * 本地缓存服务 - 基于内存的进程内缓存
 *
 * @description
 * 使用 Map 实现的进程内缓存，适用于单机部署场景。
 * 相比 Redis 缓存，本地缓存具有更低的延迟，但不支持多实例共享。
 * 适合缓存不经常变化、数据量小的配置数据。
 *
 * 特性：
 * - 支持 TTL 过期（惰性删除 + 定时清理）
 * - 支持最大缓存条目数限制（LRU 淘汰）
 * - 支持缓存统计（命中率、大小等）
 *
 * @example
 * ```typescript
 * // 基础用法
 * await this.localCache.set('key', 'value', 300); // 5 分钟过期
 * const value = await this.localCache.get('key');
 *
 * // 批量操作
 * await this.localCache.mset([
 *   { key: 'k1', value: 'v1', ttl: 60 },
 *   { key: 'k2', value: 'v2', ttl: 120 },
 * ]);
 *
 * // 获取统计信息
 * const stats = this.localCache.getStats();
 * console.log(`命中率: ${stats.hitRate}%`);
 * ```
 */
@Injectable()
export class LocalCacheService {
  private readonly logger = new Logger(LocalCacheService.name);
  private readonly store = new Map<string, { value: any; expireAt: number }>();
  private hits = 0;
  private misses = 0;
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    // 每 60 秒清理一次过期条目
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * 获取缓存值
   *
   * @param key - 缓存键
   * @returns 缓存值，不存在或已过期返回 undefined
   */
  async get<T = any>(key: string): Promise<T | undefined> {
    const item = this.store.get(key);

    if (!item) {
      this.misses++;
      return undefined;
    }

    if (item.expireAt && Date.now() > item.expireAt) {
      this.store.delete(key);
      this.misses++;
      return undefined;
    }

    this.hits++;
    return item.value;
  }

  /**
   * 设置缓存值
   *
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttlSeconds - 过期时间（秒），0 表示永不过期
   * @returns 是否设置成功
   */
  async set(key: string, value: any, ttlSeconds = 0): Promise<boolean> {
    // 如果缓存已满，删除最旧的条目
    if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) {
        this.store.delete(oldestKey);
      }
    }

    const expireAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0;
    this.store.set(key, { value, expireAt });
    return true;
  }

  /**
   * 删除缓存
   *
   * @param key - 缓存键
   * @returns 是否删除成功
   */
  async del(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  /**
   * 批量设置缓存
   *
   * @param items - 缓存项数组
   */
  async mset(
    items: Array<{ key: string; value: any; ttl?: number }>,
  ): Promise<void> {
    for (const item of items) {
      await this.set(item.key, item.value, item.ttl);
    }
  }

  /**
   * 批量获取缓存
   *
   * @param keys - 缓存键数组
   * @returns 缓存值数组
   */
  async mget<T = any>(keys: string[]): Promise<(T | undefined)[]> {
    return Promise.all(keys.map((key) => this.get<T>(key)));
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 获取缓存大小
   *
   * @returns 缓存条目数
   */
  size(): number {
    return this.store.size;
  }

  /**
   * 获取缓存统计信息
   *
   * @returns 包含命中率、大小等信息
   */
  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.store.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? ((this.hits / total) * 100).toFixed(2) : '0.00',
    };
  }

  /**
   * 清理过期条目
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.store) {
      if (item.expireAt > 0 && now > item.expireAt) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned ${cleaned} expired cache entries`);
    }
  }
}
