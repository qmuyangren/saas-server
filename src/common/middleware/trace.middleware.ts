import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * 请求追踪中间件 - 为每个请求分配唯一追踪 ID
 *
 * @description
 * 为每个 HTTP 请求生成唯一的 `X-Request-ID` 追踪标识，贯穿整个请求生命周期。
 * 便于在日志中追踪同一个请求的所有处理步骤，快速定位问题。
 * 如果请求头中已包含 `X-Request-ID`，则复用该值（适用于网关转发场景）。
 *
 * 追踪 ID 传递链路：
 * 1. 网关/客户端发起请求，可携带 `X-Request-ID`
 * 2. 中间件生成或复用 `X-Request-ID`
 * 3. 所有日志输出自动包含该 ID
 * 4. 响应头中返回 `X-Request-ID`，方便客户端关联
 *
 * @example
 * ```typescript
 * // app.module.ts 中注册
 * export class AppModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer.apply(TraceMiddleware).forRoutes('*');
 *   }
 * }
 *
 * // 控制器中获取追踪 ID
 * @Get('list')
 * async findAll(@Req() req: Request) {
 *   const traceId = req.headers['x-request-id'];
 *   this.logger.log(`处理请求: ${traceId}`);
 *   return this.service.findAll();
 * }
 *
 * // 服务中通过 AsyncLocalStorage 获取
 * const traceId = AsyncLocalStorage.getInstance().getStore()?.traceId;
 * ```
 */
@Injectable()
export class TraceMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TraceMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const traceId =
      (req.headers['x-request-id'] as string) || uuidv4().replace(/-/g, '');

    req.headers['x-request-id'] = traceId;
    res.setHeader('X-Request-ID', traceId);

    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} - ${traceId} - ${duration}ms`,
      );
    });

    next();
  }
}
