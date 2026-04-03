import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * CORS 跨域中间件 - 处理跨域资源共享
 *
 * @description
 * 配置跨域资源共享（CORS）策略，允许前端应用跨域访问后端 API。
 * 支持配置允许的域名、请求方法、请求头、凭证等。
 * 适用于前后端分离架构，前端和后端部署在不同域名或端口。
 *
 * 配置选项：
 * - origin: 允许的域名，支持字符串、数组、正则、函数
 * - methods: 允许的 HTTP 方法
 * - allowedHeaders: 允许的请求头
 * - exposedHeaders: 暴露给客户端的响应头
 * - credentials: 是否允许携带凭证（Cookie、Authorization）
 * - maxAge: 预检请求缓存时间（秒）
 *
 * @example
 * ```typescript
 * // app.module.ts 中注册
 * export class AppModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(CorsMiddleware)
 *       .forRoutes('*');
 *   }
 * }
 *
 * // 或使用 NestJS 内置的 enableCors（推荐）
 * // main.ts
 * app.enableCors({
 *   origin: ['http://localhost:3000', 'https://example.com'],
 *   credentials: true,
 * });
 *
 * // 动态配置 - 根据请求来源判断
 * @Injectable()
 * export class CorsMiddleware implements NestMiddleware {
 *   use(req: Request, res: Response, next: NextFunction) {
 *     const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];
 *     const origin = req.headers.origin;
 *     if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
 *       res.header('Access-Control-Allow-Origin', origin);
 *     }
 *     next();
 *   }
 * }
 * ```
 */
@Injectable()
export class CorsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorsMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin;
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((o) =>
      o.trim(),
    ) || ['*'];

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin || '')) {
      res.header('Access-Control-Allow-Origin', origin || '*');
    }

    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID',
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    next();
  }
}
