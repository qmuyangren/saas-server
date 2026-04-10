import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { DictService } from './dict.service';
import {
  QueryDictTypeDto,
  CreateDictTypeDto,
  UpdateDictTypeDto,
  QueryDictDataDto,
  CreateDictDataDto,
  UpdateDictDataDto,
} from './dto/dict.dto';
import { DictTypeInfo, DictDataInfo } from './entities/dict.entity';

@ApiTags('字典管理')
@Controller('system/dict')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  // ========== 字典类型接口 ==========

  @Get('types')
  @ApiOperation({ summary: '获取字典类型列表' })
  @ApiResponse({ status: 200, type: [DictTypeInfo] })
  getDictTypes(@Query() query: QueryDictTypeDto) {
    return this.dictService.getDictTypes(query);
  }

  @Get('types/:id')
  @ApiOperation({ summary: '获取字典类型详情' })
  @ApiResponse({ status: 200, type: DictTypeInfo })
  getDictType(@Param('id') id: number) {
    return this.dictService.getDictType(id);
  }

  @Post('types')
  @ApiOperation({ summary: '创建字典类型' })
  @ApiResponse({ status: 200, type: DictTypeInfo })
  createDictType(@Body() dto: CreateDictTypeDto) {
    return this.dictService.createDictType(BigInt(1), dto);
  }

  @Put('types/:id')
  @ApiOperation({ summary: '更新字典类型' })
  @ApiResponse({ status: 200, type: DictTypeInfo })
  updateDictType(@Param('id') id: number, @Body() dto: UpdateDictTypeDto) {
    return this.dictService.updateDictType(BigInt(1), id, dto);
  }

  @Delete('types/:id')
  @ApiOperation({ summary: '删除字典类型' })
  @ApiResponse({ status: 200 })
  removeDictType(@Param('id') id: number) {
    return this.dictService.removeDictType(id);
  }

  // ========== 字典数据接口 ==========

  @Get('data')
  @ApiOperation({ summary: '获取字典数据列表' })
  @ApiResponse({ status: 200, type: [DictDataInfo] })
  getDictDataList(@Query() query: QueryDictDataDto) {
    return this.dictService.getDictDataList(query);
  }

  @Get('data/type/:dictType')
  @ApiOperation({ summary: '根据类型获取字典数据' })
  @ApiResponse({ status: 200, type: [DictDataInfo] })
  getDictDataByType(@Param('dictType') dictType: string) {
    return this.dictService.getDictDataByType(dictType);
  }

  @Get('data/:id')
  @ApiOperation({ summary: '获取字典数据详情' })
  @ApiResponse({ status: 200, type: DictDataInfo })
  getDictData(@Param('id') id: number) {
    return this.dictService.getDictData(id);
  }

  @Post('data')
  @ApiOperation({ summary: '创建字典数据' })
  @ApiResponse({ status: 200, type: DictDataInfo })
  createDictData(@Body() dto: CreateDictDataDto) {
    return this.dictService.createDictData(BigInt(1), dto);
  }

  @Put('data/:id')
  @ApiOperation({ summary: '更新字典数据' })
  @ApiResponse({ status: 200, type: DictDataInfo })
  updateDictData(@Param('id') id: number, @Body() dto: UpdateDictDataDto) {
    return this.dictService.updateDictData(BigInt(1), id, dto);
  }

  @Delete('data/:id')
  @ApiOperation({ summary: '删除字典数据' })
  @ApiResponse({ status: 200 })
  removeDictData(@Param('id') id: number) {
    return this.dictService.removeDictData(id);
  }
}
