/**
 * 滑块验证码验证结果
 */
export interface SliderCaptchaVerifyResult {
  /**
   * Y轴位置
   */
  y: number;

  /**
   * 验证时间（毫秒）
   */
  t: number;

  /**
   * 拖动轨迹
   */
  track: Array<{ x: number; y: number; t: number }>;
}

/**
 * 验证码形状
 */
export type CaptchaShape = 'circle' | 'square' | 'triangle' | 'puzzle';

/**
 * 滑块验证码响应
 */
export interface SliderCaptchaResponse {
  /**
   * 验证码ID
   */
  captchaId: string;

  /**
   * Y轴位置
   */
  y: number;

  /**
   * 正确X轴位置
   */
  correctX: number;

  /**
   * 验证码形状
   */
  shape: CaptchaShape;

  /**
   * 背景图片Base64
   */
  backgroundImage: string;

  /**
   * 滑块图片Base64
   */
  sliderImage: string;

  /**
   * 图片宽度
   */
  width: number;

  /**
   * 图片高度
   */
  height: number;

  /**
   * 滑块大小
   */
  blockSize: number;
}
