/**
 * 组织架构模块
 *
 * @description
 * 组织架构管理模块，负责公司、部门、岗位的管理。
 */
import { Module } from '@nestjs/common';

import { OrgController } from './org.controller';
import { OrgService } from './org.service';

@Module({
  controllers: [OrgController],
  providers: [OrgService],
  exports: [OrgService],
})
export class OrgModule {}
