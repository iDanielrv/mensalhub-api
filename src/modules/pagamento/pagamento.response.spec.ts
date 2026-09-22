import { describe, expect, it } from 'vitest';
import { Prisma, type Pagamento } from '@prisma/client';
import { toPagamentoResponse } from './pagamento.response.js';

const pagamentoDoBanco: Pagamento = {
  id: 'p-1',
  organizacaoId: 'org-1',
  mensalidadeId: 'men-1',
  data: new Date('2026-09-15'),
  valor: new Prisma.Decimal('150.00'),
  metodo: 'PIX',
  createdAt: new Date('2026-09-15'),
};

describe('toPagamentoResponse', () => {
  it('esconde campos internos (organizacaoId, createdAt) e serializa valor', () => {
    const dto = toPagamentoResponse(pagamentoDoBanco) as unknown as Record<
      string,
      unknown
    >;
    expect(Object.keys(dto).sort()).toEqual(
      ['data', 'id', 'mensalidadeId', 'metodo', 'valor'].sort(),
    );
    expect(dto.organizacaoId).toBeUndefined();
    expect(dto.createdAt).toBeUndefined();
    expect(typeof dto.valor).toBe('string');
    expect(Number(dto.valor)).toBe(150);
  });
});
