import { Controller, Get, Post, Put, Body, Query, UseGuards, Headers, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantAuthGuard } from '@/common/guards/tenant-auth.guard';
import { TenantService, TenantInfo, BusinessInfo, AppInfo } from './tenant.service';
import { TenantRegisterDto, TenantConfigUpdateDto } from './dto/tenant.dto';

/**
 * 租户控制器
 *
 * @description
 * 提供租户相关接口：
 * - 租户注册
 * - 租户配置管理
 * - 业务管理
 * - 应用管理
 */
@ApiTags('租户')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  // ==================== 公开接口 ====================

  /**
   * 租户注册
   */
  @Post('register')
  @ApiOperation({ summary: '租户注册（创建租户+管理员）' })
  @ApiResponse({ status: 200, description: '注册成功' })
  async registerTenant(@Body() dto: TenantRegisterDto): Promise<any> {
    return this.tenantService.registerTenant(dto);
  }

  // ==================== 需要认证的接口 ====================

  /**
   * 获取用户可访问的租户列表
   */
  @Get('tenants')
  @ApiOperation({ summary: '获取用户可访问的租户列表' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Client-Id', description: '客户端ID' })
  @UseGuards(JwtAuthGuard)
  async getUserTenants(@Request() req): Promise<TenantInfo[]> {
    const userId = req.user.userId;
    return this.tenantService.getUserTenants(userId);
  }

  /**
   * 获取租户详细信息
   */
  @Get('info')
  @ApiOperation({ summary: '获取租户详细信息' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Tenant-Id', description: '租户ID' })
  @UseGuards(JwtAuthGuard, TenantAuthGuard)
  async getTenantInfo(@Request() req): Promise<any> {
    const tenantId = req.tenantId;
    return this.tenantService.getTenantConfig(tenantId);
  }

  /**
   * 更新租户配置
   */
  @Put('config')
  @ApiOperation({ summary: '更新租户配置' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Tenant-Id', description: '租户ID' })
  @UseGuards(JwtAuthGuard, TenantAuthGuard)
  async updateTenantConfig(
    @Request() req,
    @Body() dto: TenantConfigUpdateDto,
  ): Promise<any> {
    const tenantId = req.tenantId;
    return this.tenantService.updateTenantConfig(tenantId, dto);
  }

  /**
   * 获取租户已开通的业务列表
   */
  @Get('businesses')
  @ApiOperation({ summary: '获取租户已开通的业务列表' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Tenant-Id', description: '租户ID' })
  @UseGuards(JwtAuthGuard, TenantAuthGuard)
  async getTenantBusinesses(@Request() req): Promise<BusinessInfo[]> {
    const tenantId = req.tenantId;
    return this.tenantService.getTenantBusinesses(tenantId);
  }

  /**
   * 开通业务
   */
  @Post('business/enable')
  @ApiOperation({ summary: '开通业务' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Tenant-Id', description: '租户ID' })
  @UseGuards(JwtAuthGuard, TenantAuthGuard)
  async enableBusiness(
    @Request() req,
    @Body('businessId') businessId: number,
    @Body('days') days?: number,
  ): Promise<any> {
    const tenantId = req.tenantId;
    return this.tenantService.enableBusiness(tenantId, businessId, days);
  }

  /**
   * 禁用业务
   */
  @Post('business/disable')
  @ApiOperation({ summary: '禁用业务' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Tenant-Id', description: '租户ID' })
  @UseGuards(JwtAuthGuard, TenantAuthGuard)
  async disableBusiness(
    @Request() req,
    @Body('businessId') businessId: number,
  ): Promise<any> {
    const tenantId = req.tenantId;
    return this.tenantService.disableBusiness(tenantId, businessId);
  }

  /**
   * 获取业务下的应用列表
   */
  @Get('business/:businessId/apps')
  @ApiOperation({ summary: '获取业务下的应用列表' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Tenant-Id', description: '租户ID' })
  @UseGuards(JwtAuthGuard, TenantAuthGuard)
  async getBusinessApps(
    @Request() req,
    @Query('businessId') businessId: number,
  ): Promise<AppInfo[]> {
    return this.tenantService.getBusinessApps(businessId);
  }

  /**
   * 切换当前租户
   */
  @Post('switch')
  @ApiOperation({ summary: '切换当前租户' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Tenant-Id', description: '目标租户ID' })
  @UseGuards(JwtAuthGuard, TenantAuthGuard)
  async switchTenant(@Request() req): Promise<any> {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    return this.tenantService.switchTenant(userId, tenantId);
  }

  /**
   * 切换当前业务
   */
  @Post('business/switch')
  @ApiOperation({ summary: '切换当前业务' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Tenant-Id', description: '租户ID' })
  @ApiHeader({ name: 'X-Business-Id', description: '目标业务ID' })
  @UseGuards(JwtAuthGuard, TenantAuthGuard)
  async switchBusiness(
    @Request() req,
    @Body('businessId') businessId: number,
  ): Promise<any> {
    const tenantId = req.tenantId;
    return this.tenantService.switchBusiness(tenantId, businessId);
  }
}
