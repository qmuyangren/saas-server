import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: any;
  private connected = false;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      const Redis = require('ioredis');
      const config: RedisConfig = {
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD'),
        db: this.configService.get<number>('REDIS_DB', 0),
      };

      this.client = new Redis(config);

      this.client.on('connect', () => {
        this.connected = true;
        this.logger.log('Redis connected successfully');
      });

      this.client.on('error', (err: Error) => {
        this.connected = false;
        // Only log non-ping errors after initial connection
        if (this.connected) {
          this.logger.warn('Redis error:', err.message);
        }
      });

      await this.client.ping();
    } catch (error) {
      this.logger.warn('Redis not available, caching disabled');
      this.connected = false;
    }
  }

  private async disconnect() {
    if (this.client) {
      await this.client.quit();
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async get(key: string): Promise<string | null> {
    if (!this.connected) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.warn(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!this.connected) return false;
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      this.logger.warn(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.connected) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      this.logger.warn(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.connected) return [];
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.warn(`Redis KEYS error for pattern ${pattern}:`, error);
      return [];
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.connected) return false;
    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      this.logger.warn(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  async zadd(key: string, score: number, member: string): Promise<boolean> {
    if (!this.connected) return false;
    try {
      await this.client.zadd(key, score, member);
      return true;
    } catch (error) {
      this.logger.warn(`Redis ZADD error for key ${key}:`, error);
      return false;
    }
  }

  async zremrangebyscore(
    key: string,
    min: number,
    max: number,
  ): Promise<boolean> {
    if (!this.connected) return false;
    try {
      await this.client.zremrangebyscore(key, min, max);
      return true;
    } catch (error) {
      this.logger.warn(`Redis ZREMRANGEBYSCORE error for key ${key}:`, error);
      return false;
    }
  }

  async zrangebyscore(
    key: string,
    min: number,
    max: number,
  ): Promise<string[]> {
    if (!this.connected) return [];
    try {
      return await this.client.zrangebyscore(key, min, max);
    } catch (error) {
      this.logger.warn(`Redis ZRANGEBYSCORE error for key ${key}:`, error);
      return [];
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    if (!this.connected) return null;
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      this.logger.warn(`Redis HGET error for ${key}:${field}:`, error);
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<boolean> {
    if (!this.connected) return false;
    try {
      await this.client.hset(key, field, value);
      return true;
    } catch (error) {
      this.logger.warn(`Redis HSET error for ${key}:${field}:`, error);
      return false;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (!this.connected) return {};
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      this.logger.warn(`Redis HGETALL error for key ${key}:`, error);
      return {};
    }
  }
}
