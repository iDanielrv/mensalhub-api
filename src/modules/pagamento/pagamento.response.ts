import type { Pagamento } from '@prisma/client';

// Saída do Pagamento exposta pela API. valor sai como string (Decimal).
// Fora: organizacaoId, createdAt.
export interface PagamentoResponse {
  id: string;
  mensalidadeId: string;
  valor: string;
  metodo: Pagamento['metodo'];
  data: Date;
}

export function toPagamentoResponse(p: Pagamento): PagamentoResponse {
  return {
    id: p.id,
    mensalidadeId: p.mensalidadeId,
    valor: p.valor.toString(),
    metodo: p.metodo,
    data: p.data,
  };
}
