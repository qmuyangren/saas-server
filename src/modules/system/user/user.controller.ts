import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

import { AuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';

import { UserService } from './user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  QueryUserDto,
  ResetPasswordDto,
} from './dto/user.dto';
import { UserInfo } from './entities/user.entity';

@ApiTags('用户管理')
@Controller('system/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取用户列表
   */
  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  async findAll(@Query() query: QueryUserDto): Promise<{ list: UserInfo[]; total: number }> {
    return this.userService.findAll(query);
  }

  /**
   * 获取用户详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id') id: number): Promise<UserInfo> {
    return this.userService.findOne(id);
  }

  /**
   * 获取用户详情（通过 UUID）
   */
  @Get('uuid/:uuid')
  @ApiOperation({ summary: '通过 UUID 获取用户详情' })
  @ApiParam({ name: 'uuid', type: String })
  async findByUuid(@Param('uuid') uuid: string): Promise<UserInfo> {
    return this.userService.findByUuid(uuid);
  }

  /**
   * 创建用户
   */
  @Post()
  @ApiOperation({ summary: '创建用户' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async create(
    @CurrentUser('id') createdBy: bigint,
    @Body() dto: CreateUserDto,
  ): Promise<UserInfo> {
    return this.userService.create(createdBy, dto);
  }

  /**
   * 更新用户
   */
  @Put(':id')
  @ApiOperation({ summary: '更新用户' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @CurrentUser('id') updatedBy: bigint,
    @Param('id') id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserInfo> {
    return this.userService.update(updatedBy, id, dto);
  }

  /**
   * 删除用户
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: number): Promise<{ deleted: number }> {
    return this.userService.remove(id);
  }

  /**
   * 重置密码
   */
  @Patch(':id/password')
  @ApiOperation({ summary: '重置用户密码' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async resetPassword(
    @CurrentUser('id') updatedBy: bigint,
    @Param('id') id: number,
    @Body() dto: ResetPasswordDto,
  ): Promise<{ success: boolean }> {
    return this.userService.resetPassword(updatedBy, id, dto);
  }

  /**
   * 获取当前用户信息
   */
  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: any): Promise<UserInfo> {
    return this.userService.findOne(Number(user.id));
  }
}
