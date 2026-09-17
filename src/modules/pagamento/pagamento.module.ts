import { Module } from '@nestjs/common';
import { PagamentoController } from './pagamento.controller.js';
import { PagamentoRepository } from './pagamento.repository.js';
import { PagamentoService } from './pagamento.service.js';

@Module({
  controllers: [PagamentoController],
  providers: [PagamentoService, PagamentoRepository],
})
export class PagamentoModule {}
