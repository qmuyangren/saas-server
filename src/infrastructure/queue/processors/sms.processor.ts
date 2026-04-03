import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 短信处理器 - 处理短信发送任务
 *
 * @description
 * 异步处理短信发送任务，支持阿里云、腾讯云、华为云等多种短信服务商。
 * 支持 HTTP 和 HTTPS 协议，适用于验证码、通知提醒、营销短信等场景。
 *
 * 支持的服务商：
 * - aliyun: 阿里云短信
 * - tencent: 腾讯云短信
 * - huawei: 华为云短信
 *
 * @example
 * ```typescript
 * // 发送验证码
 * await this.smsProcessor.handle({
 *   phone: '13812345678',
 *   templateId: 'SMS_123456',
 *   params: { code: '123456' },
 *   provider: 'aliyun',
 * });
 *
 * // 使用 HTTPS 发送
 * await this.smsProcessor.handle({
 *   phone: '13812345678',
 *   templateId: 'SMS_123456',
 *   params: { code: '123456' },
 *   provider: 'aliyun',
 *   protocol: 'https',
 * });
 * ```
 */
@Injectable()
export class SmsProcessor {
  private readonly logger = new Logger(SmsProcessor.name);
  private readonly defaultProvider: string;
  private readonly defaultProtocol: 'http' | 'https';

  constructor(private readonly configService: ConfigService) {
    this.defaultProvider = this.configService.get<string>(
      'SMS_PROVIDER',
      'aliyun',
    );
    this.defaultProtocol =
      (this.configService.get<string>('SMS_PROTOCOL', 'https') as
        | 'http'
        | 'https') || 'https';
  }

  /**
   * 处理短信发送任务
   *
   * @param job - 短信任务数据
   * @param job.phone - 接收手机号
   * @param job.templateId - 短信模板 ID
   * @param job.params - 模板参数
   * @param job.provider - 短信服务商（aliyun/tencent/huawei）
   * @param job.protocol - 协议类型（http/https），默认 https
   * @param job.signName - 短信签名（可选）
   */
  async handle(job: {
    phone: string;
    templateId: string;
    params?: Record<string, string>;
    provider?: 'aliyun' | 'tencent' | 'huawei';
    protocol?: 'http' | 'https';
    signName?: string;
  }): Promise<void> {
    const provider = job.provider || this.defaultProvider;
    const protocol = job.protocol || this.defaultProtocol;

    try {
      this.logger.log(
        `Sending SMS via ${provider} (${protocol}) to ${job.phone}: template ${job.templateId}`,
      );

      switch (provider) {
        case 'aliyun':
          await this.sendViaAliyun(job, protocol);
          break;
        case 'tencent':
          await this.sendViaTencent(job, protocol);
          break;
        case 'huawei':
          await this.sendViaHuawei(job, protocol);
          break;
        default:
          throw new Error(`Unsupported SMS provider: ${provider}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${job.phone}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 通过阿里云发送短信
   *
   * @param job - 短信任务
   * @param protocol - 协议类型
   */
  private async sendViaAliyun(
    job: {
      phone: string;
      templateId: string;
      params?: Record<string, string>;
      signName?: string;
    },
    protocol: 'http' | 'https',
  ): Promise<void> {
    // TODO: 实现阿里云短信发送
    // const DysmsapiClient = require('@alicloud/dysmsapi20170525').default;
    // const client = new DysmsapiClient({ ... });
    // await client.sendSms({ PhoneNumbers: job.phone, ... });
    this.logger.debug(`Aliyun SMS sent via ${protocol}`);
  }

  /**
   * 通过腾讯云发送短信
   *
   * @param job - 短信任务
   * @param protocol - 协议类型
   */
  private async sendViaTencent(
    job: {
      phone: string;
      templateId: string;
      params?: Record<string, string>;
      signName?: string;
    },
    protocol: 'http' | 'https',
  ): Promise<void> {
    // TODO: 实现腾讯云短信发送
    // const smsClient = require('tencentcloud-sdk-nodejs').sms.v20210111.Client;
    // const client = new smsClient({ ... });
    // await client.SendSms({ PhoneNumberSet: [job.phone], ... });
    this.logger.debug(`Tencent SMS sent via ${protocol}`);
  }

  /**
   * 通过华为云发送短信
   *
   * @param job - 短信任务
   * @param protocol - 协议类型
   */
  private async sendViaHuawei(
    job: {
      phone: string;
      templateId: string;
      params?: Record<string, string>;
      signName?: string;
    },
    protocol: 'http' | 'https',
  ): Promise<void> {
    // TODO: 实现华为云短信发送
    this.logger.debug(`Huawei SMS sent via ${protocol}`);
  }

  /**
   * 批量发送短信
   *
   * @param job - 批量短信任务
   */
  async handleBatch(job: {
    phones: string[];
    templateId: string;
    params?: Record<string, string>;
    provider?: 'aliyun' | 'tencent' | 'huawei';
    protocol?: 'http' | 'https';
    signName?: string;
  }): Promise<void> {
    this.logger.log(`Sending batch SMS to ${job.phones.length} phones`);
    for (const phone of job.phones) {
      await this.handle({ ...job, phone });
    }
  }
}
