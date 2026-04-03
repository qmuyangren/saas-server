# 项目框架结构总结

## 一、项目根目录结构

```
project-root/
├── prisma/                        # Prisma相关文件
├── src/                           # 源代码目录
├── test/                          # 测试目录
├── scripts/                       # 脚本目录
├── logs/                          # 日志目录（gitignore）
├── uploads/                       # 上传文件目录（gitignore）
├── .env.example                   # 环境变量示例
├── .env.development               # 开发环境配置（gitignore）
├── .env.production                # 生产环境配置（gitignore）
├── .env.test                      # 测试环境配置（gitignore）
├── .eslintrc.js                   # ESLint配置
├── .prettierrc                    # Prettier配置
├── .gitignore                     # Git忽略文件
├── nest-cli.json                  # NestJS CLI配置
├── package.json                   # 依赖管理
├── tsconfig.json                  # TypeScript配置
├── tsconfig.build.json            # 构建配置
├── README.md                      # 项目说明
└── docker-compose.yml             # Docker编排（可选）
```

## 二、Prisma目录结构

```
prisma/
├── schema.prisma                  # 数据模型定义（核心）
├── migrations/                    # 数据库迁移文件
│   ├── 20240101000000_init/
│   │   └── migration.sql
│   ├── 20240115000000_add_user_fields/
│   │   └── migration.sql
│   └── migration_lock.toml
├── seed.ts                        # 数据填充脚本
├── factories/                     # 测试数据工厂
│   ├── user.factory.ts
│   └── config.factory.ts
└── prisma.config.ts               # Prisma客户端配置（可选）
```

## 三、源代码（src）完整目录结构

```
src/
├── main.ts                        # 应用入口文件
├── app.module.ts                  # 根模块
│
├── modules/                       # 业务模块目录（按领域划分）
│   ├── user/                      # 用户模块
│   │   ├── user.module.ts
│   │   ├── controllers/
│   │   │   ├── user.controller.ts
│   │   │   └── user.admin.controller.ts
│   │   ├── services/
│   │   │   ├── user.service.ts
│   │   │   ├── user.profile.service.ts
│   │   │   └── user.validator.service.ts
│   │   ├── repositories/
│   │   │   └── user.repository.ts
│   │   ├── dto/
│   │   │   ├── requests/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   ├── update-user.dto.ts
│   │   │   │   ├── query-user.dto.ts
│   │   │   │   └── change-password.dto.ts
│   │   │   └── responses/
│   │   │       ├── user-response.dto.ts
│   │   │       ├── user-list-response.dto.ts
│   │   │       └── user-profile-response.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── enums/
│   │   │   ├── user-role.enum.ts
│   │   │   └── user-status.enum.ts
│   │   ├── events/
│   │   │   ├── user-created.event.ts
│   │   │   ├── user-updated.event.ts
│   │   │   └── user-password-changed.event.ts
│   │   ├── interfaces/
│   │   │   └── user.interface.ts
│   │   └── tests/
│   │       ├── user.service.spec.ts
│   │       └── user.controller.spec.ts
│   │
│   ├── auth/                      # 认证模块
│   │   ├── auth.module.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── token.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── token.service.ts
│   │   │   └── session.service.ts
│   │   ├── repositories/
│   │   │   ├── token.repository.ts
│   │   │   └── session.repository.ts
│   │   ├── dto/
│   │   │   ├── requests/
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── refresh-token.dto.ts
│   │   │   │   └── logout.dto.ts
│   │   │   └── responses/
│   │   │       ├── login-response.dto.ts
│   │   │       └── token-response.dto.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── guards/
│   │   │   └── local-auth.guard.ts
│   │   ├── interfaces/
│   │   │   ├── jwt-payload.interface.ts
│   │   │   └── request-with-user.interface.ts
│   │   └── tests/
│   │       ├── auth.service.spec.ts
│   │       └── token.service.spec.ts
│   │
│   ├── config/                    # 系统配置模块
│   │   ├── config.module.ts
│   │   ├── controllers/
│   │   │   ├── config.controller.ts
│   │   │   └── config.admin.controller.ts
│   │   ├── services/
│   │   │   ├── config.service.ts
│   │   │   ├── config.cache.service.ts
│   │   │   └── config.validator.service.ts
│   │   ├── repositories/
│   │   │   └── config.repository.ts
│   │   ├── dto/
│   │   │   ├── requests/
│   │   │   │   ├── create-config.dto.ts
│   │   │   │   ├── update-config.dto.ts
│   │   │   │   └── query-config.dto.ts
│   │   │   └── responses/
│   │   │       ├── config-response.dto.ts
│   │   │       └── config-list-response.dto.ts
│   │   ├── enums/
│   │   │   ├── config-type.enum.ts
│   │   │   └── config-status.enum.ts
│   │   ├── events/
│   │   │   └── config-changed.event.ts
│   │   ├── interfaces/
│   │   │   └── config.interface.ts
│   │   └── tests/
│   │       └── config.service.spec.ts
│   │
│   ├── cache/                     # 缓存模块
│   │   ├── cache.module.ts
│   │   ├── services/
│   │   │   ├── cache.service.ts
│   │   │   ├── redis.service.ts
│   │   │   ├── local-cache.service.ts
│   │   │   └── cache-manager.service.ts
│   │   ├── interceptors/
│   │   │   └── cache.interceptor.ts
│   │   ├── decorators/
│   │   │   ├── cacheable.decorator.ts
│   │   │   └── cache-evict.decorator.ts
│   │   ├── interfaces/
│   │   │   └── cache-options.interface.ts
│   │   ├── constants/
│   │   │   └── cache-keys.const.ts
│   │   └── tests/
│   │       └── cache.service.spec.ts
│   │
│   ├── audit/                     # 审计日志模块
│   │   ├── audit.module.ts
│   │   ├── services/
│   │   │   ├── audit.service.ts
│   │   │   └── audit.async.service.ts
│   │   ├── repositories/
│   │   │   └── audit.repository.ts
│   │   ├── dto/
│   │   │   └── responses/
│   │   │       └── audit-log-response.dto.ts
│   │   ├── decorators/
│   │   │   └── audit.decorator.ts
│   │   ├── interceptors/
│   │   │   └── audit.interceptor.ts
│   │   └── tests/
│   │       └── audit.service.spec.ts
│   │
│   └── health/                    # 健康检查模块
│       ├── health.module.ts
│       ├── controllers/
│       │   └── health.controller.ts
│       └── services/
│           └── health.service.ts
│
├── common/                        # 通用组件目录
│   ├── decorators/                # 自定义装饰器
│   │   ├── public.decorator.ts
│   │   ├── roles.decorator.ts
│   │   ├── current-user.decorator.ts
│   │   ├── cacheable.decorator.ts
│   │   └── audit.decorator.ts
│   │
│   ├── filters/                   # 异常过滤器
│   │   ├── http-exception.filter.ts
│   │   ├── prisma-exception.filter.ts
│   │   └── global-exception.filter.ts
│   │
│   ├── interceptors/              # 拦截器
│   │   ├── transform.interceptor.ts
│   │   ├── logging.interceptor.ts
│   │   ├── timeout.interceptor.ts
│   │   ├── cache.interceptor.ts
│   │   └── audit.interceptor.ts
│   │
│   ├── guards/                    # 守卫
│   │   ├── auth.guard.ts
│   │   ├── roles.guard.ts
│   │   ├── rate-limit.guard.ts
│   │   └── permission.guard.ts
│   │
│   ├── middleware/                # 中间件
│   │   ├── logger.middleware.ts
│   │   ├── trace.middleware.ts
│   │   ├── cors.middleware.ts
│   │   └── compression.middleware.ts
│   │
│   ├── pipes/                     # 管道
│   │   ├── validation.pipe.ts
│   │   ├── parse-id.pipe.ts
│   │   ├── parse-int.pipe.ts
│   │   └── default-value.pipe.ts
│   │
│   ├── interfaces/                # 通用接口
│   │   ├── response.interface.ts
│   │   ├── pagination.interface.ts
│   │   ├── repository.interface.ts
│   │   └── service.interface.ts
│   │
│   ├── constants/                 # 常量定义
│   │   ├── error-codes.const.ts
│   │   ├── cache-keys.const.ts
│   │   ├── http-status.const.ts
│   │   └── regex.const.ts
│   │
│   ├── exceptions/                # 自定义异常
│   │   ├── business.exception.ts
│   │   ├── validation.exception.ts
│   │   └── system.exception.ts
│   │
│   └── utils/                     # 工具函数
│       ├── crypto.util.ts
│       ├── jwt.util.ts
│       ├── date.util.ts
│       ├── string.util.ts
│       ├── pagination.util.ts
│       └── logger.util.ts
│
├── infrastructure/                # 基础设施目录
│   ├── database/                  # 数据库基础设施
│   │   ├── prisma.service.ts
│   │   ├── prisma.module.ts
│   │   ├── prisma-mysql.config.ts
│   │   ├── base.repository.ts
│   │   └── migrations/
│   │
│   ├── cache/                     # 缓存基础设施
│   │   ├── redis.config.ts
│   │   ├── redis.module.ts
│   │   ├── redis.service.ts
│   │   ├── local-cache.service.ts
│   │   └── cache.factory.ts
│   │
│   ├── queue/                     # 消息队列基础设施
│   │   ├── queue.module.ts
│   │   ├── queue.service.ts
│   │   ├── queue.config.ts
│   │   └── processors/
│   │       ├── email.processor.ts
│   │       ├── notification.processor.ts
│   │       └── audit.processor.ts
│   │
│   ├── http/                      # HTTP客户端
│   │   ├── http-client.module.ts
│   │   ├── http-client.service.ts
│   │   └── interceptors/
│   │       └── http-logging.interceptor.ts
│   │
│   ├── storage/                   # 文件存储
│   │   ├── storage.module.ts
│   │   ├── storage.service.ts
│   │   ├── local-storage.service.ts
│   │   └── oss-storage.service.ts
│   │
│   └── lock/                      # 分布式锁
│       ├── lock.module.ts
│       ├── lock.service.ts
│       └── redis-lock.service.ts
│
├── config/                        # 应用配置目录
│   ├── configuration.ts           # 配置加载主文件
│   ├── validation.schema.ts       # 环境变量验证
│   ├── database.config.ts         # 数据库配置
│   ├── redis.config.ts            # Redis配置
│   ├── jwt.config.ts              # JWT配置
│   ├── rate-limit.config.ts       # 限流配置
│   └── environments/              # 环境特定配置
│       ├── development.config.ts
│       ├── production.config.ts
│       └── test.config.ts
│
└── types/                         # 全局类型定义
    ├── global.d.ts                # 全局类型扩展
    ├── express.d.ts               # Express类型扩展
    └── prisma.d.ts                # Prisma类型扩展
```

## 四、测试目录结构

```
test/
├── unit/                          # 单元测试
│   ├── modules/
│   │   ├── user/
│   │   │   ├── user.service.spec.ts
│   │   │   └── user.repository.spec.ts
│   │   └── auth/
│   │       └── auth.service.spec.ts
│   └── common/
│       └── utils/
│           └── crypto.util.spec.ts
│
├── integration/                   # 集成测试
│   ├── user/
│   │   ├── user.controller.spec.ts
│   │   └── user.module.spec.ts
│   ├── auth/
│   │   └── auth-flow.spec.ts
│   └── database/
│       └── prisma.service.spec.ts
│
├── e2e/                          # 端到端测试
│   ├── user.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   └── config.e2e-spec.ts
│
├── fixtures/                      # 测试数据
│   ├── user.fixture.ts
│   ├── config.fixture.ts
│   └── token.fixture.ts
│
├── mocks/                         # Mock对象
│   ├── prisma.mock.ts
│   ├── redis.mock.ts
│   └── cache.mock.ts
│
├── jest-e2e.json                  # E2E测试配置
└── jest.config.js                 # Jest配置
```

## 五、脚本目录结构

```
scripts/
├── seed.ts                        # 数据填充脚本
├── migration-run.ts               # 迁移执行脚本
├── migration-create.ts            # 迁移创建脚本
├── health-check.ts                # 健康检查脚本
├── backup-db.ts                   # 数据库备份脚本
└── deploy/
    ├── before-deploy.sh
    └── after-deploy.sh
```

## 六、目录职责说明

| 目录            | 职责                   | 依赖方向                      |
| --------------- | ---------------------- | ----------------------------- |
| modules/        | 业务模块，按领域划分   | 可依赖common、infrastructure  |
| common/         | 通用组件，跨模块共享   | 不依赖modules                 |
| infrastructure/ | 基础设施，封装外部系统 | 不依赖modules和common         |
| config/         | 配置管理               | 被所有模块依赖                |
| types/          | 全局类型定义           | 被所有模块依赖                |
| prisma/         | 数据模型和迁移         | 被infrastructure/database依赖 |
| test/           | 测试代码               | 依赖src                       |

## 七、模块划分原则

1. **按领域划分**：每个业务模块独立成目录，包含完整的Controller、Service、Repository、DTO
2. **模块隔离**：模块间通过Module的imports建立依赖，不直接引用对方文件
3. **通用能力下沉**：跨模块使用的功能放入common或infrastructure
4. **基础设施抽象**：数据库、缓存、队列等基础设施通过接口抽象，业务层不直接依赖具体实现
5. **类型定义就近原则**：模块内部类型定义在模块内，跨模块类型定义在common/interfaces或types/

## 八、命名规范

| 类型    | 命名规范              | 示例                     |
| ------- | --------------------- | ------------------------ |
| 模块    | 小写+连字符           | user.module.ts           |
| 控制器  | 小写+单词+controller  | user.controller.ts       |
| 服务    | 小写+单词+service     | user.service.ts          |
| 仓储    | 小写+单词+repository  | user.repository.ts       |
| DTO请求 | 动词+名词+dto         | create-user.dto.ts       |
| DTO响应 | 名词+response+dto     | user-response.dto.ts     |
| 枚举    | 大驼峰+enum           | user-role.enum.ts        |
| 接口    | 小写+单词+interface   | user.interface.ts        |
| 常量    | 大写+下划线           | CACHE_KEYS.const.ts      |
| 装饰器  | 小写+单词+decorator   | public.decorator.ts      |
| 过滤器  | 小写+单词+filter      | http-exception.filter.ts |
| 守卫    | 小写+单词+guard       | auth.guard.ts            |
| 拦截器  | 小写+单词+interceptor | logging.interceptor.ts   |
| 中间件  | 小写+单词+middleware  | trace.middleware.ts      |
| 管道    | 小写+单词+pipe        | validation.pipe.ts       |
