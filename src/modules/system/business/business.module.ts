import { Module } from '@nestjs/common';
import { PrismaModule } from '@/infrastructure/database/prisma.module';

import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';

/**
 * 业务线模块
 *
 * @description
 * 提供业务线管理功能：
 * - 业务线 CRUD
 * - 业务线查询
 */
@Module({
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
  imports: [PrismaModule],
})
export class BusinessModule {}
