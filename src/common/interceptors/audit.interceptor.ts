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
 * 审计日志拦截器 - 自动记录用户操作日志
 *
 * @description
 * 拦截请求并自动记录操作日志，包括操作人、模块、操作类型、请求参数、响应结果、耗时等信息。
 * 配合 `@Audit()` 装饰器使用，支持配置是否记录请求参数和响应结果。
 * 适用于所有需要审计追踪的业务操作（CRUD、权限变更、敏感操作等）。
 *
 * 记录内容：
 * - 操作人信息（从 JWT token 中提取）
 * - 模块名称和操作描述（来自 `@Audit()` 配置）
 * - 请求方法和 URL
 * - 请求参数（可配置关闭）
 * - 响应结果（可配置关闭）
 * - 操作耗时（毫秒）
 * - 客户端 IP 和 User-Agent
 *
 * @example
 * ```typescript
 * // main.ts 全局注册
 * app.useGlobalInterceptors(new AuditInterceptor());
 *
 * // 控制器中使用
 * @Audit({ module: '用户管理', operation: '新增用户' })
 * @Post()
 * async create(@Body() dto: CreateUserDto) {
 *   return this.userService.create(dto);
 * }
 *
 * // 不记录敏感参数
 * @Audit({ module: '认证', operation: '用户登录', logParams: false })
 * @Post('login')
 * async login(@Body() dto: LoginDto) {
 *   return this.authService.login(dto);
 * }
 *
 * // 不记录大响应结果
 * @Audit({ module: '字典管理', operation: '导出字典', logResult: false })
 * @Post('export')
 * async exportDict() {
 *   return this.dictService.export();
 * }
 * ```
 *
 * @see {@link Audit} 审计配置装饰器
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const auditMeta = Reflect.getMetadata('audit', context.getHandler());

    if (!auditMeta) {
      return next.handle();
    }

    const startTime = Date.now();
    const user = request.user;
    const logParams = auditMeta.logParams !== false;
    const logResult = auditMeta.logResult !== false;

    const logData = {
      module: auditMeta.module,
      operation: auditMeta.operation,
      userId: user?.sub || user?.id,
      username: user?.email || user?.username,
      method: request.method,
      url: request.originalUrl,
      ip: request.ip,
      userAgent: request.get('user-agent'),
      params: logParams
        ? this.safeStringify(request.body || request.query)
        : null,
      startTime: new Date().toISOString(),
    };

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;
        const auditLog = {
          ...logData,
          result: logResult ? this.safeStringify(response) : null,
          duration,
          status: 'success',
          endTime: new Date().toISOString(),
        };

        this.logger.log(
          `[审计] ${auditLog.module} - ${auditLog.operation} | 用户: ${auditLog.username} | 耗时: ${duration}ms`,
        );

        // TODO: 将 auditLog 写入数据库或消息队列
        // this.auditService.save(auditLog);
      }),
    );
  }

  private safeStringify(data: any): string {
    try {
      const str = JSON.stringify(data);
      if (str.length > 10000) {
        return str.substring(0, 10000) + '... (truncated)';
      }
      return str;
    } catch {
      return String(data);
    }
  }
}
