#!/bin/bash
#
# 部署前检查脚本 - 验证部署环境和依赖
#
# @description
# 在部署前执行一系列检查，确保部署环境满足要求。
# 包括 Node.js 版本、依赖安装、环境变量、数据库连接等。
#
# 使用方式：
# ```bash
# chmod +x scripts/deploy/before-deploy.sh
# ./scripts/deploy/before-deploy.sh
# ```

set -e

echo "=========================================="
echo "  部署前检查"
echo "=========================================="

# 检查 Node.js 版本
echo "检查 Node.js 版本..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 版本过低，需要 18 或更高版本"
  exit 1
fi
echo "✅ Node.js 版本: $(node -v)"

# 检查 npm 版本
echo "检查 npm 版本..."
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 9 ]; then
  echo "❌ npm 版本过低，需要 9 或更高版本"
  exit 1
fi
echo "✅ npm 版本: $(npm -v)"

# 检查依赖是否安装
echo "检查依赖安装..."
if [ ! -d "node_modules" ]; then
  echo "⚠️  node_modules 不存在，正在安装依赖..."
  npm install --production=false
fi
echo "✅ 依赖已安装"

# 检查环境变量文件
echo "检查环境变量..."
if [ ! -f ".env" ]; then
  echo "❌ .env 文件不存在，请从 .env.example 复制并配置"
  exit 1
fi
echo "✅ .env 文件存在"

# 检查 Prisma 客户端
echo "检查 Prisma 客户端..."
if [ ! -d "node_modules/.prisma" ]; then
  echo "⚠️  Prisma 客户端未生成，正在生成..."
  npx prisma generate
fi
echo "✅ Prisma 客户端已生成"

# 检查数据库连接
echo "检查数据库连接..."
if command -v mysql &> /dev/null; then
  DB_HOST=$(grep DB_HOST .env | cut -d'=' -f2)
  DB_PORT=$(grep DB_PORT .env | cut -d'=' -f2)
  DB_USER=$(grep DB_USER .env | cut -d'=' -f2)
  if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -e "SELECT 1" &> /dev/null; then
    echo "✅ 数据库连接正常"
  else
    echo "⚠️  数据库连接失败，请检查配置"
  fi
else
  echo "⚠️  mysql 命令不可用，跳过数据库检查"
fi

echo ""
echo "=========================================="
echo "  ✅ 所有检查通过，可以开始部署"
echo "=========================================="
