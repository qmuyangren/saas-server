import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * 缓存服务
 *
 * @description
 * 封装 RedisService，提供对象的自动序列化/反序列化
 * RedisService 只支持 string 类型，此服务自动处理 JSON 转换
 */
@Injectable()
export class CacheService {
  constructor(private readonly redis: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    const result = await this.redis.get(key);
    if (!result) return null;
    try {
      return JSON.parse(result) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    const jsonValue = JSON.stringify(value);
    return await this.redis.set(key, jsonValue, ttlSeconds);
  }

  async del(key: string): Promise<boolean> {
    return await this.redis.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern);
  }
}
