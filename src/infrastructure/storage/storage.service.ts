import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    this.ensureUploadDir();
  }

  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(
    file: { originalname: string; buffer: Buffer },
    customPath?: string,
  ): Promise<string> {
    const destPath = customPath
      ? path.join(this.uploadDir, customPath)
      : this.uploadDir;
    this.ensureUploadDir();

    const filePath = path.join(destPath, file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    this.logger.log(`File saved: ${filePath}`);
    return filePath;
  }

  async getFile(filePath: string): Promise<Buffer> {
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(this.uploadDir, filePath);
    return fs.readFileSync(fullPath);
  }

  async deleteFile(filePath: string): Promise<boolean> {
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(this.uploadDir, filePath);
    try {
      fs.unlinkSync(fullPath);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath}`, error);
      return false;
    }
  }

  async listFiles(dir?: string): Promise<string[]> {
    const targetDir = dir ? path.join(this.uploadDir, dir) : this.uploadDir;
    return fs.readdirSync(targetDir);
  }
}
