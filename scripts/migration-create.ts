/**
 * 迁移创建脚本 - 创建新的 Prisma 数据库迁移
 *
 * @description
 * 根据 schema.prisma 的变更创建新的迁移文件。
 * 适用于开发环境中数据库结构变更的版本管理。
 *
 * 使用方式：
 * ```bash
 * npx ts-node scripts/migration-create.ts "add_user_fields"
 * ```
 *
 * 参数：
 * - name: 迁移名称（必填），描述本次迁移的内容
 *
 * 环境变量：
 * - DATABASE_URL: 数据库连接字符串
 */

import { execSync } from 'child_process';

const migrationName = process.argv[2];

if (!migrationName) {
  console.error(
    '请提供迁移名称：npx ts-node scripts/migration-create.ts "migration_name"',
  );
  process.exit(1);
}

async function main() {
  console.log(`开始创建迁移: ${migrationName}...`);

  try {
    // 创建 Prisma 迁移
    execSync(`npx prisma migrate dev --name ${migrationName}`, {
      stdio: 'inherit',
      env: { ...process.env },
    });

    console.log(`迁移创建完成: ${migrationName}`);
  } catch (error) {
    console.error('迁移创建失败:', error);
    process.exit(1);
  }
}

main();
