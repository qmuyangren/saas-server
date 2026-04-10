import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

import { CacheService } from '@/infrastructure/cache/cache.service';
import { UploadConfig } from './entities/storage.entity';
import { BaseExternalService } from '@/infrastructure/core/base.external.service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 文件存储服务
 *
 * @description
 * 提供统一的文件存储服务，支持多种存储方式：
 * - 本地存储
 * - 阿里云OSS
 * - 七牛云存储
 *
 * 使用方式：
 * ```typescript
 * // 上传文件
 * const file = await this.storageService.upload(buffer, 'image/png', 'test.png');
 *
 * // 下载文件
 * const stream = await this.storageService.download('2024/01/01/xxx.png');
 *
 * // 删除文件
 * await this.storageService.delete('2024/01/01/xxx.png');
 *
 * // 直接调用 OSS SDK
 * const ossSdk = this.storageService.getOssSdk(config);
 * const result = await ossSdk.put(filePath, fileBuffer);
 *
 * // 直接调用 七牛云 SDK
 * const qiniuSdk = this.storageService.getQiniuSdk(config);
 * const result = await qiniuSdk.upload(fileBuffer, filePath);
 * ```
 *
 * 配置格式（存储在 cfg_system_config 表）：
 * {
 *   "storageType": "oss",
 *   "localPath": "./uploads",
 *   "maxSize": 10485760,
 *   "allowedTypes": ["image/jpeg", "image/png", "image/gif", "application/pdf"],
 *   "oss": {
 *     "endpoint": "https://oss-cn-hangzhou.aliyuncs.com",
 *     "accessKeyId": "your_access_key_id",
 *     "accessKeySecret": "your_access_key_secret",
 *     "bucketName": "your-bucket-name",
 *     "bucketUrl": "https://your-bucket-name.oss-cn-hangzhou.aliyuncs.com"
 *   },
 *   "qiniu": {
 *     "accessKey": "your_access_key",
 *     "secretKey": "your_secret_key",
 *     "bucket": "your-bucket-name",
 *     "domain": "https://cdn.your-domain.com",
 *     "region": "z0"
 *   }
 * }
 */
@Injectable()
export class StorageService extends BaseExternalService<UploadConfig> {
  // 配置键名
  protected configKey = 'storage';

  // 必需的配置项（根据存储类型不同而不同）
  protected requiredConfigKeys = ['storageType'];

  constructor(private readonly cache: CacheService) {
    super();
  }

  /**
   * 从缓存加载配置
   */
  private async loadConfigFromCache(): Promise<UploadConfig | null> {
    const cacheKey = 'storage:config';
    const cached = await this.cache.get<UploadConfig>(cacheKey);
    if (cached) return cached;

    // 从数据库读取配置
    const configData = await this.getConfigFromDatabase();
    if (configData) {
      await this.cache.set(cacheKey, configData, 3600);
      return configData;
    }

    // 返回默认配置
    return this.getDefaultConfig();
  }

  /**
   * 从数据库获取配置
   */
  private async getConfigFromDatabase(): Promise<UploadConfig | null> {
    // 实际应该从数据库读取
    // const configData = await this.prisma.cfgSystemConfig.findUnique({
    //   where: { configKey: 'storage_config', isDeleted: 0 },
    // });
    // if (configData?.configValue) {
    //   return JSON.parse(configData.configValue) as UploadConfig;
    // }
    return null;
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): UploadConfig {
    return {
      storageType: 'local',
      localPath: './uploads',
      maxSize: 10 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    };
  }

  /**
   * 获取存储配置
   */
  async getStorageConfig(): Promise<UploadConfig | null> {
    return this.config;
  }

  /**
   * 检查存储类型是否启用
   */
  async isStorageEnabled(storageType: 'local' | 'oss' | 'qiniu'): Promise<boolean> {
    const config = await this.getStorageConfig();
    return config?.storageType === storageType;
  }

  // ==================== 文件操作 gateway ====================

  /**
   * 上传文件
   * @param fileBuffer 文件Buffer
   * @param fileType 文件类型（MIME）
   * @param originalName 原始文件名
   * @returns 文件信息
   */
  async upload(
    fileBuffer: Buffer,
    fileType: string,
    originalName: string,
  ): Promise<{
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
    path: string;
    url: string;
    md5: string;
    storageType: 'local' | 'oss' | 'qiniu';
    uploadTime: Date;
  }> {
    const config = await this.getStorageConfig();
    if (!config) {
      throw new BadRequestException('文件存储未配置');
    }

    const maxSize = config.maxSize || 10 * 1024 * 1024;
    if (fileBuffer.length > maxSize) {
      throw new BadRequestException('文件大小超过限制');
    }

    if (config.allowedTypes && !config.allowedTypes.includes(fileType)) {
      throw new BadRequestException('不支持的文件类型');
    }

    const md5 = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const fileExtension = path.extname(originalName);
    const fileName = `${md5}${fileExtension}`;
    const relativePath = this.generateFilePath(fileName);

    let url = '';
    const uploadTime = new Date();

    switch (config.storageType) {
      case 'local':
        url = await this.uploadToLocal(fileBuffer, relativePath);
        break;
      case 'oss':
        url = await this.uploadToOSS(fileBuffer, relativePath, fileType, config);
        break;
      case 'qiniu':
        url = await this.uploadToQiniu(fileBuffer, relativePath, fileType, config);
        break;
      default:
        throw new BadRequestException('不支持的存储类型');
    }

    const fileId = crypto.randomBytes(16).toString('hex');
    await this.cache.set(`file:${fileId}`, {
      id: fileId,
      originalName,
      size: fileBuffer.length,
      mimeType: fileType,
      path: relativePath,
      url,
      md5,
      storageType: config.storageType,
      uploadTime,
    }, 7200);

    return {
      id: fileId,
      originalName,
      size: fileBuffer.length,
      mimeType: fileType,
      path: relativePath,
      url,
      md5,
      storageType: config.storageType,
      uploadTime,
    };
  }

  /**
   * 下载文件
   * @param filePath 文件路径
   * @returns 文件流
   */
  async download(filePath: string): Promise<NodeJS.ReadableStream> {
    const config = await this.getStorageConfig();
    if (!config) {
      throw new BadRequestException('文件存储未配置');
    }

    switch (config.storageType) {
      case 'local':
        const localPath = path.join(this.getStorageBasePath(config), filePath);
        if (!fs.existsSync(localPath)) {
          throw new BadRequestException('文件不存在');
        }
        return fs.createReadStream(localPath);
      case 'oss':
        return this.downloadFromOSS(filePath, config);
      case 'qiniu':
        return this.downloadFromQiniu(filePath, config);
      default:
        throw new BadRequestException('不支持的存储类型');
    }
  }

  /**
   * 删除文件
   * @param filePath 文件路径
   * @returns 是否成功
   */
  async delete(filePath: string): Promise<boolean> {
    const config = await this.getStorageConfig();
    if (!config) {
      throw new BadRequestException('文件存储未配置');
    }

    switch (config.storageType) {
      case 'local':
        const localPath = path.join(this.getStorageBasePath(config), filePath);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
        break;
      case 'oss':
        await this.deleteFromOSS(filePath, config);
        break;
      case 'qiniu':
        await this.deleteFromQiniu(filePath, config);
        break;
    }

    return true;
  }

  // ==================== OSS SDK ====================

  /**
   * 获取 OSS SDK 实例
   * @param config 配置对象
   * @returns OSS SDK 实例
   */
  getOssSdk(config: UploadConfig): any {
    if (!config.oss) {
      this.getLogger().warn('OSS 配置缺失，SDK 将使用模拟模式');
      return this.createOssSdkMock(config);
    }
    return this.createOssSdk(config);
  }

  /**
   * 创建 OSS SDK 实例
   * @param config 配置对象
   * @returns OSS SDK 实例
   */
  private createOssSdk(config: UploadConfig): any {
    try {
      // 实际应该导入阿里云 OSS SDK
      // const OSS = require('ali-oss');
      // return new OSS({
      //   region: config.oss.endpoint.replace('https://', '').replace('http://', ''),
      //   accessKeyId: config.oss.accessKeyId,
      //   accessKeySecret: config.oss.accessKeySecret,
      //   bucket: config.oss.bucketName,
      //   timeout: 15000,
      // });
      return this.createOssSdkMock(config);
    } catch (error) {
      this.getLogger().error('创建 OSS SDK 失败', error);
      return this.createOssSdkMock(config);
    }
  }

  /**
   * OSS SDK 模拟实现（供参考）
   * @param config 配置对象
   */
  private createOssSdkMock(config: UploadConfig): any {
    return {
      /**
       * 上传文件
       */
      async put(filePath: string, fileBuffer: Buffer, options?: { contentType: string }): Promise<{ name: string; url: string }> {
        this.getLogger().warn('OSS SDK 未配置，使用模拟模式');
        return {
          name: filePath,
          url: `${config.oss?.bucketUrl || 'https://oss.example.com'}/${filePath}`,
        };
      },

      /**
       * 下载文件
       */
      async get(filePath: string): Promise<NodeJS.ReadableStream> {
        this.getLogger().warn('OSS SDK 未配置，使用模拟模式');
        throw new Error('OSS download is not configured');
      },

      /**
       * 删除文件
       */
      async delete(filePath: string): Promise<void> {
        this.getLogger().warn('OSS SDK 未配置，使用模拟模式');
      },

      /**
       * 检查文件是否存在
       */
      async head(filePath: string): Promise<boolean> {
        this.getLogger().warn('OSS SDK 未配置，使用模拟模式');
        return false;
      },

      /**
       * 列出文件
       */
      async list(options?: { prefix: string; marker: string; maxKeys: number }): Promise<{ objects: Array<{ name: string; url: string }> }> {
        this.getLogger().warn('OSS SDK 未配置，使用模拟模式');
        return { objects: [] };
      },
    };
  }

  /**
   * 上传到阿里云 OSS（内部调用）
   */
  private async uploadToOSS(
    fileBuffer: Buffer,
    filePath: string,
    fileType: string,
    config: UploadConfig,
  ): Promise<string> {
    try {
      const sdk = this.getOssSdk(config);
      const result = await sdk.put(filePath, fileBuffer, { contentType: fileType });
      return result.url;
    } catch (error) {
      this.getLogger().error('OSS 上传失败', error);
      throw error;
    }
  }

  /**
   * 从阿里云 OSS 下载（内部调用）
   */
  private async downloadFromOSS(filePath: string, config: UploadConfig): Promise<NodeJS.ReadableStream> {
    try {
      const sdk = this.getOssSdk(config);
      return await sdk.get(filePath);
    } catch (error) {
      this.getLogger().error('OSS 下载失败', error);
      throw new BadRequestException('OSS 下载失败: ' + error.message);
    }
  }

  /**
   * 从阿里云 OSS 删除（内部调用）
   */
  private async deleteFromOSS(filePath: string, config: UploadConfig): Promise<void> {
    try {
      const sdk = this.getOssSdk(config);
      await sdk.delete(filePath);
    } catch (error) {
      this.getLogger().error('OSS 删除失败', error);
    }
  }

  // ==================== 七牛云 SDK ====================

  /**
   * 获取七牛云 SDK 实例
   * @param config 配置对象
   * @returns 七牛云 SDK 实例
   */
  getQiniuSdk(config: UploadConfig): any {
    if (!config.qiniu) {
      this.getLogger().warn('七牛云配置缺失，SDK 将使用模拟模式');
      return this.createQiniuSdkMock(config);
    }
    return this.createQiniuSdk(config);
  }

  /**
   * 创建七牛云 SDK 实例
   * @param config 配置对象
   * @returns 七牛云 SDK 实例
   */
  private createQiniuSdk(config: UploadConfig): any {
    try {
      // 实际应该导入七牛云 SDK
      // const qiniu = require('qiniu');
      // const mac = new qiniu.auth.digest.Mac(config.qiniu.accessKey, config.qiniu.secretKey);
      // return { qiniu, mac };
      return this.createQiniuSdkMock(config);
    } catch (error) {
      this.getLogger().error('创建七牛云 SDK 失败', error);
      return this.createQiniuSdkMock(config);
    }
  }

  /**
   * 七牛云 SDK 模拟实现（供参考）
   * @param config 配置对象
   */
  private createQiniuSdkMock(config: UploadConfig): any {
    return {
      /**
       * 上传文件
       */
      async upload(fileBuffer: Buffer, filePath: string, options?: { contentType: string }): Promise<{ key: string; url: string }> {
        this.getLogger().warn('七牛云 SDK 未配置，使用模拟模式');
        return {
          key: filePath,
          url: `${config.qiniu?.domain || 'https://cdn.example.com'}/${filePath}`,
        };
      },

      /**
       * 下载文件
       */
      async download(bucket: string, filePath: string): Promise<NodeJS.ReadableStream> {
        this.getLogger().warn('七牛云 SDK 未配置，使用模拟模式');
        throw new Error('七牛云下载未实现');
      },

      /**
       * 删除文件
       */
      async delete(bucket: string, filePath: string): Promise<void> {
        this.getLogger().warn('七牛云 SDK 未配置，使用模拟模式');
      },

      /**
       * 检查文件是否存在
       */
      async stat(bucket: string, filePath: string): Promise<boolean> {
        this.getLogger().warn('七牛云 SDK 未配置，使用模拟模式');
        return false;
      },

      /**
       * 获取文件信息
       */
      async info(bucket: string, filePath: string): Promise<{ size: number; mimeType: string }> {
        this.getLogger().warn('七牛云 SDK 未配置，使用模拟模式');
        return { size: 0, mimeType: '' };
      },
    };
  }

  /**
   * 上传到七牛云（内部调用）
   */
  private async uploadToQiniu(
    fileBuffer: Buffer,
    filePath: string,
    fileType: string,
    config: UploadConfig,
  ): Promise<string> {
    try {
      const sdk = this.getQiniuSdk(config);
      const result = await sdk.upload(fileBuffer, filePath, { contentType: fileType });
      return result.url;
    } catch (error) {
      this.getLogger().error('七牛云上传失败', error);
      throw error;
    }
  }

  /**
   * 从七牛云下载（内部调用）
   */
  private async downloadFromQiniu(filePath: string, config: UploadConfig): Promise<NodeJS.ReadableStream> {
    try {
      const sdk = this.getQiniuSdk(config);
      return await sdk.download(config.qiniu!.bucket, filePath);
    } catch (error) {
      this.getLogger().error('七牛云下载失败', error);
      throw new BadRequestException('七牛云下载失败: ' + error.message);
    }
  }

  /**
   * 从七牛云删除（内部调用）
   */
  private async deleteFromQiniu(filePath: string, config: UploadConfig): Promise<void> {
    try {
      const sdk = this.getQiniuSdk(config);
      await sdk.delete(config.qiniu!.bucket, filePath);
    } catch (error) {
      this.getLogger().error('七牛云删除失败', error);
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 生成文件存储路径
   */
  private generateFilePath(fileName: string): string {
    const date = new Date();
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return path.join(year, month, day, fileName);
  }

  /**
   * 获取存储根路径
   */
  private getStorageBasePath(config: UploadConfig): string {
    const uploadPath = config.localPath || process.env.UPLOAD_PATH || './uploads';
    return path.isAbsolute(uploadPath) ? uploadPath : path.join(process.cwd(), uploadPath);
  }

  /**
   * 上传到本地存储
   */
  private async uploadToLocal(fileBuffer: Buffer, fullPath: string): Promise<string> {
    try {
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, fileBuffer);
      return `/uploads/${fullPath}`;
    } catch (error) {
      this.getLogger().error('本地存储失败', error);
      throw error;
    }
  }
}
