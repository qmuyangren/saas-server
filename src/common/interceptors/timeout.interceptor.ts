import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
  SetMetadata,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

/**
 * 超时装饰器 - 用于设置接口超时时间
 *
 * @description
 * 标记需要自定义超时时间的接口，配合 `TimeoutInterceptor` 使用。
 * 当接口响应时间超过设定值时，抛出 `RequestTimeoutException`。
 *
 * @param ms - 超时时间（毫秒），默认 5000ms
 *
 * @example
 * ```typescript
 * // 设置 10 秒超时
 * @Timeout(10000)
 * @Get('export')
 * async exportData() {
 *   return this.dataService.export();
 * }
 * ```
 */
export const Timeout = (ms: number) => SetMetadata('timeout', ms);

/**
 * 超时拦截器 - 控制接口响应超时时间
 *
 * @description
 * 拦截请求并设置响应超时时间，超过时间未响应则抛出超时异常。
 * 支持通过 `@Timeout(ms)` 装饰器自定义超时时间，默认 5000ms。
 *
 * @example
 * ```typescript
 * // main.ts 全局注册
 * app.useGlobalInterceptors(new TimeoutInterceptor());
 *
 * // 控制器中使用
 * @Timeout(10000)
 * @Get('slow-operation')
 * async slowOperation() {
 *   return this.service.doSomethingSlow();
 * }
 * ```
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly DEFAULT_TIMEOUT = 5000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeoutMs =
      Reflect.getMetadata('timeout', context.getHandler()) ??
      Reflect.getMetadata('timeout', context.getClass()) ??
      this.DEFAULT_TIMEOUT;

    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException({
                code: 408,
                message: `请求超时（${timeoutMs}ms）`,
              }),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
