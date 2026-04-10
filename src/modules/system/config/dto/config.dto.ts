import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  MaxLength,
} from 'class-validator';

/**
 * 创建配置 DTO
 */
export class CreateConfigDto {
  @ApiProperty({ description: '配置键' })
  @IsString()
  @MaxLength(100)
  configKey: string;

  @ApiPropertyOptional({ description: '配置值', required: false })
  @IsString()
  @IsOptional()
  configValue?: string;

  @ApiProperty({ description: '配置类型' })
  @IsString()
  @MaxLength(20)
  configType: string;

  @ApiProperty({ description: '配置分组' })
  @IsString()
  @MaxLength(50)
  configGroup: string;

  @ApiProperty({ description: '配置名称' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  remark?: string;

  @ApiProperty({ description: '是否公开', enum: [0, 1], default: 0 })
  @IsInt()
  isPublic?: number;

  @ApiProperty({ description: '状态', enum: [0, 1], default: 1 })
  @IsInt()
  status?: number;
}

/**
 * 更新配置 DTO
 */
export class UpdateConfigDto {
  @ApiPropertyOptional({ description: '配置值', required: false })
  @IsString()
  @IsOptional()
  configValue?: string;

  @ApiPropertyOptional({ description: '配置类型', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  configType?: string;

  @ApiPropertyOptional({ description: '配置分组', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  configGroup?: string;

  @ApiPropertyOptional({ description: '配置名称', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  remark?: string;

  @ApiPropertyOptional({ description: '是否公开', required: false })
  @IsInt()
  @IsOptional()
  isPublic?: number;

  @ApiPropertyOptional({ description: '状态', required: false })
  @IsInt()
  @IsOptional()
  status?: number;
}

/**
 * 查询配置 DTO
 */
export class QueryConfigDto {
  @ApiPropertyOptional({ description: '配置分组' })
  @IsString()
  @IsOptional()
  group?: string;

  @ApiPropertyOptional({ description: '状态过滤' })
  @IsInt()
  @IsOptional()
  status?: number;
}
