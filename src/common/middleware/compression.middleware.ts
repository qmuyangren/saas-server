import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import compression from 'compression';

/**
 * 响应压缩中间件 - 自动压缩 HTTP 响应数据
 *
 * @description
 * 使用 gzip/deflate 算法自动压缩 HTTP 响应体，减少网络传输量，提升接口响应速度。
 * 适用于响应数据较大的接口（如列表查询、文件导出、大数据量接口等）。
 * 压缩率通常可达 60-80%，显著提升用户体验。
 *
 * 压缩策略：
 * - 仅压缩 `text/*`、`application/json`、`application/xml` 等文本类型
 * - 不压缩已压缩的文件类型（图片、视频、zip 等）
 * - 响应体小于阈值时不压缩（避免压缩开销大于收益）
 * - 根据客户端 `Accept-Encoding` 头选择压缩算法
 *
 * @example
 * ```typescript
 * // app.module.ts 中注册
 * export class AppModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(CompressionMiddleware)
 *       .forRoutes('*');
 *   }
 * }
 *
 * // 或使用 Express 内置的 compression（推荐）
 * // main.ts
 * import * as compression from 'compression';
 * app.use(compression({
 *   level: 6,           // 压缩级别 1-9，默认 6
 *   threshold: 1024,    // 小于 1KB 不压缩
 *   filter: (req, res) => {
 *     if (req.headers['x-no-compression']) {
 *       return false;
 *     }
 *     return compression.filter(req, res);
 *   },
 * }));
 * ```
 */
@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CompressionMiddleware.name);
  private compressionFn: any;

  constructor() {
    this.compressionFn = compression({
      level: 6,
      threshold: 1024,
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.compressionFn(req, res, next);
  }
}
