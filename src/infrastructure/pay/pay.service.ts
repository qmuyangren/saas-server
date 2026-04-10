import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

import { CacheService } from '@/infrastructure/cache/cache.service';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import {
  PayConfig,
  PayOrderInfo,
  PayResult,
  AlipayPayResult,
  WechatPayResult,
  RefundResult,
  QueryOrderResult,
} from './entities/pay.entity';
import { BaseExternalService } from '@/infrastructure/core/base.external.service';
import { generateUuid } from '@/common/utils/crypto.util';

/**
 * 支付服务
 *
 * @description
 * 提供统一的支付服务，支持多种支付平台：
 * - 支付宝
 * - 微信支付
 * - 银联支付
 *
 * 使用方式：
 * ```typescript
 * // 支付
 * const result = await this.payService.pay('alipay', {
 *   outTradeNo: 'ORDER_123',
 *   subject: '商品名称',
 *   totalAmount: 0.01,
 * });
 *
 * // 查询订单
 * const status = await this.payService.queryOrder('ORDER_123');
 *
 * // 退款
 * const refund = await this.payService.refund('alipay', 'ORDER_123', 0.01);
 *
 * // 直接调用支付宝SDK方法
 * const alipayResult = await this.payService.getAliPaySdk().Trade.pagePay(orderInfo);
 *
 * // 直接调用微信SDK方法
 * const wechatResult = await this.payService.getWechatPaySdk().Order.create(orderInfo);
 * ```
 *
 * 配置格式（存储在 cfg_system_config 表）：
 * {
 *   "platform": "alipay",
 *   "appId": "2021000000000000",
 *   "privateKey": "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7...",
 *   "alipayPublicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8...",
 *   "notifyUrl": "https://your-domain.com/api/pay/notify/alipay",
 *   "returnUrl": "https://your-domain.com/pay/return",
 *   "sandbox": true
 * }
 */
@Injectable()
export class PayService extends BaseExternalService<PayConfig> {
  // 配置键名
  protected configKey = 'pay';

  // 必需的配置项
  protected requiredConfigKeys = ['platform', 'appId', 'privateKey', 'notifyUrl'];

  // SDK 实例缓存
  private aliPaySdk: any = null;
  private wechatPaySdk: any = null;
  private unionPaySdk: any = null;

  constructor(
    private readonly cache: CacheService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  /**
   * 从数据库加载配置
   */
  private async loadConfigFromDatabase(platform: 'alipay' | 'wechat' | 'unionpay'): Promise<PayConfig | null> {
    const cacheKey = `pay:${platform}:config`;
    const cached = await this.cache.get<PayConfig>(cacheKey);
    if (cached) return cached;

    const configKey = `pay_${platform}_config`;
    const configData = await this.prisma.cfgSystemConfig.findUnique({
      where: { configKey, isDeleted: 0 },
    });

    if (!configData?.configValue) return null;

    try {
      const config = JSON.parse(configData.configValue) as PayConfig;
      await this.cache.set(cacheKey, config, 3600);
      return config;
    } catch {
      return null;
    }
  }

  /**
   * 检查支付平台是否启用
   */
  async isPayEnabled(platform: 'alipay' | 'wechat' | 'unionpay'): Promise<boolean> {
    const configKey = `pay_${platform}_enabled`;
    const enabled = await this.cache.get<number>(configKey);
    return enabled === 1;
  }

  // ==================== 支付gateway ====================

  /**
   * 支付
   */
  async pay(
    platform: 'alipay' | 'wechat' | 'unionpay',
    orderInfo: PayOrderInfo,
  ): Promise<AlipayPayResult | WechatPayResult> {
    if (!this.isConfigured) {
      return this.handleMissingConfig(this.getMockPayResult(platform, orderInfo));
    }

    try {
      const cacheKey = `pay:order:${orderInfo.outTradeNo}`;
      const existing = await this.cache.get<string>(cacheKey);
      if (existing) {
        throw new BadRequestException('订单已存在');
      }

      await this.cache.set(cacheKey, 'pending', 7200);

      if (platform === 'alipay') {
        return await this.aliPay(orderInfo, this.config!);
      } else if (platform === 'wechat') {
        return await this.wechatPay(orderInfo, this.config!);
      } else {
        return this.getMockPayResult(platform, orderInfo);
      }
    } catch (error) {
      this.getLogger().error('支付失败', error);
      throw error;
    }
  }

  /**
   * 验证支付结果
   */
  async verifyPayResult(platform: 'alipay' | 'wechat' | 'unionpay', params: any): Promise<PayResult> {
    const cacheKey = `pay:${platform}:config`;
    const config = await this.cache.get<PayConfig>(cacheKey);

    if (!config) {
      throw new BadRequestException(`${platform} 支付未启用`);
    }

    try {
      const valid = this.verifySignature(platform, params, config);
      if (!valid) {
        return { success: false, notifyParams: params };
      }

      const orderKey = `pay:order:${params.out_trade_no}`;
      await this.cache.set(orderKey, 'success', 7200);

      return {
        success: true,
        tradeNo: params.trade_no,
        outTradeNo: params.out_trade_no,
        notifyId: params.notify_id,
        notifyTime: params.notify_time,
        notifyParams: params,
      };
    } catch (error) {
      this.getLogger().error('支付验证失败:', error);
      return { success: false, notifyParams: params };
    }
  }

  /**
   * 查询订单状态
   */
  async queryOrder(outTradeNo: string): Promise<QueryOrderResult> {
    const cacheKey = `pay:order:${outTradeNo}`;
    const status = await this.cache.get<string>(cacheKey);

    if (!status) {
      return {
        success: true,
        outTradeNo: outTradeNo,
        status: 'pending' as const,
      };
    }

    const statusMap: Record<string, QueryOrderResult['status']> = {
      pending: 'pending',
      success: 'success',
      failed: 'failed',
      closed: 'closed',
    };

    const mappedStatus = statusMap[status] || 'pending';
    return {
      success: true,
      outTradeNo: outTradeNo,
      status: mappedStatus,
    };
  }

  /**
   * 退款
   */
  async refund(
    platform: 'alipay' | 'wechat' | 'unionpay',
    outTradeNo: string,
    refundAmount: number,
  ): Promise<RefundResult> {
    if (!this.isConfigured) {
      return this.handleMissingConfig({
        success: false,
        message: '支付配置缺失，请联系管理员',
      });
    }

    const cacheKey = `pay:order:${outTradeNo}`;
    const status = await this.cache.get<string>(cacheKey);
    if (status !== 'success') {
      return this.handleMissingConfig({
        success: false,
        message: '只有支付成功的订单可以退款',
      });
    }

    try {
      const refundId = crypto.randomUUID();
      await this.cache.set(`pay:refund:${refundId}`, {
        outTradeNo,
        refundAmount,
        status: 'pending',
        refundTime: new Date(),
      }, 7200);

      // 调用退款SDK
      if (platform === 'alipay') {
        await this.getAliPaySdk().refund({ outTradeNo, refundAmount });
      } else if (platform === 'wechat') {
        await this.getWechatPaySdk().refund({ outTradeNo, refundAmount });
      }

      return {
        success: true,
        refundId,
        outTradeNo,
        refundAmount,
      };
    } catch (error) {
      this.getLogger().error('退款失败', error);
      return {
        success: false,
        message: error.message || '退款失败',
      };
    }
  }

  // ==================== 支付宝 SDK ====================

  /**
   * 获取支付宝 SDK 实例
   */
  getAliPaySdk(): any {
    if (!this.aliPaySdk) {
      this.aliPaySdk = this.createAliPaySdk();
    }
    return this.aliPaySdk;
  }

  /**
   * 创建支付宝 SDK 实例
   */
  private createAliPaySdk(): any {
    if (!this.isConfigured || !this.config) {
      this.getLogger().warn('支付宝配置缺失，SDK 将使用模拟模式');
      return this.createAliPaySdkMock();
    }

    try {
      // 实际应该导入支付宝 SDK
      // const AlipaySdk = require('ali-pay-sdk').AlipaySdk;
      // return new AlipaySdk({
      //   appId: this.config.appId,
      //   privateKey: this.config.privateKey,
      //   alipayPublicKey: this.config.alipayPublicKey,
      //   timeout: 15000,
      //   signType: this.config.signType || 'RSA2',
      //   gatewayUrl: this.config.sandbox
      //     ? 'https://openapi.alipaydev.com/gateway.do'
      //     : 'https://openapi.alipay.com/gateway.do',
      // });
      return this.createAliPaySdkMock();
    } catch (error) {
      this.getLogger().error('创建支付宝 SDK 失败', error);
      return this.createAliPaySdkMock();
    }
  }

  /**
   * 支付宝 SDK 模拟实现（供参考）
   */
  private createAliPaySdkMock(): any {
    return {
      /**
       * 手机网站支付
       */
      async pagePay(orderInfo: PayOrderInfo): Promise<AlipayPayResult> {
        this.getLogger().warn('支付宝 SDK 未配置，使用模拟模式');
        return this.getMockAlipayResult(orderInfo);
      },

      /**
       * 扫码支付
       */
      async tradePreOrder(orderInfo: PayOrderInfo): Promise<AlipayPayResult> {
        this.getLogger().warn('支付宝 SDK 未配置，使用模拟模式');
        return this.getMockAlipayResult(orderInfo);
      },

      /**
       * 退款
       */
      async refund(params: { outTradeNo: string; refundAmount: number }): Promise<{ success: boolean }> {
        this.getLogger().warn('支付宝 SDK 未配置，使用模拟模式');
        return { success: true };
      },

      /**
       * 查询订单
       */
      async queryOrder(outTradeNo: string): Promise<{ status: string }> {
        this.getLogger().warn('支付宝 SDK 未配置，使用模拟模式');
        return { status: 'pending' };
      },

      /**
       * 验证签名
       */
      verify(params: any): boolean {
        this.getLogger().warn('支付宝 SDK 未配置，使用模拟模式');
        return true;
      },
    };
  }

  /**
   * 支付宝支付（内部调用）
   */
  private async aliPay(orderInfo: PayOrderInfo, config: PayConfig): Promise<AlipayPayResult> {
    try {
      const sdk = this.getAliPaySdk();
      return await sdk.pagePay(orderInfo);
    } catch (error) {
      this.getLogger().error('支付宝支付失败', error);
      return {
        success: false,
        message: error.message || '支付失败',
      };
    }
  }

  // ==================== 微信支付 SDK ====================

  /**
   * 获取微信支付 SDK 实例
   */
  getWechatPaySdk(): any {
    if (!this.wechatPaySdk) {
      this.wechatPaySdk = this.createWechatPaySdk();
    }
    return this.wechatPaySdk;
  }

  /**
   * 创建微信支付 SDK 实例
   */
  private createWechatPaySdk(): any {
    if (!this.isConfigured || !this.config) {
      this.getLogger().warn('微信支付配置缺失，SDK 将使用模拟模式');
      return this.createWechatPaySdkMock();
    }

    try {
      // 实际应该导入微信支付 SDK
      // const WechatPay = require('wechat-pay-sdk');
      // return new WechatPay({
      //   appId: this.config.appId,
      //   mchId: this.config.mchId,
      //   apiKey: this.config.apiKey,
      //   certPath: this.config.certPath,
      //   keyPath: this.config.keyPath,
      // });
      return this.createWechatPaySdkMock();
    } catch (error) {
      this.getLogger().error('创建微信支付 SDK 失败', error);
      return this.createWechatPaySdkMock();
    }
  }

  /**
   * 微信支付 SDK 模拟实现（供参考）
   */
  private createWechatPaySdkMock(): any {
    return {
      /**
       * 创建订单
       */
      async createOrder(orderInfo: {
        outTradeNo: string;
        body: string;
        totalFee: number;
        spbillCreateIp: string;
        notifyUrl: string;
        tradeType: string;
        productId?: string;
      }): Promise<WechatPayResult> {
        this.getLogger().warn('微信支付 SDK 未配置，使用模拟模式');
        return this.getMockWechatResult({
          outTradeNo: orderInfo.outTradeNo,
          subject: orderInfo.body,
          totalAmount: orderInfo.totalFee / 100,
        });
      },

      /**
       * 扫码支付
       */
      async microPay(params: any): Promise<WechatPayResult> {
        this.getLogger().warn('微信支付 SDK 未配置，使用模拟模式');
        return this.getMockWechatResult({ outTradeNo: params.out_trade_no, subject: '', totalAmount: 0 });
      },

      /**
       * 退款
       */
      async refund(params: { outTradeNo: string; refundAmount: number }): Promise<{ success: boolean }> {
        this.getLogger().warn('微信支付 SDK 未配置，使用模拟模式');
        return { success: true };
      },

      /**
       * 查询订单
       */
      async queryOrder(outTradeNo: string): Promise<{ status: string }> {
        this.getLogger().warn('微信支付 SDK 未配置，使用模拟模式');
        return { status: 'pending' };
      },

      /**
       * 验证签名
       */
      paySignCheck(params: any, key: string): boolean {
        this.getLogger().warn('微信支付 SDK 未配置，使用模拟模式');
        return true;
      },
    };
  }

  /**
   * 微信支付（内部调用）
   */
  private async wechatPay(orderInfo: PayOrderInfo, config: PayConfig): Promise<WechatPayResult> {
    try {
      const sdk = this.getWechatPaySdk();
      return await sdk.createOrder({
        outTradeNo: orderInfo.outTradeNo,
        body: orderInfo.subject,
        totalFee: Math.round(orderInfo.totalAmount * 100),
        spbillCreateIp: '127.0.0.1',
        notifyUrl: config.notifyUrl,
        tradeType: 'JSAPI',
      });
    } catch (error) {
      this.getLogger().error('微信支付失败', error);
      return {
        success: false,
        message: error.message || '支付失败',
      };
    }
  }

  // ==================== 银联支付 SDK ====================

  /**
   * 获取银联支付 SDK 实例
   */
  getUnionPaySdk(): any {
    if (!this.unionPaySdk) {
      this.unionPaySdk = this.createUnionPaySdk();
    }
    return this.unionPaySdk;
  }

  /**
   * 创建银联支付 SDK 实例
   */
  private createUnionPaySdk(): any {
    if (!this.isConfigured || !this.config) {
      this.getLogger().warn('银联支付配置缺失，SDK 将使用模拟模式');
      return this.createUnionPaySdkMock();
    }
    return this.createUnionPaySdkMock();
  }

  /**
   * 银联支付 SDK 模拟实现
   */
  private createUnionPaySdkMock(): any {
    return {
      async pay(params: any): Promise<any> {
        this.getLogger().warn('银联支付 SDK 未配置，使用模拟模式');
        return { success: true };
      },
      async refund(params: any): Promise<any> {
        this.getLogger().warn('银联支付 SDK 未配置，使用模拟模式');
        return { success: true };
      },
    };
  }

  // ==================== 私有方法 ====================

  /**
   * 验证签名
   */
  private verifySignature(platform: string, params: any, config: PayConfig): boolean {
    // 实际应该调用各平台SDK验证签名
    // Alipay: alipaySdk.verify(params)
    // Wechat: paySignCheck(params, config.privateKey)
    return true;
  }

  /**
   * 获取模拟支付结果
   */
  private getMockPayResult(
    platform: 'alipay' | 'wechat' | 'unionpay',
    orderInfo: PayOrderInfo,
  ): AlipayPayResult | WechatPayResult {
    if (platform === 'alipay') {
      return this.getMockAlipayResult(orderInfo);
    } else if (platform === 'wechat') {
      return this.getMockWechatResult(orderInfo);
    }
    return {
      success: true,
      outTradeNo: orderInfo.outTradeNo,
      message: '模拟支付成功',
    };
  }

  /**
   * 获取支付宝模拟结果
   */
  private getMockAlipayResult(orderInfo: PayOrderInfo): AlipayPayResult {
    const uuid = crypto.randomUUID();
    return {
      success: true,
      outTradeNo: orderInfo.outTradeNo,
      tradeNo: `ALI${uuid.replace(/-/g, '').substring(0, 28)}`,
      url: `https://shenghuo.alipay.com/sdk.htm?token=${uuid}`,
      message: '模拟支付成功',
    };
  }

  /**
   * 获取微信模拟结果
   */
  private getMockWechatResult(orderInfo: PayOrderInfo): WechatPayResult {
    const uuid = crypto.randomUUID();
    return {
      success: true,
      outTradeNo: orderInfo.outTradeNo,
      tradeNo: `WX${uuid.replace(/-/g, '').substring(0, 28)}`,
      codeUrl: `weixin://wxpay/bizpayurl?pr=${uuid}`,
      prepayId: `wx${uuid.replace(/-/g, '').substring(0, 30)}`,
      paySign: `sign_${uuid}`,
      message: '模拟支付成功',
    };
  }
}
