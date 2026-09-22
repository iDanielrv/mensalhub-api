import { describe, expect, it } from 'vitest';
import type { Responsavel } from '@prisma/client';
import { toResponsavelResponse } from './responsavel.response.js';

const responsavelDoBanco: Responsavel = {
  id: 'r-1',
  organizacaoId: 'org-1',
  nome: 'Ana',
  cpf: '12345678900',
  email: 'ana@x.com',
  telefone: '11999999999',
  endereco: 'Rua X, 123',
  createdAt: new Date('2026-09-01'),
  updatedAt: new Date('2026-09-02'),
};

describe('toResponsavelResponse', () => {
  it('expõe só os campos consumidos e esconde internos/não usados', () => {
    const dto = toResponsavelResponse(responsavelDoBanco) as unknown as Record<
      string,
      unknown
    >;
    expect(Object.keys(dto).sort()).toEqual(
      ['cpf', 'email', 'id', 'nome', 'telefone'].sort(),
    );
    expect(dto.organizacaoId).toBeUndefined();
    expect(dto.endereco).toBeUndefined();
    expect(dto.updatedAt).toBeUndefined();
  });
});
