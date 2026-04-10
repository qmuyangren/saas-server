import { IsString, IsNotEmpty, IsOptional, IsInt, MinLength, IsEmail } from 'class-validator';

/**
 * 租户注册请求
 */
export class TenantRegisterDto {
  /**
   * 租户名称
   * @example "企业名称"
   */
  @IsNotEmpty({ message: '租户名称不能为空' })
  @IsString({ message: '租户名称必须是字符串' })
  name: string;

  /**
   * 租户编码（唯一标识）
   * @example "company_a"
   */
  @IsNotEmpty({ message: '租户编码不能为空' })
  @IsString({ message: '租户编码必须是字符串' })
  code: string;

  /**
   * 联系人姓名
   * @example "张三"
   */
  @IsNotEmpty({ message: '联系人姓名不能为空' })
  @IsString({ message: '联系人姓名必须是字符串' })
  contactName: string;

  /**
   * 联系手机号
   * @example "13800138000"
   */
  @IsNotEmpty({ message: '联系手机号不能为空' })
  @IsString({ message: '联系手机号必须是字符串' })
  @MinLength(11, { message: '手机号格式不正确' })
  contactPhone: string;

  /**
   * 联系邮箱
   * @example "contact@example.com"
   */
  @IsNotEmpty({ message: '联系邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  contactEmail: string;

  /**
   * 域名（可选）
   * @example "https://company.example.com"
   */
  @IsOptional()
  @IsString({ message: '域名必须是字符串' })
  domain?: string;

  /**
   * 管理员姓名
   * @example "管理员"
   */
  @IsNotEmpty({ message: '管理员姓名不能为空' })
  @IsString({ message: '管理员姓名必须是字符串' })
  adminName: string;

  /**
   * 管理员账号
   * @example "admin"
   */
  @IsNotEmpty({ message: '管理员账号不能为空' })
  @IsString({ message: '管理员账号必须是字符串' })
  adminUsername: string;

  /**
   * 管理员密码
   * @example "Admin123!@#"
   */
  @IsNotEmpty({ message: '管理员密码不能为空' })
  @MinLength(8, { message: '密码长度不能少于8位' })
  adminPassword: string;
}

/**
 * 租户配置更新请求
 */
export class TenantConfigUpdateDto {
  /**
   * 租户名称
   */
  @IsOptional()
  @IsString({ message: '租户名称必须是字符串' })
  name?: string;

  /**
   * 联系人姓名
   */
  @IsOptional()
  @IsString({ message: '联系人姓名必须是字符串' })
  contactName?: string;

  /**
   * 联系手机号
   */
  @IsOptional()
  @IsString({ message: '联系手机号必须是字符串' })
  contactPhone?: string;

  /**
   * 联系邮箱
   */
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  contactEmail?: string;

  /**
   * 域名
   */
  @IsOptional()
  @IsString({ message: '域名必须是字符串' })
  domain?: string;
}
