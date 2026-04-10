/**
 * 第三方登录配置
 */
export interface OAuthConfig {
  /**
   * 客户端ID
   */
  clientId: string;

  /**
   * 客户端密钥
   */
  clientSecret: string;

  /**
   * 授权回调地址
   */
  redirectUri: string;

  /**
   * 授权端点
   */
  authorizeUrl: string;

  /**
   * 令牌端点
   */
  tokenUrl: string;

  /**
   * 用户信息端点
   */
  userInfoUrl: string;

  /**
   * SCOPE
   */
  scope?: string;
}

/**
 * OAuth 用户信息
 */
export interface OAuthUserInfo {
  /**
   * 平台唯一ID
   */
  id: string;

  /**
   * 昵称
   */
  name?: string;

  /**
   * 昵称
   */
  nickname?: string;

  /**
   * 头像
   */
  avatar?: string;

  /**
   * 邮箱
   */
  email?: string;

  /**
   * 开放ID（微信特有）
   */
  unionid?: string;

  [key: string]: any;
}

/**
 * OAuth 登录结果
 */
export interface OAuthLoginResult {
  /**
   * 登录是否成功
   */
  success: boolean;

  /**
   * 用户信息
   */
  user?: OAuthUserInfo;

  /**
   * 消息
   */
  message?: string;

  /**
   * 平台
   */
  platform?: string;
}
