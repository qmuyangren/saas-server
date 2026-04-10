import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

import { AuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';

import { ConfigService } from './config.service';
import {
  CreateConfigDto,
  UpdateConfigDto,
  QueryConfigDto,
} from './dto/config.dto';
import { ConfigInfo } from './entities/config.entity';

@ApiTags('系统配置')
@Controller('system/config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 获取公共配置
   */
  @Get('public')
  @ApiOperation({ summary: '获取公共配置' })
  async getPublic(): Promise<Record<string, string>> {
    return this.configService.getPublic();
  }

  /**
   * 获取所有配置
   */
  @Get()
  @ApiOperation({ summary: '获取所有配置' })
  async findAll(@Query() query: QueryConfigDto): Promise<ConfigInfo[]> {
    return this.configService.findAll(query);
  }

  /**
   * 按分组获取配置
   */
  @Get('group/:group')
  @ApiOperation({ summary: '按分组获取配置' })
  @ApiParam({ name: 'group', type: String })
  async findByGroup(@Param('group') group: string): Promise<ConfigInfo[]> {
    return this.configService.findByGroup(group);
  }

  /**
   * 获取单个配置
   */
  @Get(':key')
  @ApiOperation({ summary: '获取单个配置' })
  @ApiParam({ name: 'key', type: String })
  async findOne(@Param('key') key: string): Promise<ConfigInfo> {
    return this.configService.findOne(key);
  }

  /**
   * 创建配置
   */
  @Post()
  @ApiOperation({ summary: '创建配置' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async create(
    @CurrentUser('id') createdBy: bigint,
    @Body() dto: CreateConfigDto,
  ): Promise<ConfigInfo> {
    return this.configService.create(createdBy, dto);
  }

  /**
   * 更新配置
   */
  @Put(':key')
  @ApiOperation({ summary: '更新配置' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @CurrentUser('id') updatedBy: bigint,
    @Param('key') key: string,
    @Body() dto: UpdateConfigDto,
  ): Promise<ConfigInfo> {
    return this.configService.update(updatedBy, key, dto);
  }

  /**
   * 删除配置
   */
  @Delete(':key')
  @ApiOperation({ summary: '删除配置' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('key') key: string): Promise<{ deleted: number }> {
    return this.configService.remove(key);
  }
}
