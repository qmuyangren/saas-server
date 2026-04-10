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

import { PermissionService } from './permission.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  QueryPermissionDto,
  PermissionGroupAssignDto,
} from './dto/permission.dto';
import { PermissionInfo, PermissionTree } from './entities/permission.entity';

@ApiTags('权限管理')
@Controller('system/permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * 获取权限列表
   */
  @Get()
  @ApiOperation({ summary: '获取权限列表' })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(@Query() query: QueryPermissionDto): Promise<{ list: PermissionInfo[]; total: number }> {
    return this.permissionService.findAll(query);
  }

  /**
   * 获取权限树
   */
  @Get('tree')
  @ApiOperation({ summary: '获取权限树' })
  async findTree(): Promise<PermissionTree[]> {
    return this.permissionService.findTree();
  }

  /**
   * 获取权限详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取权限详情' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id') id: number): Promise<PermissionInfo> {
    return this.permissionService.findOne(id);
  }

  /**
   * 创建权限
   */
  @Post()
  @ApiOperation({ summary: '创建权限' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async create(
    @CurrentUser('id') createdBy: bigint,
    @Body() dto: CreatePermissionDto,
  ): Promise<PermissionInfo> {
    return this.permissionService.create(createdBy, dto);
  }

  /**
   * 更新权限
   */
  @Put(':id')
  @ApiOperation({ summary: '更新权限' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', type: Number })
  async update(
    @CurrentUser('id') updatedBy: bigint,
    @Param('id') id: number,
    @Body() dto: UpdatePermissionDto,
  ): Promise<PermissionInfo> {
    return this.permissionService.update(updatedBy, id, dto);
  }

  /**
   * 删除权限
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除权限' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id') id: number): Promise<{ deleted: number }> {
    return this.permissionService.remove(id);
  }

  /**
   * 为权限组分配权限
   */
  @Post('group/assign')
  @ApiOperation({ summary: '为权限组分配权限' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async assignPermissionsToGroup(
    @CurrentUser('id') updatedBy: bigint,
    @Body() dto: PermissionGroupAssignDto,
  ): Promise<{ assigned: number }> {
    return this.permissionService.assignPermissionsToGroup(updatedBy, dto);
  }

  /**
   * 获取用户的权限列表
   */
  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户的权限列表' })
  @ApiParam({ name: 'userId', type: Number })
  async getUserPermissions(@Param('userId') userId: number): Promise<PermissionInfo[]> {
    return this.permissionService.getUserPermissions(userId);
  }

  /**
   * 获取权限组的权限列表
   */
  @Get('group/:groupId/permissions')
  @ApiOperation({ summary: '获取权限组的权限列表' })
  @ApiParam({ name: 'groupId', type: Number })
  async getGroupPermissions(@Param('groupId') groupId: number): Promise<PermissionInfo[]> {
    return this.permissionService.getGroupPermissions([groupId]);
  }
}
