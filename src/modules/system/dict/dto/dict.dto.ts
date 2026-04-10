import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class QueryDictTypeDto {
  @ApiProperty({ description: '搜索关键词', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiProperty({ description: '分页-页码', required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ description: '分页-每页数量', required: false, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}

export class CreateDictTypeDto {
  @ApiProperty({ description: '字典编码', example: 'user_type' })
  @IsString()
  code: string;

  @ApiProperty({ description: '字典名称', example: '用户类型' })
  @IsString()
  name: string;

  @ApiProperty({ description: '状态', required: false, example: 1 })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateDictTypeDto {
  @ApiProperty({ description: '字典名称', example: '用户类型' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '状态', required: false, example: 1 })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class QueryDictDataDto {
  @ApiProperty({ description: '字典类型编码', example: 'user_type' })
  @IsOptional()
  @IsString()
  dictType?: string;

  @ApiProperty({ description: '搜索关键词', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiProperty({ description: '分页-页码', required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ description: '分页-每页数量', required: false, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}

export class CreateDictDataDto {
  @ApiProperty({ description: '字典类型编码', example: 'user_type' })
  @IsString()
  dictType: string;

  @ApiProperty({ description: '字典标签', example: '管理员' })
  @IsString()
  label: string;

  @ApiProperty({ description: '字典值', example: '1' })
  @IsString()
  value: string;

  @ApiProperty({ description: '排序', required: false, example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;

  @ApiProperty({ description: '状态', required: false, example: 1 })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiProperty({ description: 'CSS 类名', required: false })
  @IsOptional()
  @IsString()
  cssClass?: string;

  @ApiProperty({ description: '是否默认', required: false, example: 0 })
  @IsOptional()
  @IsInt()
  isDefault?: number;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateDictDataDto {
  @ApiProperty({ description: '字典标签', example: '管理员' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ description: '字典值', example: '1' })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiProperty({ description: '排序', required: false, example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;

  @ApiProperty({ description: '状态', required: false, example: 1 })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiProperty({ description: 'CSS 类名', required: false })
  @IsOptional()
  @IsString()
  cssClass?: string;

  @ApiProperty({ description: '是否默认', required: false, example: 0 })
  @IsOptional()
  @IsInt()
  isDefault?: number;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
