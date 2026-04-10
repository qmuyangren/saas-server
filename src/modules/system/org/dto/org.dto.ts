import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  MaxLength,
} from 'class-validator';

/**
 * 查询组织架构 DTO
 */
export class QueryOrgDto {
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
 * 创建公司 DTO
 */
export class CreateCompanyDto {
  @ApiProperty({ description: '公司名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '公司编码' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ description: '父公司ID', required: false })
  @IsInt()
  @IsOptional()
  parentId?: number;

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
 * 更新公司 DTO
 */
export class UpdateCompanyDto {
  @ApiPropertyOptional({ description: '公司名称', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: '公司编码', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;

  @ApiPropertyOptional({ description: '父公司ID', required: false })
  @IsInt()
  @IsOptional()
  parentId?: number;

  @ApiPropertyOptional({ description: '状态', required: false })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  remark?: string;

  @ApiPropertyOptional({ description: '排序', required: false })
  @IsInt()
  @IsOptional()
  sort?: number;
}

/**
 * 创建部门 DTO
 */
export class CreateDepartmentDto {
  @ApiProperty({ description: '部门名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '公司ID' })
  @IsInt()
  companyId: number;

  @ApiPropertyOptional({ description: '父部门ID', required: false })
  @IsInt()
  @IsOptional()
  parentId?: number;

  @ApiPropertyOptional({ description: '部门领导ID', required: false })
  @IsInt()
  @IsOptional()
  leaderId?: number;

  @ApiPropertyOptional({ description: '状态', required: false })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  remark?: string;

  @ApiPropertyOptional({ description: '排序', required: false })
  @IsInt()
  @IsOptional()
  sort?: number;
}

/**
 * 更新部门 DTO
 */
export class UpdateDepartmentDto {
  @ApiPropertyOptional({ description: '部门名称', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: '父部门ID', required: false })
  @IsInt()
  @IsOptional()
  parentId?: number;

  @ApiPropertyOptional({ description: '部门领导ID', required: false })
  @IsInt()
  @IsOptional()
  leaderId?: number;

  @ApiPropertyOptional({ description: '状态', required: false })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  remark?: string;

  @ApiPropertyOptional({ description: '排序', required: false })
  @IsInt()
  @IsOptional()
  sort?: number;
}

/**
 * 创建岗位 DTO
 */
export class CreatePositionDto {
  @ApiProperty({ description: '岗位名称' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '岗位编码' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ description: '状态', required: false })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  remark?: string;

  @ApiPropertyOptional({ description: '排序', required: false })
  @IsInt()
  @IsOptional()
  sort?: number;
}

/**
 * 更新岗位 DTO
 */
export class UpdatePositionDto {
  @ApiPropertyOptional({ description: '岗位名称', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: '岗位编码', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;

  @ApiPropertyOptional({ description: '状态', required: false })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  remark?: string;

  @ApiPropertyOptional({ description: '排序', required: false })
  @IsInt()
  @IsOptional()
  sort?: number;
}
