import { IsString, IsNotEmpty, IsOptional, IsInt, MinLength } from 'class-validator';

/**
 * 账密登录请求
 */
export class LoginAccountDto {
  /**
   * 账号（用户名或邮箱）
   * @example "admin"
   */
  @IsNotEmpty({ message: '账号不能为空' })
  @IsString({ message: '账号必须是字符串' })
  account: string;

  /**
   * 密码（支持 RSA 加密）
   * @example "123456" or encrypted base64 string
   */
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string;

  /**
   * 客户端ID
   * @example "business_a_web"
   */
  @IsNotEmpty({ message: '客户端ID不能为空' })
  @IsString({ message: '客户端ID必须是字符串' })
  clientId: string;

  /**
   * 设备ID
   * @example "device-uuid-123"
   */
  @IsOptional()
  @IsString({ message: '设备ID必须是字符串' })
  deviceId?: string;

  /**
   * 设备名称
   * @example "Chrome Browser"
   */
  @IsOptional()
  @IsString({ message: '设备名称必须是字符串' })
  deviceName?: string;

  /**
   * 验证码ID（滑块验证码）
   * @example "captcha-id-123"
   */
  @IsOptional()
  @IsString({ message: '验证码ID必须是字符串' })
  captchaId?: string;

  /**
   * 验证码值
   * @example "123"
   */
  @IsOptional()
  @IsString({ message: '验证码值必须是字符串' })
  captchaValue?: string;

  /**
   * 租户ID（可选，如果用户只属于一个租户）
   * @example "1"
   */
  @IsOptional()
  @IsString({ message: '租户ID必须是字符串' })
  tenantId?: string;
}

/**
 * 微信扫码登录请求
 */
export class LoginWechatQrcodeDto {
  /**
   * 客户端ID
   * @example "business_a_web"
   */
  @IsNotEmpty({ message: '客户端ID不能为空' })
  @IsString({ message: '客户端ID必须是字符串' })
  clientId: string;
}

/**
 * 轮询扫码状态请求
 */
export class LoginWechatStatusDto {
  /**
   * 登录状态ID（由后端生成）
   * @example "state-uuid-123"
   */
  @IsNotEmpty({ message: 'state不能为空' })
  @IsString({ message: 'state必须是字符串' })
  state: string;
}

/**
 * 第三方登录请求
 */
export class LoginThirdpartyDto {
  /**
   * 第三方平台（wechat, dingtalk, github等）
   * @example "wechat"
   */
  @IsNotEmpty({ message: 'provider不能为空' })
  @IsString({ message: 'provider必须是字符串' })
  provider: string;

  /**
   * 客户端ID
   * @example "business_a_web"
   */
  @IsNotEmpty({ message: '客户端ID不能为空' })
  @IsString({ message: '客户端ID必须是字符串' })
  clientId: string;

  /**
   * 授权码（由第三方平台返回）
   * @example "auth-code-123"
   */
  @IsNotEmpty({ message: 'code不能为空' })
  @IsString({ message: 'code必须是字符串' })
  code: string;

  /**
   * 状态值
   * @example "state-uuid-123"
   */
  @IsOptional()
  @IsString({ message: 'state必须是字符串' })
  state?: string;
}

/**
 * 修改密码请求
 */
export class UpdatePasswordDto {
  /**
   * 旧密码
   * @example "old123456"
   */
  @IsNotEmpty({ message: '旧密码不能为空' })
  @MinLength(6, { message: '旧密码长度不能少于6位' })
  oldPassword: string;

  /**
   * 新密码
   * @example "new123456"
   */
  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(6, { message: '新密码长度不能少于6位' })
  newPassword: string;

  /**
   * 确认新密码
   * @example "new123456"
   */
  @IsNotEmpty({ message: '确认密码不能为空' })
  @MinLength(6, { message: '确认密码长度不能少于6位' })
  confirmNewPassword: string;
}
