import { Inject, Injectable } from '@nestjs/common';
import { MetodoPagamento, MensalidadeStatus } from '@prisma/client';
import {
  TENANT_PRISMA,
  type TenantPrismaClient,
} from '../../common/tenant/tenant.extension.js';

@Injectable()
export class PagamentoRepository {
  constructor(
    @Inject(TENANT_PRISMA) private readonly prisma: TenantPrismaClient,
  ) {}

  findMensalidade(organizacaoId: string, mensalidadeId: string) {
    return this.prisma.mensalidade.findFirst({
      where: { id: mensalidadeId, organizacaoId },
    });
  }

  // Cria o pagamento e marca a mensalidade como PAGA em uma transação.
  criarComBaixa(args: {
    organizacaoId: string;
    mensalidadeId: string;
    valor: number;
    metodo: MetodoPagamento;
    data: Date;
  }) {
    return this.prisma.$transaction([
      this.prisma.pagamento.create({
        data: {
          organizacaoId: args.organizacaoId,
          mensalidadeId: args.mensalidadeId,
          valor: args.valor,
          metodo: args.metodo,
          data: args.data,
        },
      }),
      this.prisma.mensalidade.update({
        where: { id: args.mensalidadeId },
        data: { status: MensalidadeStatus.PAGA },
      }),
    ]);
  }
}
