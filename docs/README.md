# 项目文档索引

## 📚 核心文档

| 文档 | 说明 |
|------|------|
| [README.md](README.md) | 项目简介和快速开始 |
| [FRAMEWORK_STANDARD.md](FRAMEWORK_STANDARD.md) | 完整的框架规范文档 |
| [FRAMEWORK_SUMMARY.md](FRAMEWORK_SUMMARY.md) | 框架结构总结 |

## 🔐 认证与安全

| 文档 | 说明 |
|------|------|
| [SLIDER_CAPTCHA_USAGE.md](SLIDER_CAPTCHA_USAGE.md) | 滑块验证码使用说明 |
| [SLIDER_CAPTCHA_IMPLEMENTATION.md](SLIDER_CAPTCHA_IMPLEMENTATION.md) | 滑块验证码实现原理 |
| [SLIDER_CAPTCHA_COMPONENT.md](SLIDER_CAPTCHA_COMPONENT.md) | 前端组件配置 |

## 🗂️ 目录结构

```
project-root/
├── src/                         # 源代码目录
│   ├── main.ts                  # 应用入口
│   ├── app.module.ts            # 根模块
│   │
│   ├── common/                  # 公共层
│   │   ├── decorators/          # 自定义装饰器
│   │   ├── guards/              # 守卫（认证、授权、限流）
│   │   ├── interceptors/        # 拦截器（响应、日志）
│   │   ├── utils/               # 工具类
│   │   ├── constants/           # 常量定义
│   │   └── index.ts             # 统一导出
│   │
│   ├── infrastructure/          # 基础设施层
│   │   ├── cache/               # 缓存服务
│   │   ├── database/            # 数据库服务
│   │   ├── http/                # HTTP客户端
│   │   ├── oauth/               # 第三方登录
│   │   ├── pay/                 # 支付服务
│   │   └── storage/             # 文件存储
│   │
│   ├── modules/                 # 业务模块
│   │   ├── system/              # 系统模块
│   │   │   ├── auth/            # 认证模块
│   │   │   ├── tenant/          # 租户模块
│   │   │   ├── business/        # 业务线模块
│   │   │   ├── app/             # 应用模块
│   │   │   ├── user/            # 用户模块
│   │   │   ├── role/            # 角色模块
│   │   │   ├── permission/      # 权限模块
│   │   │   ├── org/             # 组织架构模块
│   │   │   ├── config/          # 配置模块
│   │   │   ├── dict/            # 字典模块
│   │   │   └── captcha/         # 验证码模块
│   │   └── features/            # 业务功能模块（预留）
│   │
│   └── types/                   # 类型定义
│
├── prisma/                      # Prisma相关
│   ├── schema.prisma            # 数据模型定义
│   └── migrations/              # 数据库迁移
│
└── scripts/                     # 脚本工具
    └── seed.ts                  # 数据填充
```

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run start:dev

# 生产构建
npm run build

# 生产运行
npm run start:prod

# API文档
# 访问 http://localhost:3000/api/docs
```

## 📝 开发规范

- **命名规范**: 参考 `FRAMEWORK_STANDARD.md` 中的代码规范章节
- **数据库设计**: 参考 `FRAMEWORK_STANDARD.md` 中的数据库设计规范
- **模块结构**: 参考 `FRAMEWORK_SUMMARY.md` 中的目录结构说明
- **CICD**: 项目使用 GitHub Actions 进行持续集成

## 📊 数据库模型

主要模型：
- **User**: 用户表
- **Tenant**: 租户表
- **Business**: 业务线表
- **App**: 应用模块表
- **Role**: 角色表
- **Permission**: 权限表

完整模型请查看 `prisma/schema.prisma`

## 🔧 配置管理

环境变量配置：
- `.env.development` - 开发环境
- `.env.production` - 生产环境
- `.env.test` - 测试环境

参考 `.env.example` 文件格式
