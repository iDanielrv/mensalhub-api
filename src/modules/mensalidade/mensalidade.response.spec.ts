import { describe, expect, it } from 'vitest';
import { Prisma, type Mensalidade } from '@prisma/client';
import { toMensalidadeResponse } from './mensalidade.response.js';

const mensalidadeDoBanco = {
  id: 'men-1',
  organizacaoId: 'org-1',
  matriculaId: 'm-1',
  competencia: new Date('2026-09-01'),
  vencimento: new Date('2026-09-10'),
  valor: new Prisma.Decimal('150.00'),
  status: 'ABERTA',
  createdAt: new Date('2026-09-01'),
  updatedAt: new Date('2026-09-02'),
  matricula: { aluno: { nome: 'João' }, curso: { nome: 'Violão' } },
} satisfies Mensalidade & {
  matricula: { aluno: { nome: string }; curso: { nome: string } };
};

describe('toMensalidadeResponse', () => {
  it('esconde campos internos (organizacaoId, matriculaId, timestamps)', () => {
    const dto = toMensalidadeResponse(mensalidadeDoBanco) as unknown as Record<
      string,
      unknown
    >;
    expect(dto.organizacaoId).toBeUndefined();
    expect(dto.matriculaId).toBeUndefined();
    expect(dto.createdAt).toBeUndefined();
    expect(dto.updatedAt).toBeUndefined();
  });

  it('traz nomes via matrícula e valor como string', () => {
    const dto = toMensalidadeResponse(mensalidadeDoBanco);
    expect(dto.matricula.aluno.nome).toBe('João');
    expect(dto.matricula.curso.nome).toBe('Violão');
    expect(typeof dto.valor).toBe('string');
    expect(Number(dto.valor)).toBe(150);
  });
});
