import { BadRequestException, Injectable } from '@nestjs/common';
import { PagamentoRepository } from './pagamento.repository.js';
import {
  toPagamentoResponse,
  type PagamentoResponse,
} from './pagamento.response.js';
import type { CreatePagamentoDto } from './dto/create-pagamento.dto.js';

@Injectable()
export class PagamentoService {
  constructor(private readonly pagamentos: PagamentoRepository) {}

  async create(
    organizacaoId: string,
    dto: CreatePagamentoDto,
  ): Promise<PagamentoResponse> {
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

    // criarComBaixa roda numa transação e devolve [pagamento, mensalidade];
    // expomos só o pagamento criado.
    const [pagamento] = await this.pagamentos.criarComBaixa({
      organizacaoId,
      mensalidadeId: dto.mensalidadeId,
      valor: dto.valor,
      metodo: dto.metodo,
      data: dto.data ? new Date(dto.data) : new Date(),
    });
    return toPagamentoResponse(pagamento);
  }
}
