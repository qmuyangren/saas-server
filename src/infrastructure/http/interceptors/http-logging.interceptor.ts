import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * HTTP 请求日志拦截器 - 记录外部 HTTP 请求详情
 *
 * @description
 * 拦截所有通过 HttpClientService 发起的外部 HTTP 请求，
 * 记录请求方法、URL、耗时、响应状态等信息。
 * 便于排查第三方 API 调用问题和性能分析。
 *
 * 记录内容：
 * - 请求方法和 URL
 * - 请求耗时（毫秒）
 * - 响应状态码
 * - 错误信息（如有）
 *
 * @example
 * ```typescript
 * // 在 HTTP 客户端模块中注册
 * @Module({
 *   providers: [
 *     HttpClientService,
 *     { provide: APP_INTERCEPTOR, useClass: HttpLoggingInterceptor },
 *   ],
 * })
 * export class HttpClientModule {}
 * ```
 */
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req?.method || 'UNKNOWN';
    const url = req?.url || 'UNKNOWN';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(`${method} ${url} - ${duration}ms`);
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `${method} ${url} - ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
