import { describe, expect, it } from 'vitest';
import { Prisma, type Matricula } from '@prisma/client';
import { toMatriculaResponse } from './matricula.response.js';

const matriculaDoBanco = {
  id: 'm-1',
  organizacaoId: 'org-1',
  alunoId: 'a-1',
  cursoId: 'c-1',
  inicio: new Date('2026-09-01'),
  fim: null,
  diaVencimento: 10,
  valor: new Prisma.Decimal('150.00'),
  status: 'ATIVA',
  createdAt: new Date('2026-09-01'),
  updatedAt: new Date('2026-09-02'),
  aluno: { nome: 'João' },
  curso: { nome: 'Violão' },
} satisfies Matricula & { aluno: { nome: string }; curso: { nome: string } };

describe('toMatriculaResponse', () => {
  it('esconde campos internos (organizacaoId, createdAt, updatedAt)', () => {
    const dto = toMatriculaResponse(matriculaDoBanco) as unknown as Record<
      string,
      unknown
    >;
    expect(dto.organizacaoId).toBeUndefined();
    expect(dto.createdAt).toBeUndefined();
    expect(dto.updatedAt).toBeUndefined();
  });

  it('traz os nomes de aluno e curso e valor como string', () => {
    const dto = toMatriculaResponse(matriculaDoBanco);
    expect(dto.aluno).toEqual({ nome: 'João' });
    expect(dto.curso).toEqual({ nome: 'Violão' });
    expect(typeof dto.valor).toBe('string');
    expect(Number(dto.valor)).toBe(150);
  });

  it('mantém valor null quando a matrícula não tem valor', () => {
    const dto = toMatriculaResponse({ ...matriculaDoBanco, valor: null });
    expect(dto.valor).toBeNull();
  });
});
