import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule, ObserveInstrument } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  const config = app.get(ConfigService);

  // Todas as rotas sob /api
  app.setGlobalPrefix('api');

  // Cabeçalhos de segurança
  app.use(helmet());

  // CORS restrito à origem do front (nunca "*")
  app.enableCors({
    origin: config.getOrThrow<string>('CORS_ORIGIN'),
    credentials: true,
  });

  // Validação global: só aceita campos declarados nos DTOs (anti mass-assignment)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtros globais de erro. A ordem importa: o NestJS usa o primeiro filtro
  // cujo @Catch casa, então o do Prisma (específico) vem antes do catch-all.
  app.useGlobalFilters(
    new PrismaExceptionFilter(),
    new AllExceptionsFilter(),
  );

  const port = config.getOrThrow<number>('PORT');
  await app.listen(port);
}
await bootstrap();
