import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { validateEnv } from './config/env.validation.js';
import { AlunoModule } from './modules/aluno/aluno.module.js';
import { CursoModule } from './modules/curso/curso.module.js';
import { MatriculaModule } from './modules/matricula/matricula.module.js';
import { MensalidadeModule } from './modules/mensalidade/mensalidade.module.js';
import { PagamentoModule } from './modules/pagamento/pagamento.module.js';
import { ResponsavelModule } from './modules/responsavel/responsavel.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Config global + validação do .env no boot (falha cedo se faltar var).
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'api',
    }),
    // Habilita @Cron para a geração automática de mensalidades (dia 1 do mês).
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    AlunoModule,
    CursoModule,
    MatriculaModule,
    MensalidadeModule,
    PagamentoModule,
    ResponsavelModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guard global: toda rota exige JWT, exceto as marcadas com @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
