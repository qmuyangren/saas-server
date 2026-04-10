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

import { RoleService } from './role.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  QueryRoleDto,
  RoleAssignDto,
} from './dto/role.dto';
import { RoleInfo, RoleTree } from './entities/role.entity';

@ApiTags('角色管理')
@Controller('system/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * 获取角色列表
   */
  @Get()
  @ApiOperation({ summary: '获取角色列表' })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async findAll(@Query() query: QueryRoleDto): Promise<{ list: RoleInfo[]; total: number }> {
    return this.roleService.findAll(query);
  }

  /**
   * 获取角色树
   */
  @Get('tree')
  @ApiOperation({ summary: '获取角色树' })
  async findTree(): Promise<RoleTree[]> {
    return this.roleService.findTree();
  }

  /**
   * 获取角色详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取角色详情' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id') id: number): Promise<RoleInfo> {
    return this.roleService.findOne(id);
  }

  /**
   * 创建角色
   */
  @Post()
  @ApiOperation({ summary: '创建角色' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async create(
    @CurrentUser('id') createdBy: bigint,
    @Body() dto: CreateRoleDto,
  ): Promise<RoleInfo> {
    return this.roleService.create(createdBy, dto);
  }

  /**
   * 更新角色
   */
  @Put(':id')
  @ApiOperation({ summary: '更新角色' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', type: Number })
  async update(
    @CurrentUser('id') updatedBy: bigint,
    @Param('id') id: number,
    @Body() dto: UpdateRoleDto,
  ): Promise<RoleInfo> {
    return this.roleService.update(updatedBy, id, dto);
  }

  /**
   * 删除角色
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id') id: number): Promise<{ deleted: number }> {
    return this.roleService.remove(id);
  }

  /**
   * 角色授权（分配用户）
   */
  @Post('assign')
  @ApiOperation({ summary: '角色授权' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async assignUsers(
    @CurrentUser('id') updatedBy: bigint,
    @Body() dto: RoleAssignDto,
  ): Promise<{ assigned: number }> {
    return this.roleService.assignUsers(updatedBy, dto);
  }

  /**
   * 获取用户的角色列表
   */
  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户的角色列表' })
  @ApiParam({ name: 'userId', type: Number })
  async getUserRoles(@Param('userId') userId: number): Promise<RoleInfo[]> {
    return this.roleService.getUserRoles(userId);
  }

  /**
   * 获取角色的用户列表
   */
  @Get(':id/users')
  @ApiOperation({ summary: '获取角色的用户列表' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async getRoleUsers(@Param('id') roleId: number): Promise<{ list: any[]; total: number }> {
    return this.roleService.getRoleUsers(roleId);
  }
}
