import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AccountValidationService } from '../services/account-validation.service';

/**
 * 账号验证控制器
 *
 * @description
 * 提供账号唯一性验证接口，供前端实时校验：
 * - 用户名唯一性校验
 * - 邮箱唯一性校验
 * - 手机号唯一性校验
 *
 * 使用场景：用户注册/编辑表单的实时校验
 */
@ApiTags('账号验证')
@Controller('common/validators')
export class AccountValidatorController {
  constructor(
    private readonly accountValidation: AccountValidationService,
  ) {}

  /**
   * 验证用户名是否唯一
   */
  @Get('username')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证用户名是否唯一' })
  @ApiResponse({ status: 200, description: '验证结果' })
  async validateUsername(@Query('username') username: string, @Query('excludeId') excludeId?: number) {
    await this.accountValidation.validateUsernameUnique(username, excludeId);
    return { valid: true, message: '用户名可用' };
  }

  /**
   * 验证邮箱是否唯一
   */
  @Get('email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证邮箱是否唯一' })
  @ApiResponse({ status: 200, description: '验证结果' })
  async validateEmail(@Query('email') email: string, @Query('excludeId') excludeId?: number) {
    await this.accountValidation.validateEmailUnique(email, excludeId);
    return { valid: true, message: '邮箱可用' };
  }

  /**
   * 验证手机号是否唯一
   */
  @Get('phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证手机号是否唯一' })
  @ApiResponse({ status: 200, description: '验证结果' })
  async validatePhone(@Query('phone') phone: string, @Query('excludeId') excludeId?: number) {
    await this.accountValidation.validatePhoneUnique(phone, excludeId);
    return { valid: true, message: '手机号可用' };
  }

  /**
   * 验证账号是否存在
   */
  @Get('account-exists')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证账号是否存在' })
  @ApiResponse({ status: 200, description: '验证结果' })
  async validateAccountExists(@Query('userId') userId: number) {
    await this.accountValidation.validateAccountExists(userId);
    return { valid: true, message: '账号存在' };
  }

  /**
   * 验证账号状态
   */
  @Get('account-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证账号状态' })
  @ApiResponse({ status: 200, description: '验证结果' })
  async validateAccountStatus(@Query('userId') userId: number) {
    await this.accountValidation.validateAccountStatus(userId);
    return { valid: true, message: '账号正常' };
  }
}
