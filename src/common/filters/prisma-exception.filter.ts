import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Prisma } from '@prisma/client';
import { ErrorCode } from '../constants';

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientRustPanicError,
  Prisma.PrismaClientInitializationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError | Error,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let code = ErrorCode.DATABASE_ERROR as number;
    let message = '数据库操作失败';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = exception as Prisma.PrismaClientKnownRequestError;
      this.logger.warn(
        `Prisma Error ${prismaError.code}: ${prismaError.message}`,
      );

      switch (prismaError.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          code = ErrorCode.DUPLICATE_ENTRY;
          message = this.getUniqueFieldMessage(prismaError);
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          code = ErrorCode.RECORD_NOT_FOUND;
          message = '记录不存在';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          code = ErrorCode.INVALID_OPERATION;
          message = '关联数据不存在';
          break;
        case 'P2014':
          status = HttpStatus.BAD_REQUEST;
          code = ErrorCode.INVALID_OPERATION;
          message = '关联数据冲突';
          break;
        case 'P2001':
          status = HttpStatus.NOT_FOUND;
          code = ErrorCode.RECORD_NOT_FOUND;
          message = '记录不存在';
          break;
        default:
          message = `数据库错误: ${prismaError.code}`;
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      this.logger.warn(`Prisma Validation Error: ${exception.message}`);
      status = HttpStatus.BAD_REQUEST;
      code = ErrorCode.VALIDATION_ERROR;
      message = '数据验证失败';
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      this.logger.error(`Prisma Init Error: ${exception.message}`);
      message = '数据库连接失败';
    } else if (exception instanceof Error) {
      this.logger.error(`Prisma Unknown Error: ${exception.message}`);
      message = '数据库操作异常';
    }

    response.status(status).json({
      code,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private getUniqueFieldMessage(
    error: Prisma.PrismaClientKnownRequestError,
  ): string {
    const meta = error.meta as { target?: string[] } | undefined;
    if (meta?.target) {
      return `${meta.target.join(', ')} 已存在`;
    }
    return '记录已存在';
  }
}
