/**
 * 迁移执行脚本 - 运行 Prisma 数据库迁移
 *
 * @description
 * 自动执行 Prisma 迁移文件，将数据库结构更新到最新状态。
 * 适用于部署时或开发环境中的数据库结构同步。
 *
 * 使用方式：
 * ```bash
 * npx ts-node scripts/migration-run.ts
 * ```
 *
 * 环境变量：
 * - DATABASE_URL: 数据库连接字符串
 */

import { execSync } from 'child_process';

async function main() {
  console.log('开始执行数据库迁移...');

  try {
    // 执行 Prisma 迁移
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env },
    });

    console.log('数据库迁移执行完成！');
  } catch (error) {
    console.error('数据库迁移执行失败:', error);
    process.exit(1);
  }
}

main();
