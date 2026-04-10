/**
 * 角色模块
 *
 * @description
 * 角色管理模块，负责角色的 CRUD 以及用户角色分配。
 */
import { Module } from '@nestjs/common';

import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
