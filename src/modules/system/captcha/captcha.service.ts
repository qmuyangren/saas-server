import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

import { CacheService } from '@/infrastructure/cache/cache.service';
import { SliderCaptchaVerifyResult, CaptchaShape } from './entities/login.entity';

/**
 * 验证码服务
 *
 * @description
 * 提供通用的验证码功能：
 * - 滑块验证码生成和验证
 * - 验证码缓存管理
 * - 多场景验证码复用
 */
@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);
  private readonly cacheTtl = 300; // 5分钟

  constructor(private readonly cache: CacheService) {}

  /**
   * 生成滑块验证码
   * 返回包含Base64图片和Y轴位置的验证码信息
   */
  async createSliderCaptcha(): Promise<{
    captchaId: string;
    y: number;
    correctX: number;
    shape: CaptchaShape;
    backgroundImage: string;
    sliderImage: string;
    width: number;
    height: number;
    blockSize: number;
  }> {
    const captchaId = crypto.randomUUID();
    const shape = this.getRandomShape() as CaptchaShape;

    // 随机Y轴位置 (20-115px)
    const y = Math.floor(Math.random() * 95) + 20;

    // 生成图片 (这里需要实现真正的图片生成逻辑)
    const images = await this.generateCaptchaImages(shape, y);

    // 存储验证码数据
    await this.cache.set(
      `captcha:slider:${captchaId}`,
      {
        y,
        shape,
        createdAt: new Date(),
        expireAt: new Date(Date.now() + this.cacheTtl * 1000),
      },
      this.cacheTtl,
    );

    this.logger.log(`验证码生成: ${captchaId}, shape: ${shape}, y: ${y}`);

    return {
      captchaId,
      y,
      correctX: 0,
      shape,
      backgroundImage: images.background,
      sliderImage: images.slider,
      width: 310,
      height: 155,
      blockSize: 40,
    };
  }

  /**
   * 验证滑块验证码
   */
  async verifySliderCaptcha(
    captchaId: string,
    captchaResult: string,
  ): Promise<boolean> {
    const captchaKey = `captcha:slider:${captchaId}`;
    const stored = await this.cache.get<{
      y: number;
      shape: string;
      createdAt: string;
    }>(captchaKey);

    if (!stored) {
      throw new BadRequestException('验证码已过期或不存在');
    }

    try {
      const result = JSON.parse(captchaResult) as SliderCaptchaVerifyResult;
      const { y, t, track } = result;

      // 验证Y轴位置 (允许 5px 误差)
      const diff = Math.abs(y - stored.y);
      if (diff > 5) {
        this.logger.log(`验证码验证失败: Y轴偏差 ${diff}px`);
        return false;
      }

      // 验证时间 (至少 300ms，最多 60s)
      if (t < 300 || t > 60000) {
        this.logger.log(`验证码验证失败: 时间 ${t}ms 超出范围`);
        return false;
      }

      // 验证轨迹
      if (track && track.length > 0) {
        // 验证轨迹点数量
        if (track.length < 5) {
          return false;
        }

        // 验证Y轴变化（应该很小）
        const yValues = track.map(item => item.y);
        const yChanges = Math.max(...yValues) - Math.min(...yValues);
        if (yChanges > 10) {
          return false;
        }
      }

      // 验证通过，删除验证码
      await this.cache.del(captchaKey);
      this.logger.log(`验证码验证通过: ${captchaId}`);
      return true;
    } catch (error) {
      this.logger.error('验证码验证异常:', error);
      return false;
    }
  }

  /**
   * 检查验证码是否需要
   * 通过系统配置判断
   */
  async isCaptchaRequired(): Promise<boolean> {
    const enabled = await this.cache.get<number>('login:captcha:enabled');
    return enabled === 1;
  }

  /**
   * 清理过期验证码
   */
  async cleanupExpired(): Promise<void> {
    const keys = await this.cache.keys('captcha:slider:*');
    const now = Date.now();

    for (const key of keys) {
      const stored = await this.cache.get<{ expireAt: string }>(key);
      if (stored && new Date(stored.expireAt).getTime() < now) {
        await this.cache.del(key);
      }
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 随机选择形状
   */
  private getRandomShape(): string {
    const shapes = ['circle', 'square', 'triangle', 'puzzle'];
    return shapes[Math.floor(Math.random() * shapes.length)];
  }

  /**
   * 生成验证码图片 (Base64格式)
   * 这里使用占位实现，实际需要使用Jimp生成真实图片
   */
  private async generateCaptchaImages(
    shape: string,
    y: number,
  ): Promise<{ background: string; slider: string }> {
    // 这里返回 placeholder，实际应该生成真实图片
    const Jimp = require('jimp');

    try {
      const width = 310;
      const height = 155;
      const blockSize = 40;

      // 1. 创建背景图
      const background = new Jimp(width, height, 0xe0e0e0);
      this.addBackgroundPatterns(background, width, height);

      // 2. 创建滑块
      const slider = new Jimp(blockSize + 4, blockSize + 4, 0x00000000);
      this.drawBlockByShape(slider, shape);

      // 3. 从背景图裁剪对应区域
      const blockImage = background.clone().crop(0, y, blockSize, blockSize);
      slider.composite(blockImage, 2, 2);

      // 4. 转换为Base64
      const backgroundBase64 = await this.imageToBase64(background);
      const sliderBase64 = await this.imageToBase64(slider);

      return {
        background: backgroundBase64,
        slider: sliderBase64,
      };
    } catch (error) {
      // 出错时返回占位图片
      return {
        background:
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzEwIiBoZWlnaHQ9IjE1NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTBlMGUwIi8+PC9zdmc+',
        slider:
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDQiIGhlaWdodD0iNDQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iNSIgZmlsbD0iIzRhOTBlZiIvPjwvc3ZnPg==',
      };
    }
  }

  /**
   * 添加背景装饰图案
   */
  private addBackgroundPatterns(image: any, width: number, height: number) {
    const colors = [0xcccccc, 0xdddddd, 0xeeeeee, 0xbbbbbb];

    for (let i = 0; i < 8; i++) {
      const size = Math.floor(Math.random() * 30) + 10;
      const x = Math.floor(Math.random() * (width - size - 50)) + 25;
      const y = Math.floor(Math.random() * (height - size));
      const color = colors[Math.floor(Math.random() * colors.length)];

      image.circle(x + size / 2, y + size / 2, size / 2, color);
    }
  }

  /**
   * 根据形状绘制滑块
   */
  private drawBlockByShape(slider: any, shape: string) {
    const size = slider.getWidth();
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 2;

    // 填充黑色背景
    slider.background(0x000000);

    switch (shape) {
      case 'circle':
        slider.circle(centerX, centerY, radius, 0x00000000);
        slider.circle(centerX, centerY, radius - 6, 0x4a90ef);
        slider.circle(centerX, centerY, 4, 0xffffff);
        break;

      case 'square':
        slider.circle(centerX, centerY, radius, 0x00000000);
        slider.circle(centerX, centerY, 4, 0xffffff);
        break;

      case 'triangle':
        slider.circle(centerX, centerY, radius, 0x00000000);
        slider.circle(centerX, centerY, 4, 0xffffff);
        break;

      case 'puzzle':
        slider.circle(centerX, centerY, radius - 2, 0x00000000);
        slider.circle(centerX, centerY - 15, 6, 0x00000000);
        slider.circle(centerX, centerY + 15, 6, 0x00000000);
        slider.circle(centerX, centerY, 4, 0xffffff);
        break;
    }
  }

  /**
   * 图片转Base64
   */
  private async imageToBase64(image: any): Promise<string> {
    const mime = image.getMIME();
    const buffer = await image.getBufferAsync(mime);
    const base64 = buffer.toString('base64');
    return `data:${mime};base64,${base64}`;
  }
}
