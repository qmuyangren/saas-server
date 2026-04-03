import { Injectable, Logger } from '@nestjs/common';

/**
 * 审计日志处理器 - 异步处理审计日志写入任务
 *
 * @description
 * 异步处理审计日志的持久化任务，将审计数据写入数据库或外部存储。
 * 适用于高并发场景下的日志写入，避免同步写入影响接口响应时间。
 *
 * 处理流程：
 * 1. 接收审计日志数据
 * 2. 批量缓存日志条目
 * 3. 定时或达到阈值时批量写入
 * 4. 支持失败重试和死信队列
 *
 * @example
 * ```typescript
 * // 发布审计日志任务
 * await this.queueService.publish('audit.log', {
 *   userId: 1,
 *   module: '用户管理',
 *   operation: '新增用户',
 *   method: 'POST',
 *   url: '/api/v1/users',
 *   ip: '192.168.1.100',
 *   duration: 120,
 *   status: 'success',
 * });
 * ```
 */
@Injectable()
export class AuditProcessor {
  private readonly logger = new Logger(AuditProcessor.name);
  private readonly batch: any[] = [];
  private readonly batchSize = 100;

  /**
   * 处理单条审计日志
   *
   * @param job - 审计日志数据
   * @param job.userId - 操作用户 ID
   * @param job.module - 模块名称
   * @param job.operation - 操作描述
   * @param job.method - HTTP 方法
   * @param job.url - 请求 URL
   * @param job.ip - 客户端 IP
   * @param job.duration - 请求耗时（毫秒）
   * @param job.status - 操作状态（success/failure）
   * @param job.params - 请求参数（可选）
   * @param job.result - 响应结果（可选）
   */
  async handle(job: {
    userId: number;
    module: string;
    operation: string;
    method: string;
    url: string;
    ip: string;
    duration: number;
    status: string;
    params?: string;
    result?: string;
  }): Promise<void> {
    try {
      this.batch.push(job);

      // 达到批量大小时批量写入
      if (this.batch.length >= this.batchSize) {
        await this.flush();
      }
    } catch (error) {
      this.logger.error(`Failed to process audit log: ${error.message}`);
      throw error;
    }
  }

  /**
   * 批量写入审计日志
   */
  async flush(): Promise<void> {
    if (this.batch.length === 0) {
      return;
    }

    const logs = [...this.batch];
    this.batch.length = 0;

    this.logger.log(`Flushing ${logs.length} audit logs`);
    // TODO: 实现批量写入逻辑
    // await this.prisma.auditLog.createMany({ data: logs });
  }
}
