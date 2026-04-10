import { Controller, Get, Post, Put, Delete, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionAuthGuard } from '@/common/guards/permission-auth.guard';
import { BusinessService, BusinessInfo } from './business.service';
import { BusinessRegisterDto, BusinessUpdateDto } from './dto/business.dto';

/**
 * 业务线控制器
 *
 * @description
 * 提供业务线管理接口：
 * - 创建业务线
 * - 查询业务线
 * - 更新业务线
 * - 删除业务线
 */
@ApiTags('业务线')
@Controller('business')
@UseGuards(JwtAuthGuard, PermissionAuthGuard)
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  /**
   * 创建业务线（需要权限：business:create）
   */
  @Post()
  @ApiOperation({ summary: '创建业务线' })
  @ApiResponse({ status: 200, description: '创建成功' })
  async createBusiness(@Body() dto: BusinessRegisterDto): Promise<any> {
    return this.businessService.createBusiness(dto);
  }

  /**
   * 获取所有业务线（需要权限：business:list）
   */
  @Get()
  @ApiOperation({ summary: '获取所有业务线' })
  @ApiResponse({ status: 200, description: '业务线列表' })
  async getAllBusinesses(): Promise<BusinessInfo[]> {
    return this.businessService.getAllBusinesses();
  }

  /**
   * 获取业务线详情（需要权限：business:detail）
   */
  @Get(':id')
  @ApiOperation({ summary: '获取业务线详情' })
  @ApiResponse({ status: 200, description: '业务线详情' })
  async getBusinessById(@Query('id') businessId: number): Promise<BusinessInfo | null> {
    return this.businessService.getBusinessById(businessId);
  }

  /**
   * 更新业务线（需要权限：business:update）
   */
  @Put(':id')
  @ApiOperation({ summary: '更新业务线' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateBusiness(
    @Query('id') businessId: number,
    @Body() dto: BusinessUpdateDto,
  ): Promise<any> {
    return this.businessService.updateBusiness(businessId, dto);
  }

  /**
   * 删除业务线（需要权限：business:delete）
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除业务线' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteBusiness(@Query('id') businessId: number): Promise<any> {
    return this.businessService.deleteBusiness(businessId);
  }
}
