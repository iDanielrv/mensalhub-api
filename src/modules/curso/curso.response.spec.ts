import { describe, expect, it } from 'vitest';
import { Prisma, type Curso } from '@prisma/client';
import { toCursoResponse } from './curso.response.js';

const cursoDoBanco: Curso = {
  id: 'c-1',
  organizacaoId: 'org-1',
  nome: 'Violão',
  valorMensalidade: new Prisma.Decimal('150.00'),
  ativo: true,
  createdAt: new Date('2026-09-01'),
  updatedAt: new Date('2026-09-02'),
};

describe('toCursoResponse', () => {
  it('expõe só os campos consumidos e esconde os internos', () => {
    const dto = toCursoResponse(cursoDoBanco) as unknown as Record<
      string,
      unknown
    >;
    expect(Object.keys(dto).sort()).toEqual(
      ['ativo', 'id', 'nome', 'valorMensalidade'].sort(),
    );
    expect(dto.organizacaoId).toBeUndefined();
    expect(dto.updatedAt).toBeUndefined();
  });

  it('serializa valorMensalidade como string numérica', () => {
    const dto = toCursoResponse(cursoDoBanco);
    expect(typeof dto.valorMensalidade).toBe('string');
    expect(Number(dto.valorMensalidade)).toBe(150);
  });
});
