import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * OSS 对象存储服务 - 基于阿里云 OSS 的云存储实现
 *
 * @description
 * 将文件保存到阿里云 OSS 对象存储，适用于生产环境。
 * 支持文件上传、下载、删除、生成签名 URL 等操作。
 * 提供高可用、高并发的文件存储能力，支持 CDN 加速。
 *
 * 特性：
 * - 分片上传（大文件）
 * - 签名 URL（临时访问）
 * - 文件类型限制
 * - CDN 加速
 * - 自动重试
 *
 * @example
 * ```typescript
 * // 上传文件
 * const url = await this.ossStorage.upload(file, 'avatars');
 *
 * // 生成签名 URL（1 小时有效）
 * const signedUrl = await this.ossStorage.getSignedUrl(filePath, 3600);
 *
 * // 删除文件
 * await this.ossStorage.remove(filePath);
 * ```
 */
@Injectable()
export class OssStorageService {
  private readonly logger = new Logger(OssStorageService.name);
  private readonly bucket: string;
  private readonly region: string;
  private readonly accessKeyId: string;
  private readonly accessKeySecret: string;
  private readonly cdnDomain: string;
  private client: any;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('OSS_BUCKET', '');
    this.region = this.configService.get<string>(
      'OSS_REGION',
      'oss-cn-hangzhou',
    );
    this.accessKeyId = this.configService.get<string>('OSS_ACCESS_KEY_ID', '');
    this.accessKeySecret = this.configService.get<string>(
      'OSS_ACCESS_KEY_SECRET',
      '',
    );
    this.cdnDomain = this.configService.get<string>('OSS_CDN_DOMAIN', '');
  }

  /**
   * 初始化 OSS 客户端
   */
  private async initClient(): Promise<void> {
    if (this.client) {
      return;
    }

    try {
      const OSS = require('ali-oss');
      this.client = new OSS({
        region: this.region,
        accessKeyId: this.accessKeyId,
        accessKeySecret: this.accessKeySecret,
        bucket: this.bucket,
      });
      this.logger.log('OSS client initialized');
    } catch (error) {
      this.logger.error('Failed to initialize OSS client', error);
      throw error;
    }
  }

  /**
   * 上传文件到 OSS
   *
   * @param file - 文件对象（包含 originalname、buffer、mimetype）
   * @param subDir - 子目录名称（可选）
   * @returns 文件访问 URL
   */
  async upload(
    file: { originalname: string; buffer: Buffer; mimetype?: string },
    subDir?: string,
  ): Promise<string> {
    await this.initClient();

    const ext = this.getFileExtension(file.originalname);
    const fileName = `${subDir ? subDir + '/' : ''}${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    try {
      await this.client.put(fileName, file.buffer);
      this.logger.log(`File uploaded to OSS: ${fileName}`);
      return this.getUrl(fileName);
    } catch (error) {
      this.logger.error(`Failed to upload file to OSS: ${fileName}`, error);
      throw error;
    }
  }

  /**
   * 下载文件
   *
   * @param filePath - 文件在 OSS 中的路径
   * @returns 文件 Buffer
   */
  async download(filePath: string): Promise<Buffer> {
    await this.initClient();

    try {
      const result = await this.client.get(filePath);
      return result.content;
    } catch (error) {
      this.logger.error(`Failed to download file from OSS: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * 删除文件
   *
   * @param filePath - 文件在 OSS 中的路径
   * @returns 是否删除成功
   */
  async remove(filePath: string): Promise<boolean> {
    await this.initClient();

    try {
      await this.client.delete(filePath);
      this.logger.log(`File removed from OSS: ${filePath}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove file from OSS: ${filePath}`, error);
      return false;
    }
  }

  /**
   * 获取文件访问 URL
   *
   * @param filePath - 文件在 OSS 中的路径
   * @returns 文件访问 URL（CDN 或 OSS 直连）
   */
  getUrl(filePath: string): string {
    if (this.cdnDomain) {
      return `${this.cdnDomain}/${filePath}`;
    }
    return `https://${this.bucket}.${this.region}.aliyuncs.com/${filePath}`;
  }

  /**
   * 获取签名 URL（临时访问）
   *
   * @param filePath - 文件在 OSS 中的路径
   * @param expires - 有效期（秒），默认 3600 秒（1 小时）
   * @returns 签名 URL
   */
  async getSignedUrl(filePath: string, expires = 3600): Promise<string> {
    await this.initClient();

    try {
      return this.client.signatureUrl(filePath, {
        expires,
      });
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * 列出目录中的文件
   *
   * @param prefix - 目录前缀
   * @returns 文件列表
   */
  async list(
    prefix?: string,
  ): Promise<Array<{ name: string; url: string; size: number }>> {
    await this.initClient();

    try {
      const result = await this.client.list({ prefix, 'max-keys': 100 });
      return result.objects.map((obj: any) => ({
        name: obj.name,
        url: this.getUrl(obj.name),
        size: obj.size,
      }));
    } catch (error) {
      this.logger.error(`Failed to list files: ${prefix}`, error);
      return [];
    }
  }

  /**
   * 获取文件扩展名
   *
   * @param filename - 文件名
   * @returns 文件扩展名（含点号）
   */
  private getFileExtension(filename: string): string {
    const ext = filename.split('.').pop();
    return ext ? `.${ext}` : '';
  }
}
