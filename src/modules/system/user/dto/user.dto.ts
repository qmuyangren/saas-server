import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  MinLength,
  MaxLength,
  IsEmail,
} from 'class-validator';

/**
 * 创建用户 DTO
 */
export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: '昵称', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nickname?: string;

  @ApiPropertyOptional({ description: '头像', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  avatar?: string;

  @ApiPropertyOptional({ description: '手机号', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: '状态', enum: [0, 1], default: 1 })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '用户类型', enum: [1, 2], default: 2 })
  @IsInt()
  @IsOptional()
  userType?: number;

  @ApiPropertyOptional({ description: '公司ID', required: false })
  @IsInt()
  @IsOptional()
  companyId?: number;

  @ApiPropertyOptional({ description: '部门ID', required: false })
  @IsInt()
  @IsOptional()
  departmentId?: number;

  @ApiPropertyOptional({ description: '岗位ID', required: false })
  @IsInt()
  @IsOptional()
  positionId?: number;
}

/**
 * 更新用户 DTO
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ description: '昵称', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nickname?: string;

  @ApiPropertyOptional({ description: '头像', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  avatar?: string;

  @ApiPropertyOptional({ description: '手机号', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: '状态', required: false })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '用户类型', required: false })
  @IsInt()
  @IsOptional()
  userType?: number;

  @ApiPropertyOptional({ description: '公司ID', required: false })
  @IsInt()
  @IsOptional()
  companyId?: number;

  @ApiPropertyOptional({ description: '部门ID', required: false })
  @IsInt()
  @IsOptional()
  departmentId?: number;

  @ApiPropertyOptional({ description: '岗位ID', required: false })
  @IsInt()
  @IsOptional()
  positionId?: number;
}

/**
 * 查询用户 DTO
 */
export class QueryUserDto {
  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '状态过滤' })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '公司ID过滤' })
  @IsInt()
  @IsOptional()
  companyId?: number;

  @ApiPropertyOptional({ description: '部门ID过滤' })
  @IsInt()
  @IsOptional()
  departmentId?: number;

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
 * 重置密码 DTO
 */
export class ResetPasswordDto {
  @ApiProperty({ description: '新密码' })
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({ description: '是否强制下次修改', required: false })
  @IsInt()
  @IsOptional()
  forceChange?: number;
}
