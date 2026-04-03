/**
 * 应用根模块
 *
 * @description
 * NestJS 应用的根模块，负责注册和配置所有子模块。
 * 导入全局配置模块和基础设施模块，使它们在整个应用中可用。
 *
 * 依赖模块：
 * - ConfigModule: 全局配置管理（环境变量加载）
 * - InfrastructureModule: 基础设施层（数据库、缓存、队列、存储等）
 *
 * @example
 * ```typescript
 * // 启动应用时自动加载
 * const app = await NestFactory.create(AppModule);
 * ```
 */
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [
    // 全局配置模块 - 加载 .env 环境变量文件
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 基础设施模块 - 提供数据库、缓存、队列等服务
    InfrastructureModule,
  ],
})
export class AppModule {}
