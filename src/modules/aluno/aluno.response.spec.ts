import { describe, expect, it } from 'vitest';
import type { Aluno } from '@prisma/client';
import { toAlunoResponse } from './aluno.response.js';

// Entidade completa como vem do banco (inclui campos internos).
const alunoDoBanco: Aluno = {
  id: 'a-1',
  organizacaoId: 'org-1',
  responsavelId: 'r-1',
  nome: 'João',
  nascimento: new Date('2015-05-10'),
  telefone: '11999999999',
  email: 'joao@x.com',
  observacoes: 'alguma nota interna',
  createdAt: new Date('2026-09-01T00:00:00Z'),
  updatedAt: new Date('2026-09-02T00:00:00Z'),
};

describe('toAlunoResponse', () => {
  it('expõe apenas os campos consumidos pelo cliente', () => {
    const dto = toAlunoResponse(alunoDoBanco);
    expect(Object.keys(dto).sort()).toEqual(
      ['createdAt', 'email', 'id', 'nome', 'telefone'].sort(),
    );
  });

  it('NÃO vaza campos internos (organizacaoId, updatedAt) nem não usados', () => {
    const dto = toAlunoResponse(alunoDoBanco) as unknown as Record<
      string,
      unknown
    >;
    expect(dto.organizacaoId).toBeUndefined();
    expect(dto.updatedAt).toBeUndefined();
    expect(dto.responsavelId).toBeUndefined();
    expect(dto.observacoes).toBeUndefined();
  });

  it('mantém os valores dos campos expostos', () => {
    const dto = toAlunoResponse(alunoDoBanco);
    expect(dto).toEqual({
      id: 'a-1',
      nome: 'João',
      telefone: '11999999999',
      email: 'joao@x.com',
      createdAt: alunoDoBanco.createdAt,
    });
  });
});
