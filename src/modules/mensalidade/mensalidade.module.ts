import { Module } from '@nestjs/common';
import { MensalidadeController } from './mensalidade.controller.js';
import { MensalidadeRepository } from './mensalidade.repository.js';
import { MensalidadeService } from './mensalidade.service.js';

@Module({
  controllers: [MensalidadeController],
  providers: [MensalidadeService, MensalidadeRepository],
})
export class MensalidadeModule {}
