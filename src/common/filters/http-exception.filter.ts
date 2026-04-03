import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ErrorCode } from '../constants';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    let code: number;
    let message: string;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      code = exceptionResponse.code || status;
      message = exceptionResponse.message || exception.message;
    } else {
      code = status;
      message = exceptionResponse as string;
    }

    this.logger.warn(
      `HTTP Error: ${status} ${request.method} ${request.url} - ${message}`,
    );

    response.status(status).json({
      code,
      message: Array.isArray(message) ? message.join(', ') : message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
