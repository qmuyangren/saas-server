import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  MaxLength,
} from 'class-validator';

/**
 * 查询角色 DTO
 */
export class QueryRoleDto {
  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '状态过滤' })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '页码' })
  @IsInt()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量' })
  @IsInt()
  @IsOptional()
  pageSize?: number;
}

/**
 * 创建角色 DTO
 */
export class CreateRoleDto {
  @ApiProperty({ description: '角色名称' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '角色编码' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ description: '状态', required: false })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '排序', required: false })
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  remark?: string;
}

/**
 * 更新角色 DTO
 */
export class UpdateRoleDto {
  @ApiPropertyOptional({ description: '角色名称', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: '角色编码', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;

  @ApiPropertyOptional({ description: '状态', required: false })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '排序', required: false })
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  remark?: string;
}

/**
 * 角色授权 DTO
 */
export class RoleAssignDto {
  @ApiProperty({ description: '角色ID' })
  @IsInt()
  roleId: number;

  @ApiProperty({ description: '用户ID列表' })
  @IsArray()
  @IsInt({ each: true })
  userIds: number[];
}
