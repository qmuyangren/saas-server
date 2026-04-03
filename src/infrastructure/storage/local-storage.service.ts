import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 本地文件存储服务 - 基于本地文件系统的存储实现
 *
 * @description
 * 将文件保存到服务器本地磁盘，适用于单机部署或开发环境。
 * 支持文件上传、下载、删除、列表查询等操作。
 * 自动创建目录结构，支持自定义存储路径和文件名。
 *
 * 特性：
 * - 自动创建目录结构
 * - 支持自定义文件名和路径
 * - 文件大小限制
 * - 文件类型白名单
 * - 自动清理临时文件
 *
 * @example
 * ```typescript
 * // 上传文件
 * const filePath = await this.localStorage.upload(file, 'avatars');
 *
 * // 下载文件
 * const buffer = await this.localStorage.download(filePath);
 *
 * // 删除文件
 * await this.localStorage.remove(filePath);
 *
 * // 列出目录
 * const files = await this.localStorage.list('avatars');
 * ```
 */
@Injectable()
export class LocalStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedTypes: string[];

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>(
      'STORAGE_LOCAL_PATH',
      './uploads',
    );
    this.maxFileSize = this.configService.get<number>(
      'STORAGE_MAX_SIZE',
      10 * 1024 * 1024,
    ); // 10MB
    this.allowedTypes = this.configService
      .get<string>(
        'STORAGE_ALLOWED_TYPES',
        'image/jpeg,image/png,image/gif,application/pdf',
      )
      .split(',');

    this.ensureUploadDir();
  }

  /**
   * 确保上传目录存在
   */
  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadDir}`);
    }
  }

  /**
   * 上传文件到本地存储
   *
   * @param file - 文件对象（包含 originalname、buffer、size、mimetype）
   * @param subDir - 子目录名称（可选）
   * @returns 文件的相对路径
   */
  async upload(
    file: {
      originalname: string;
      buffer: Buffer;
      size: number;
      mimetype?: string;
    },
    subDir?: string,
  ): Promise<string> {
    // 检查文件大小
    if (file.size > this.maxFileSize) {
      throw new Error(
        `文件大小超过限制（最大 ${this.maxFileSize / 1024 / 1024}MB）`,
      );
    }

    // 检查文件类型
    if (file.mimetype && !this.allowedTypes.includes(file.mimetype)) {
      throw new Error(`不支持的文件类型：${file.mimetype}`);
    }

    // 生成文件名
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    // 构建完整路径
    const targetDir = subDir
      ? path.join(this.uploadDir, subDir)
      : this.uploadDir;
    const filePath = path.join(targetDir, fileName);

    // 确保子目录存在
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 写入文件
    fs.writeFileSync(filePath, file.buffer);
    this.logger.log(`File uploaded: ${filePath}`);

    // 返回相对路径
    return path.relative(this.uploadDir, filePath);
  }

  /**
   * 下载文件
   *
   * @param filePath - 文件相对路径
   * @returns 文件 Buffer
   */
  async download(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.uploadDir, filePath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`文件不存在：${filePath}`);
    }

    return fs.readFileSync(fullPath);
  }

  /**
   * 删除文件
   *
   * @param filePath - 文件相对路径
   * @returns 是否删除成功
   */
  async remove(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.uploadDir, filePath);

    try {
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        this.logger.log(`File removed: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to remove file: ${filePath}`, error);
      return false;
    }
  }

  /**
   * 列出目录中的文件
   *
   * @param subDir - 子目录名称（可选）
   * @returns 文件名列表
   */
  async list(subDir?: string): Promise<string[]> {
    const targetDir = subDir
      ? path.join(this.uploadDir, subDir)
      : this.uploadDir;

    if (!fs.existsSync(targetDir)) {
      return [];
    }

    return fs.readdirSync(targetDir);
  }

  /**
   * 获取文件信息
   *
   * @param filePath - 文件相对路径
   * @returns 文件信息（大小、修改时间等）
   */
  async getInfo(filePath: string): Promise<{
    size: number;
    modifiedAt: Date;
    exists: boolean;
  }> {
    const fullPath = path.join(this.uploadDir, filePath);

    if (!fs.existsSync(fullPath)) {
      return { size: 0, modifiedAt: new Date(0), exists: false };
    }

    const stats = fs.statSync(fullPath);
    return {
      size: stats.size,
      modifiedAt: stats.mtime,
      exists: true,
    };
  }

  /**
   * 获取文件访问 URL
   *
   * @param filePath - 文件相对路径
   * @returns 文件访问 URL
   */
  getUrl(filePath: string): string {
    const baseUrl = this.configService.get<string>(
      'STORAGE_LOCAL_URL',
      '/uploads',
    );
    return `${baseUrl}/${filePath}`;
  }
}
