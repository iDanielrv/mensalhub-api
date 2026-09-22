import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

// Rede de segurança: qualquer erro não tratado vira um 500 limpo, sem vazar
// stack trace nem detalhes internos para o cliente. As HttpException nativas
// do NestJS são repassadas com seu status/corpo originais. O detalhe real do
// erro fica apenas no log do servidor.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Erros HTTP intencionais (NotFound, BadRequest, etc.) passam direto.
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json(exception.getResponse());
      return;
    }

    // Qualquer outra coisa é um erro inesperado: loga o detalhe e responde 500.
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    this.logger.error(
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(status).json({
      statusCode: status,
      message: 'Erro interno do servidor',
      error: HttpStatus[status],
    });
  }
}
