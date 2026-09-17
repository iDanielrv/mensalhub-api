import { BadRequestException, Injectable } from '@nestjs/common';
import { PagamentoRepository } from './pagamento.repository.js';
import type { CreatePagamentoDto } from './dto/create-pagamento.dto.js';

@Injectable()
export class PagamentoService {
  constructor(private readonly pagamentos: PagamentoRepository) {}

  async create(organizacaoId: string, dto: CreatePagamentoDto) {
    const mensalidade = await this.pagamentos.findMensalidade(
      organizacaoId,
      dto.mensalidadeId,
    );
    if (!mensalidade) {
      throw new BadRequestException('Mensalidade não encontrada nesta organização');
    }
    if (mensalidade.status === 'PAGA') {
      throw new BadRequestException('Mensalidade já está paga');
    }
    if (mensalidade.status === 'CANCELADA') {
      throw new BadRequestException('Mensalidade cancelada não pode ser paga');
    }

    return this.pagamentos.criarComBaixa({
      organizacaoId,
      mensalidadeId: dto.mensalidadeId,
      valor: dto.valor,
      metodo: dto.metodo,
      data: dto.data ? new Date(dto.data) : new Date(),
    });
  }
}
