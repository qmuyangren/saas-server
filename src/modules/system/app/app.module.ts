import { Module } from '@nestjs/common';
import { PrismaModule } from '@/infrastructure/database/prisma.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * 应用模块
 *
 * @description
 * 提供应用管理功能：
 * - 应用 CRUD
 * - 应用查询
 */
@Module({
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
  imports: [PrismaModule],
})
export class AppModule {}
