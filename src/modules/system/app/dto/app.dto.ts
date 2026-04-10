import { IsString, IsNotEmpty, IsOptional, IsInt, MinLength } from 'class-validator';

/**
 * 应用注册请求
 */
export class AppRegisterDto {
  /**
   * 业务ID
   * @example 1
   */
  @IsNotEmpty({ message: '业务ID不能为空' })
  @IsInt({ message: '业务ID必须是整数' })
  businessId: number;

  /**
   * 应用名称
   * @example "Web前端"
   */
  @IsNotEmpty({ message: '应用名称不能为空' })
  @IsString({ message: '应用名称必须是字符串' })
  name: string;

  /**
   * 应用编码（唯一标识）
   * @example "web_frontend"
   */
  @IsNotEmpty({ message: '应用编码不能为空' })
  @IsString({ message: '应用编码必须是字符串' })
  code: string;

  /**
   * 应用类型：1-PC端，2-Mobile端，3-小程序
   * @example 1
   */
  @IsNotEmpty({ message: '应用类型不能为空' })
  @IsInt({ message: '应用类型必须是整数' })
  type: number;

  /**
   * 应用描述（可选）
   * @example "PC端管理系统"
   */
  @IsOptional()
  @IsString({ message: '应用描述必须是字符串' })
  description?: string;

  /**
   * 应用图标（可选）
   * @example "icon-web"
   */
  @IsOptional()
  @IsString({ message: '应用图标必须是字符串' })
  logo?: string;

  /**
   * 应用域名（可选）
   * @example "https://web.example.com"
   */
  @IsOptional()
  @IsString({ message: '应用域名必须是字符串' })
  domain?: string;
}

/**
 * 应用更新请求
 */
export class AppUpdateDto {
  /**
   * 应用名称
   */
  @IsOptional()
  @IsString({ message: '应用名称必须是字符串' })
  name?: string;

  /**
   * 应用类型：1-PC端，2-Mobile端，3-小程序
   */
  @IsOptional()
  @IsInt({ message: '应用类型必须是整数' })
  type?: number;

  /**
   * 应用描述（可选）
   */
  @IsOptional()
  @IsString({ message: '应用描述必须是字符串' })
  description?: string;

  /**
   * 应用图标（可选）
   */
  @IsOptional()
  @IsString({ message: '应用图标必须是字符串' })
  logo?: string;

  /**
   * 应用域名（可选）
   */
  @IsOptional()
  @IsString({ message: '应用域名必须是字符串' })
  domain?: string;
}
