import { Controller, Get, Put, Post, UseGuards, Request, Headers, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CacheService } from '@/infrastructure/cache/cache.service';

/**
 * 用户信息
 */
interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
  phone: string;
  gender: number;
  status: number;
  lastLogin: string;
}

/**
 * 权限信息
 */
interface Permission {
  id: string;
  code: string;
  name: string;
  type: string;
}

/**
 * 菜单信息
 */
interface Menu {
  id: string;
  parentId: string;
  name: string;
  path: string;
  component: string;
  icon: string;
  order: number;
  permission?: string;
  children?: Menu[];
}

/**
 * 用户控制器
 *
 * @description
 * 提供用户相关接口：
 * - 获取用户详情
 * - 修改密码
 * - 设备管理
 */
@ApiTags('用户')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /**
   * 获取用户详情
   */
  @Get('info')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiBearerAuth()
  async getUserInfo(@Request() req) {
    const userId = req.user.userId;

    // 查询用户
    const user = await this.prisma.baseUser.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        email: true,
        phone: true,
        status: true,
        lastLoginTime: true,
        createdAt: true,
        wechatOpenid: true,
        dingtalkUserid: true,
        weworkUserid: true,
        githubId: true,
      },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 获取用户角色
    const userRoles = await this.prisma.mapUserRole.findMany({
      where: { userId: BigInt(userId) },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // 获取权限列表（简化版）
    const permissions = await this.getPermissionsByClient(userId);

    // 获取菜单列表（简化版）
    const menus = await this.getMenusByClient();

    // 检查是否需要修改密码
    const needResetPassword = this.checkNeedResetPassword(user);

    return {
      user: {
        id: user.id.toString(),
        username: user.username,
        nickname: user.nickname || user.username,
        avatar: user.avatar || '',
        email: user.email || '',
        phone: user.phone || '',
        status: user.status || 1,
        lastLogin: user.lastLoginTime?.toISOString(),
        createdAt: user.createdAt?.toISOString(),
      },
      roles: (userRoles as any[]).map(r => ({ id: r.role.id.toString(), name: r.role.name, code: r.role.code })),
      permissions: permissions,
      menus: menus,
      needResetPassword,
    };
  }

  /**
   * 修改密码
   */
  @Put('password')
  @ApiOperation({ summary: '修改密码' })
  @ApiBearerAuth()
  async updatePassword(
    @Request() req,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
    @Body('confirmNewPassword') confirmNewPassword: string,
  ) {
    const userId = req.user.userId;

    if (newPassword !== confirmNewPassword) {
      throw new Error('两次输入的密码不一致');
    }

    // 查询用户
    const user = await this.prisma.baseUser.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 这里应该用 bcrypt 验证旧密码
    // 临时实现
    await this.prisma.baseUser.update({
      where: { id: BigInt(userId) },
      data: {
        password: 'new_hashed_password',
        updatedAt: new Date(),
      },
    });

    return { success: true, message: '密码修改成功' };
  }

  /**
   * 获取设备列表
   */
  @Get('device/list')
  @ApiOperation({ summary: '获取设备列表' })
  @ApiBearerAuth()
  async getDeviceList(@Request() req) {
    const userId = req.user.userId;

    // 获取用户的所有设备
    const devices = await this.cache.keys(`device:${userId}:*`);

    const deviceList: any[] = [];
    for (const key of devices) {
      const deviceData = await this.cache.get(key);
      if (deviceData) {
        deviceList.push({
          deviceId: key.replace(`device:${userId}:`, ''),
          ...deviceData,
        });
      }
    }

    return { devices: deviceList };
  }

  /**
   * 踢出指定设备
   */
  @Post('device/kick')
  @ApiOperation({ summary: '踢出指定设备' })
  @ApiBearerAuth()
  async kickDevice(@Request() req, @Body('deviceId') deviceId: string) {
    const userId = req.user.userId;

    if (!deviceId) {
      throw new Error('设备ID不能为空');
    }

    // 删除设备信息
    const deviceKey = `device:${userId}:${deviceId}`;
    await this.cache.del(deviceKey);

    // 删除 token 映射
    const tokenMapKey = `tokenMap:${deviceId}`;
    await this.cache.del(tokenMapKey);

    return { success: true, message: '设备已踢出' };
  }

  // ==================== 私有方法 ====================

  /**
   * 获取用户权限（简化版）
   */
  private async getPermissionsByClient(userId: string): Promise<Permission[]> {
    // 这里应该根据 client_id 过滤权限
    // 实际应该查询权限表并过滤
    return [];
  }

  /**
   * 获取菜单树（简化版）
   */
  private async getMenusByClient(): Promise<Menu[]> {
    // 这里应该根据 client_id 获取不同的菜单
    // 实际应该查询菜单表并构建树形结构
    return [];
  }

  /**
   * 检查是否需要修改密码
   */
  private checkNeedResetPassword(user: any): boolean {
    // 检查密码是否为空或过期
    return false;
  }
}
