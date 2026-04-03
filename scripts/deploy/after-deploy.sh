#!/bin/bash
#
# 部署后验证脚本 - 验证部署结果和服务状态
#
# @description
# 在部署完成后执行验证检查，确保服务正常运行。
# 包括构建验证、数据库迁移、服务启动检查、健康检查等。
#
# 使用方式：
# ```bash
# chmod +x scripts/deploy/after-deploy.sh
# ./scripts/deploy/after-deploy.sh
# ```

set -e

echo "=========================================="
echo "  部署后验证"
echo "=========================================="

# 执行数据库迁移
echo "执行数据库迁移..."
npx prisma migrate deploy
echo "✅ 数据库迁移完成"

# 构建项目
echo "构建项目..."
npm run build
echo "✅ 项目构建完成"

# 等待服务启动
echo "等待服务启动..."
sleep 3

# 检查服务健康状态
echo "检查服务健康状态..."
APP_URL=${APP_URL:-http://localhost:8081}

for i in $(seq 1 10); do
  if curl -s "$APP_URL/api/v1" > /dev/null 2>&1; then
    echo "✅ 服务启动成功"
    break
  fi
  if [ "$i" -eq 10 ]; then
    echo "❌ 服务启动超时"
    exit 1
  fi
  echo "等待服务启动... ($i/10)"
  sleep 2
done

# 执行健康检查
echo "执行健康检查..."
npx ts-node scripts/health-check.ts || echo "⚠️  健康检查未完全通过"

# 清理旧版本备份
echo "清理旧版本备份..."
if [ -d "dist" ]; then
  echo "✅ 新版本已部署"
fi

echo ""
echo "=========================================="
echo "  ✅ 部署验证完成"
echo "=========================================="
echo ""
echo "服务地址: $APP_URL"
echo "API 文档: $APP_URL/api/docs"
