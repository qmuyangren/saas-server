/**
 * 系统模块
 *
 * @description
 * 系统模块入口，导出所有系统相关的子模块。
 * 包括：配置、用户、组织架构、角色、权限、验证码等模块。
 * 第三方集成（OAuth、支付、存储）已移至基础设施层。
 */
import { Module } from '@nestjs/common';

import { ConfigModule } from './config/config.module';
import { UserModule } from './user/user.module';
import { OrgModule } from './org/org.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { DictModule } from './dict/dict.module';

import { CaptchaModule } from './captcha/captcha.module';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { BusinessModule } from './business/business.module';
import { AppModule } from './app/app.module';

@Module({
  imports: [
    ConfigModule,
    UserModule,
    OrgModule,
    RoleModule,
    PermissionModule,
    DictModule,
    CaptchaModule,
    AuthModule,
    TenantModule,
    BusinessModule,
    AppModule,
  ],
  exports: [
    ConfigModule,
    UserModule,
    OrgModule,
    RoleModule,
    PermissionModule,
    DictModule,
    CaptchaModule,
    AuthModule,
    TenantModule,
    BusinessModule,
    AppModule,
  ],
})
export class SystemModule {}
