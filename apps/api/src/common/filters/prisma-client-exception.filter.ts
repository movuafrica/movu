import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.mapStatus(exception);
    const message = this.mapMessage(exception, request.url);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private mapStatus(exception: Prisma.PrismaClientKnownRequestError): number {
    if (exception.code === 'P2025') {
      return HttpStatus.NOT_FOUND;
    }

    return HttpStatus.BAD_REQUEST;
  }

  private mapMessage(
    exception: Prisma.PrismaClientKnownRequestError,
    path: string,
  ): string {
    if (exception.code === 'P2025') {
      return `Resource not found for ${path}`;
    }

    return 'Request could not be processed';
  }
}
