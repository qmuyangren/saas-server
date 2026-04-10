import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisConfigService } from './redis.config.service';

@Global()
@Module({
  providers: [RedisService, RedisConfigService],
  exports: [RedisService, RedisConfigService],
})
export class RedisModule {}
