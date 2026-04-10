import { Controller, Get, Post, Put, Delete, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionAuthGuard } from '@/common/guards/permission-auth.guard';
import { AppService, AppInfo } from './app.service';
import { AppRegisterDto, AppUpdateDto } from './dto/app.dto';

/**
 * 应用控制器
 *
 * @description
 * 提供应用管理接口：
 * - 创建应用
 * - 查询应用
 * - 更新应用
 * - 删除应用
 */
@ApiTags('应用')
@Controller('app')
@UseGuards(JwtAuthGuard, PermissionAuthGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * 创建应用（需要权限：app:create）
   */
  @Post()
  @ApiOperation({ summary: '创建应用' })
  @ApiResponse({ status: 200, description: '创建成功' })
  async createApp(@Body() dto: AppRegisterDto): Promise<any> {
    return this.appService.createApp(dto);
  }

  /**
   * 获取业务下的所有应用（需要权限：app:list）
   */
  @Get('business/:businessId')
  @ApiOperation({ summary: '获取业务下的所有应用' })
  @ApiResponse({ status: 200, description: '应用列表' })
  async getBusinessApps(@Query('businessId') businessId: number): Promise<AppInfo[]> {
    return this.appService.getBusinessApps(businessId);
  }

  /**
   * 获取应用详情（需要权限：app:detail）
   */
  @Get(':id')
  @ApiOperation({ summary: '获取应用详情' })
  @ApiResponse({ status: 200, description: '应用详情' })
  async getAppById(@Query('id') appId: number): Promise<AppInfo | null> {
    return this.appService.getAppById(appId);
  }

  /**
   * 更新应用（需要权限：app:update）
   */
  @Put(':id')
  @ApiOperation({ summary: '更新应用' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateApp(
    @Query('id') appId: number,
    @Body() dto: AppUpdateDto,
  ): Promise<any> {
    return this.appService.updateApp(appId, dto);
  }

  /**
   * 删除应用（需要权限：app:delete）
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除应用' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteApp(@Query('id') appId: number): Promise<any> {
    return this.appService.deleteApp(appId);
  }
}
