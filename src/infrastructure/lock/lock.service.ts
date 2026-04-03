import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class LockService {
  private readonly logger = new Logger(LockService.name);

  constructor(private readonly redis: RedisService) {}

  async acquire(key: string, ttlSeconds = 30): Promise<boolean> {
    const result = await this.redis.set(key, '1', ttlSeconds);
    if (result) {
      this.logger.debug(`Lock acquired: ${key}`);
    }
    return result;
  }

  async release(key: string): Promise<boolean> {
    const result = await this.redis.del(key);
    if (result) {
      this.logger.debug(`Lock released: ${key}`);
    }
    return result;
  }

  async tryAcquire(
    key: string,
    ttlSeconds = 30,
    retries = 3,
  ): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
      const acquired = await this.acquire(key, ttlSeconds);
      if (acquired) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100 * (i + 1)));
    }
    return false;
  }
}
