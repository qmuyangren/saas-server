import { Module } from '@nestjs/common';

import { StorageService } from './storage.service';
import { CacheModule } from '@/infrastructure/cache/cache.module';

/**
 * 存储模块
 *
 * @description
 * 存储模块，提供统一的文件存储服务：
 * - 本地存储
 * - 阿里云OSS
 * - 七牛云存储
 */
@Module({
  providers: [StorageService],
  exports: [StorageService],
  imports: [CacheModule],
})
export class StorageModule {}
