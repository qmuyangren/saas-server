import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ErrorCode } from '../constants';

@Injectable()
export class ErrorHandler {
  badRequest(code: number, message: string): never {
    throw new BadRequestException({ code, message });
  }

  notFound(code: number, message: string): never {
    throw new NotFoundException({ code, message });
  }

  forbidden(code: number, message: string): never {
    throw new ForbiddenException({ code, message });
  }

  duplicateEntry(message = '记录已存在'): never {
    throw new BadRequestException({ code: ErrorCode.DUPLICATE_ENTRY, message });
  }

  recordNotFound(message = '记录不存在'): never {
    throw new NotFoundException({ code: ErrorCode.RECORD_NOT_FOUND, message });
  }

  hasRelatedData(message = '存在关联数据，无法操作'): never {
    throw new BadRequestException({
      code: ErrorCode.HAS_RELATED_DATA,
      message,
    });
  }

  unauthorized(message = '未授权'): never {
    throw new BadRequestException({ code: ErrorCode.UNAUTHORIZED, message });
  }

  validationError(message = '参数校验失败'): never {
    throw new BadRequestException({
      code: ErrorCode.VALIDATION_ERROR,
      message,
    });
  }
}
