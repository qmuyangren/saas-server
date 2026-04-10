# API 文档

## 概述

本项目使用 Swagger 生成 API 文档，访问地址：

```
http://localhost:3000/api/docs
```

## 认证方式

所有需要认证的接口都使用 **Bearer Token** 方式认证：

```
Authorization: Bearer <your_jwt_token>
```

## 数据响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "错误描述",
  "timestamp": "2026-04-10T10:00:00.000Z"
}
```

## 错误码说明

| 错误码范围 | 说明 |
|-----------|------|
| 200 | 成功 |
| 400-499 | 客户端错误 |
| 500-599 | 服务器错误 |

## 接口列表

### 系统模块 (system)

#### 认证相关
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/system/config` | GET | 获取系统配置 |
| `/api/v1/system/thirdparty/config` | GET | 获取第三方登录配置 |
| `/api/v1/system/login/account` | POST | 账密登录 |
| `/api/v1/system/rsa/public-key` | GET | 获取 RSA 公钥 |
| `/api/v1/system/token/refresh` | POST | 刷新 Token |
| `/api/v1/system/logout` | POST | 退出登录 |

#### 租户相关
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/system/tenant` | POST | 创建租户 |
| `/api/v1/system/tenant` | GET | 获取租户列表 |
| `/api/v1/system/tenant/:id` | GET | 获取租户详情 |
| `/api/v1/system/tenant/:id` | PUT | 更新租户 |
| `/api/v1/system/tenant/:id` | DELETE | 删除租户 |
| `/api/v1/system/tenant/:id/enable` | PATCH | 启用租户 |
| `/api/v1/system/tenant/:id/disable` | PATCH | 禁用租户 |
| `/api/v1/system/tenant/:id/switch-business` | PATCH | 切换当前业务 |

#### 业务相关
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/system/business` | POST | 创建业务线 |
| `/api/v1/system/business` | GET | 获取业务线列表 |
| `/api/v1/system/business/:id` | GET | 获取业务线详情 |
| `/api/v1/system/business/:id` | PUT | 更新业务线 |
| `/api/v1/system/business/:id` | DELETE | 删除业务线 |

#### 应用相关
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/system/app` | POST | 创建应用 |
| `/api/v1/system/app` | GET | 获取应用列表 |
| `/api/v1/system/app/:id` | GET | 获取应用详情 |
| `/api/v1/system/app/:id` | PUT | 更新应用 |
| `/api/v1/system/app/:id` | DELETE | 删除应用 |

#### 用户相关
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/system/user` | POST | 创建用户 |
| `/api/v1/system/user` | GET | 获取用户列表 |
| `/api/v1/system/user/:id` | GET | 获取用户详情 |
| `/api/v1/system/user/:id` | PUT | 更新用户 |
| `/api/v1/system/user/:id` | DELETE | 删除用户 |
| `/api/v1/system/user/profile` | GET | 获取用户资料 |
| `/api/v1/system/user/password` | PATCH | 修改密码 |

#### 角色相关
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/system/role` | POST | 创建角色 |
| `/api/v1/system/role` | GET | 获取角色列表 |
| `/api/v1/system/role/:id` | GET | 获取角色详情 |
| `/api/v1/system/role/:id` | PUT | 更新角色 |
| `/api/v1/system/role/:id` | DELETE | 删除角色 |

#### 权限相关
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/system/permission` | POST | 创建权限 |
| `/api/v1/system/permission` | GET | 获取权限列表 |
| `/api/v1/system/permission/:id` | GET | 获取权限详情 |
| `/api/v1/system/permission/:id` | PUT | 更新权限 |
| `/api/v1/system/permission/:id` | DELETE | 删除权限 |

#### 组织架构
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/system/org/company` | POST | 创建公司 |
| `/api/v1/system/org/company` | GET | 获取公司列表 |
| `/api/v1/system/org/department` | POST | 创建部门 |
| `/api/v1/system/org/department` | GET | 获取部门列表 |
| `/api/v1/system/org/position` | POST | 创建岗位 |
| `/api/v1/system/org/position` | GET | 获取岗位列表 |

#### 配置管理
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/system/config/system` | POST | 创建系统配置 |
| `/api/v1/system/config/system` | GET | 获取系统配置列表 |
| `/api/v1/system/config/system/public` | GET | 获取公开配置 |
| `/api/v1/system/config/dict` | POST | 创建字典类型 |
| `/api/v1/system/config/dict` | GET | 获取字典列表 |
| `/api/v1/system/config/dict/data` | POST | 创建字典数据 |
| `/api/v1/system/config/dict/data` | GET | 获取字典数据列表 |

#### 验证码
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/system/captcha/slider` | GET | 获取滑块验证码 |
| `/api/v1/system/captcha/slider/verify` | POST | 验证滑块验证码 |

### 使用示例

#### 1. 获取 RSA 公钥

```bash
curl http://localhost:3000/api/v1/system/rsa/public-key
```

#### 2. 账密登录

```bash
curl -X POST http://localhost:3000/api/v1/system/login/account \
  -H "Content-Type: application/json" \
  -d '{
    "account": "admin",
    "password": "encrypted_password",
    "clientId": "admin_web",
    "captchaId": "xxx",
    "captchaValue": "xxx"
  }'
```

#### 3. 刷新 Token

```bash
curl -X POST http://localhost:3000/api/v1/system/token/refresh \
  -H "Authorization: Bearer <refresh_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "admin_web"
  }'
```

#### 4. 获取用户列表（需要认证）

```bash
curl http://localhost:3000/api/v1/system/user \
  -H "Authorization: Bearer <access_token>"
```
