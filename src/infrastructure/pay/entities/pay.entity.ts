/**
 * 支付配置
 */
export interface PayConfig {
  /**
   * 支付平台: alipay, wechat, unionpay
   */
  platform: 'alipay' | 'wechat' | 'unionpay';

  /**
   * 应用ID
   */
  appId: string;

  /**
   * 商户私钥
   */
  privateKey: string;

  /**
   * 支付宝公钥
   */
  alipayPublicKey?: string;

  /**
   * 回调地址
   */
  notifyUrl: string;

  /**
   * 页面回调地址
   */
  returnUrl?: string;

  /**
   * 是否沙箱环境
   */
  sandbox?: boolean;
}

/**
 * 支付订单信息
 */
export interface PayOrderInfo {
  /**
   * 订单号
   */
  outTradeNo: string;

  /**
   * 订单标题
   */
  subject: string;

  /**
   * 订单金额（元）
   */
  totalAmount: number;

  /**
   * 商品描述
   */
  body?: string;

  /**
   * 该订单允许支付的时间
   */
  timeoutExpress?: string;
}

/**
 * 支付结果
 */
export interface PayResult {
  /**
   * 支付是否成功
   */
  success: boolean;

  /**
   * 交易号
   */
  tradeNo?: string;

  /**
   * 商户订单号
   */
  outTradeNo?: string;

  /**
   * 通知ID
   */
  notifyId?: string;

  /**
   * 通知时间
   */
  notifyTime?: string;

  /**
   * 通知参数
   */
  notifyParams?: any;
}

/**
 * 支付宝支付结果
 */
export interface AlipayPayResult {
  /**
   * 支付是否成功
   */
  success: boolean;

  /**
   * 交易号
   */
  tradeNo?: string;

  /**
   * 商户订单号
   */
  outTradeNo?: string;

  /**
   * 二维码内容（Native支付）
   */
  qrCode?: string;

  /**
   * 支付链接
   */
  url?: string;

  /**
   * 消息
   */
  message?: string;
}

/**
 * 微信支付结果
 */
export interface WechatPayResult {
  /**
   * 支付是否成功
   */
  success: boolean;

  /**
   * 交易号
   */
  tradeNo?: string;

  /**
   * 商户订单号
   */
  outTradeNo?: string;

  /**
   * 二维码地址（Native支付）
   */
  codeUrl?: string;

  /**
   * 预支付ID
   */
  prepayId?: string;

  /**
   * 支付签名
   */
  paySign?: string;

  /**
   * 消息
   */
  message?: string;
}

/**
 * 退款结果
 */
export interface RefundResult {
  /**
   * 退款是否成功
   */
  success: boolean;

  /**
   * 退款ID
   */
  refundId?: string;

  /**
   * 商户订单号
   */
  outTradeNo?: string;

  /**
   * 退款金额
   */
  refundAmount?: number;

  /**
   * 消息
   */
  message?: string;
}

/**
 * 订单查询结果
 */
export interface QueryOrderResult {
  /**
   * 查询是否成功
   */
  success: boolean;

  /**
   * 交易号
   */
  tradeNo?: string;

  /**
   * 商户订单号
   */
  outTradeNo?: string;

  /**
   * 订单状态
   */
  status: 'pending' | 'success' | 'failed' | 'closed';

  /**
   * 订单金额
   */
  totalAmount?: number;

  /**
   * 消息
   */
  sendMessage?: string;
}
