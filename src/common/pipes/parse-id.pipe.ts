import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ErrorCode } from '../constants';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const id = parseInt(value, 10);
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_ERROR,
        message: `参数 ${metadata.data} 必须是有效的正整数ID`,
      });
    }
    return id;
  }
}
