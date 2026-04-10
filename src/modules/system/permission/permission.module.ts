/**
 * 权限模块
 *
 * @description
 * 权限管理模块，负责权限的 CRUD、权限树构建以及资源授权。
 */
import { Module } from '@nestjs/common';

import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';

@Module({
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
