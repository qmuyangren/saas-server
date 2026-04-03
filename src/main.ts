/**
 * 应用入口文件
 *
 * @description
 * NestJS 应用的启动入口，负责创建应用实例并配置全局设置。
 * 配置内容包括：全局管道、异常过滤器、拦截器、CORS、Swagger 文档等。
 *
 * 启动流程：
 * 1. 创建 NestJS 应用实例
 * 2. 配置全局验证管道（DTO 校验）
 * 3. 注册全局异常过滤器
 * 4. 注册全局拦截器（响应转换、日志记录）
 * 5. 配置 CORS 跨域策略
 * 6. 配置 Swagger API 文档
 * 7. 设置全局路由前缀
 * 8. 启动 HTTP 服务器
 *
 * @example
 * ```bash
 * # 开发模式启动
 * npm run start:dev
 *
 * # 生产模式启动
 * npm run build && npm run start:prod
 * ```
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  GlobalExceptionFilter,
  TransformInterceptor,
  LoggingInterceptor,
} from './common';

async function bootstrap() {
  // 创建 NestJS 应用实例
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 8081);

  // 配置全局验证管道 - 自动校验 DTO 参数
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 移除未定义的属性
      forbidNonWhitelisted: true, // 拒绝未定义的属性
      transform: true, // 自动转换类型
      transformOptions: { enableImplicitConversion: true }, // 启用隐式类型转换
    }),
  );

  // 注册全局异常过滤器 - 统一异常处理
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 注册全局拦截器 - 统一响应格式和日志记录
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 配置 CORS 跨域策略
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    credentials: true,
  });

  // 配置 Swagger API 文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('企业级管理系统 API')
    .setDescription('企业级管理系统后端 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // 设置全局路由前缀
  app.setGlobalPrefix('api/v1');

  // 启动 HTTP 服务器
  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
