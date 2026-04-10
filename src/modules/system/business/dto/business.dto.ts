import { IsString, IsNotEmpty, IsOptional, IsInt, MinLength } from 'class-validator';

/**
 * 业务线注册请求
 */
export class BusinessRegisterDto {
  /**
   * 业务名称
   * @example "CRM系统"
   */
  @IsNotEmpty({ message: '业务名称不能为空' })
  @IsString({ message: '业务名称必须是字符串' })
  name: string;

  /**
   * 业务编码（唯一标识）
   * @example "crm_system"
   */
  @IsNotEmpty({ message: '业务编码不能为空' })
  @IsString({ message: '业务编码必须是字符串' })
  code: string;

  /**
   * 业务图标（可选）
   * @example "icon-crm"
   */
  @IsOptional()
  @IsString({ message: '业务图标必须是字符串' })
  icon?: string;

  /**
   * 业务描述（可选）
   * @example "客户关系管理系统"
   */
  @IsOptional()
  @IsString({ message: '业务描述必须是字符串' })
  description?: string;
}

/**
 * 业务线更新请求
 */
export class BusinessUpdateDto {
  /**
   * 业务名称
   */
  @IsOptional()
  @IsString({ message: '业务名称必须是字符串' })
  name?: string;

  /**
   * 业务图标（可选）
   */
  @IsOptional()
  @IsString({ message: '业务图标必须是字符串' })
  icon?: string;

  /**
   * 业务描述（可选）
   */
  @IsOptional()
  @IsString({ message: '业务描述必须是字符串' })
  description?: string;
}
