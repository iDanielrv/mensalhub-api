import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  // Prisma 7 exige um driver adapter. A connection string vem do ConfigService
  // (já validado no boot), garantindo que o .env esteja carregado.
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.getOrThrow<string>('DATABASE_URL'),
      }),
      // Segurança estrutural: o hash de senha NUNCA sai do banco por padrão.
      // Nenhuma query o retorna, a menos que peça explicitamente com
      // `omit: { senhaHash: false }` (só o login precisa, p/ conferir a senha).
      // Garante que futuros endpoints (ex.: tela de admin de usuários) não
      // vazem o hash mesmo que esqueçam de mapear a resposta.
      omit: {
        usuario: { senhaHash: true },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Conectado ao banco de dados');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
