import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

// Traduz erros conhecidos do Prisma em respostas HTTP adequadas, evitando que
// eles vazem como 500 com detalhes internos do banco (nomes de tabela/coluna).
// Só os códigos mais comuns são mapeados; o resto cai no fallback 500 limpo.
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro ao processar a requisição';

    switch (exception.code) {
      // Violação de constraint única (ex.: CPF/email já cadastrado).
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const alvo = (exception.meta?.target as string[] | undefined)?.join(
          ', ',
        );
        message = alvo
          ? `Já existe um registro com esse valor: ${alvo}`
          : 'Já existe um registro com esse valor';
        break;
      }
      // Registro esperado não encontrado (ex.: update/delete de id inexistente).
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Registro não encontrado';
        break;
      // Violação de chave estrangeira.
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'Operação viola uma referência existente';
        break;
    }

    // Log com o detalhe real do Prisma; o cliente recebe só a mensagem tratada.
    this.logger.warn(
      `Prisma ${exception.code}: ${exception.message.replace(/\n/g, ' ')}`,
    );

    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status],
    });
  }
}
