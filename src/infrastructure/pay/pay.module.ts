import { Module } from '@nestjs/common';

import { PayService } from './pay.service';
import { CacheModule } from '@/infrastructure/cache/cache.module';

/**
 * 支付模块
 *
 * @description
 * 支付模块，提供统一的支付服务：
 * - 支付宝支付
 * - 微信支付
 * - 银联支付
 */
@Module({
  providers: [PayService],
  exports: [PayService],
  imports: [CacheModule],
})
export class PayModule {}
