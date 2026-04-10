import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  MaxLength,
} from 'class-validator';

/**
 * 查询权限 DTO
 */
export class QueryPermissionDto {
  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '权限类型' })
  @IsInt()
  @IsOptional()
  type?: number;

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
 * 创建权限 DTO
 */
export class CreatePermissionDto {
  @ApiProperty({ description: '权限名称' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '权限编码' })
  @IsString()
  @MaxLength(100)
  code: string;

  @ApiPropertyOptional({ description: '父权限ID', required: false })
  @IsInt()
  @IsOptional()
  parentId?: number;

  @ApiProperty({ description: '权限类型 (1-目录 2-菜单 3-按钮 4-接口)' })
  @IsInt()
  type: number;

  @ApiPropertyOptional({ description: '路由路径', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  path?: string;

  @ApiPropertyOptional({ description: '组件路径', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  component?: string;

  @ApiPropertyOptional({ description: '图标', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({ description: '排序', required: false })
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '状态', required: false })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  remark?: string;
}

/**
 * 更新权限 DTO
 */
export class UpdatePermissionDto {
  @ApiPropertyOptional({ description: '权限名称', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: '权限编码', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  code?: string;

  @ApiPropertyOptional({ description: '父权限ID', required: false })
  @IsInt()
  @IsOptional()
  parentId?: number;

  @ApiPropertyOptional({ description: '权限类型', required: false })
  @IsInt()
  @IsOptional()
  type?: number;

  @ApiPropertyOptional({ description: '路由路径', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  path?: string;

  @ApiPropertyOptional({ description: '组件路径', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  component?: string;

  @ApiPropertyOptional({ description: '图标', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({ description: '排序', required: false })
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '状态', required: false })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  remark?: string;
}

/**
 * 权限组授权 DTO
 */
export class PermissionGroupAssignDto {
  @ApiProperty({ description: '权限组ID' })
  @IsInt()
  permissionGroupId: number;

  @ApiProperty({ description: '权限ID列表' })
  @IsArray()
  @IsInt({ each: true })
  permissionIds: number[];
}

/**
 * 资源授权 DTO
 */
export class ResourceAssignDto {
  @ApiProperty({ description: '资源ID (角色或权限组ID)' })
  @IsInt()
  targetId: number;

  @ApiProperty({ description: '权限ID列表' })
  @IsArray()
  @IsInt({ each: true })
  permissionIds: number[];
}
