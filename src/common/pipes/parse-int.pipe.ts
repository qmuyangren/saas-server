import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ErrorCode } from '../constants';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_ERROR,
        message: `参数 ${metadata.data} 必须是有效的整数`,
      });
    }
    return val;
  }
}
