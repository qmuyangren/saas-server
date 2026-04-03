import { Injectable, Logger } from '@nestjs/common';

/**
 * 邮件处理器 - 处理邮件发送任务
 *
 * @description
 * 异步处理邮件发送任务，支持模板渲染、附件、批量发送等功能。
 * 适用于注册验证、密码重置、通知提醒等邮件场景。
 *
 * 使用方式：
 * 1. 通过队列服务发布邮件发送任务
 * 2. 处理器自动消费任务并发送邮件
 * 3. 支持失败重试和死信队列
 *
 * @example
 * ```typescript
 * // 发布邮件任务
 * await this.queueService.publish('email.send', {
 *   to: 'user@example.com',
 *   subject: '欢迎注册',
 *   template: 'welcome',
 *   data: { username: '张三' },
 * });
 *
 * // 处理器自动处理
 * // 发送失败自动重试 3 次
 * ```
 */
@Injectable()
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  /**
   * 处理邮件发送任务
   *
   * @param job - 邮件任务数据
   * @param job.to - 收件人邮箱
   * @param job.subject - 邮件主题
   * @param job.template - 邮件模板名称
   * @param job.data - 模板数据
   * @param job.attachments - 附件列表（可选）
   */
  async handle(job: {
    to: string;
    subject: string;
    template: string;
    data: Record<string, any>;
    attachments?: Array<{ filename: string; content: Buffer }>;
  }): Promise<void> {
    try {
      this.logger.log(`Sending email to ${job.to}: ${job.subject}`);
      // TODO: 实现邮件发送逻辑
      // await this.mailService.send({ ... });
    } catch (error) {
      this.logger.error(`Failed to send email to ${job.to}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 处理批量邮件发送
   *
   * @param job - 批量邮件任务
   */
  async handleBatch(job: {
    recipients: string[];
    subject: string;
    template: string;
    data: Record<string, any>;
  }): Promise<void> {
    this.logger.log(
      `Sending batch email to ${job.recipients.length} recipients`,
    );
    for (const to of job.recipients) {
      await this.handle({ ...job, to });
    }
  }
}
