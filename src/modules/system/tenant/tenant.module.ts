import { Module } from '@nestjs/common';
import { PrismaModule } from '@/infrastructure/database/prisma.module';
import { CacheModule } from '@/infrastructure/cache/cache.module';

import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

/**
 * 租户模块
 *
 * @description
 * 提供租户相关功能：
 * - 租户注册
 * - 租户配置管理
 * - 业务管理
 * - 应用管理
 */
@Module({
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
  imports: [PrismaModule, CacheModule],
})
export class TenantModule {}
