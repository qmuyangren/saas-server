import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { AuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';

import { OrgService } from './org.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreatePositionDto,
  UpdatePositionDto,
  QueryOrgDto,
} from './dto/org.dto';
import {
  CompanyInfo,
  DepartmentInfo,
  PositionInfo,
  OrgTree,
} from './entities/org.entity';

@ApiTags('组织架构')
@Controller('system/org')
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  // ========== 公司管理 ==========

  /**
   * 获取公司列表
   */
  @Get('companies')
  @ApiOperation({ summary: '获取公司列表' })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: Number })
  async getCompanies(@Query() query: QueryOrgDto): Promise<CompanyInfo[]> {
    return this.orgService.getCompanies(query);
  }

  /**
   * 获取公司树（组织架构）
   */
  @Get('company-tree')
  @ApiOperation({ summary: '获取公司树' })
  async getCompanyTree(): Promise<OrgTree[]> {
    return this.orgService.getCompanyTree();
  }

  /**
   * 获取公司详情
   */
  @Get('companies/:id')
  @ApiOperation({ summary: '获取公司详情' })
  @ApiParam({ name: 'id', type: Number })
  async getCompany(@Param('id') id: number): Promise<CompanyInfo> {
    return this.orgService.getCompany(id);
  }

  /**
   * 创建公司
   */
  @Post('companies')
  @ApiOperation({ summary: '创建公司' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async createCompany(
    @CurrentUser('id') createdBy: bigint,
    @Body() dto: CreateCompanyDto,
  ): Promise<CompanyInfo> {
    return this.orgService.createCompany(createdBy, dto);
  }

  /**
   * 更新公司
   */
  @Put('companies/:id')
  @ApiOperation({ summary: '更新公司' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', type: Number })
  async updateCompany(
    @CurrentUser('id') updatedBy: bigint,
    @Param('id') id: number,
    @Body() dto: UpdateCompanyDto,
  ): Promise<CompanyInfo> {
    return this.orgService.updateCompany(updatedBy, id, dto);
  }

  /**
   * 删除公司（软删除）
   */
  @Delete('companies/:id')
  @ApiOperation({ summary: '删除公司' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', type: Number })
  async removeCompany(@Param('id') id: number): Promise<{ deleted: number }> {
    return this.orgService.removeCompany(id);
  }

  // ========== 部门管理 ==========

  /**
   * 获取部门列表
   */
  @Get('departments')
  @ApiOperation({ summary: '获取部门列表' })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: Number })
  @ApiQuery({ name: 'companyId', required: false, type: Number })
  async getDepartments(
    @Query() query: QueryOrgDto,
  ): Promise<DepartmentInfo[]> {
    return this.orgService.getDepartments(query);
  }

  /**
   * 获取部门树
   */
  @Get('department-tree')
  @ApiOperation({ summary: '获取部门树' })
  @ApiQuery({ name: 'companyId', required: false, type: Number })
  async getDepartmentTree(
    @Query('companyId') companyId?: number,
  ): Promise<OrgTree[]> {
    return this.orgService.getDepartmentTree(companyId);
  }

  /**
   * 获取部门详情
   */
  @Get('departments/:id')
  @ApiOperation({ summary: '获取部门详情' })
  @ApiParam({ name: 'id', type: Number })
  async getDepartment(@Param('id') id: number): Promise<DepartmentInfo> {
    return this.orgService.getDepartment(id);
  }

  /**
   * 创建部门
   */
  @Post('departments')
  @ApiOperation({ summary: '创建部门' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async createDepartment(
    @CurrentUser('id') createdBy: bigint,
    @Body() dto: CreateDepartmentDto,
  ): Promise<DepartmentInfo> {
    return this.orgService.createDepartment(createdBy, dto);
  }

  /**
   * 更新部门
   */
  @Put('departments/:id')
  @ApiOperation({ summary: '更新部门' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', type: Number })
  async updateDepartment(
    @CurrentUser('id') updatedBy: bigint,
    @Param('id') id: number,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<DepartmentInfo> {
    return this.orgService.updateDepartment(updatedBy, id, dto);
  }

  /**
   * 删除部门（软删除）
   */
  @Delete('departments/:id')
  @ApiOperation({ summary: '删除部门' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', type: Number })
  async removeDepartment(
    @Param('id') id: number,
  ): Promise<{ deleted: number }> {
    return this.orgService.removeDepartment(id);
  }

  // ========== 岗位管理 ==========

  /**
   * 获取岗位列表
   */
  @Get('positions')
  @ApiOperation({ summary: '获取岗位列表' })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: Number })
  async getPositions(@Query() query: QueryOrgDto): Promise<PositionInfo[]> {
    return this.orgService.getPositions(query);
  }

  /**
   * 获取岗位详情
   */
  @Get('positions/:id')
  @ApiOperation({ summary: '获取岗位详情' })
  @ApiParam({ name: 'id', type: Number })
  async getPosition(@Param('id') id: number): Promise<PositionInfo> {
    return this.orgService.getPosition(id);
  }

  /**
   * 创建岗位
   */
  @Post('positions')
  @ApiOperation({ summary: '创建岗位' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async createPosition(
    @CurrentUser('id') createdBy: bigint,
    @Body() dto: CreatePositionDto,
  ): Promise<PositionInfo> {
    return this.orgService.createPosition(createdBy, dto);
  }

  /**
   * 更新岗位
   */
  @Put('positions/:id')
  @ApiOperation({ summary: '更新岗位' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', type: Number })
  async updatePosition(
    @CurrentUser('id') updatedBy: bigint,
    @Param('id') id: number,
    @Body() dto: UpdatePositionDto,
  ): Promise<PositionInfo> {
    return this.orgService.updatePosition(updatedBy, id, dto);
  }

  /**
   * 删除岗位（软删除）
   */
  @Delete('positions/:id')
  @ApiOperation({ summary: '删除岗位' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', type: Number })
  async removePosition(@Param('id') id: number): Promise<{ deleted: number }> {
    return this.orgService.removePosition(id);
  }
}
