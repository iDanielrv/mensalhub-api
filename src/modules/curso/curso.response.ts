import type { Curso } from '@prisma/client';

// Saída do Curso exposta pela API. valorMensalidade sai como string (Decimal),
// como o front consome hoje. Fora: organizacaoId, createdAt, updatedAt.
export interface CursoResponse {
  id: string;
  nome: string;
  valorMensalidade: string;
  ativo: boolean;
}

export function toCursoResponse(c: Curso): CursoResponse {
  return {
    id: c.id,
    nome: c.nome,
    valorMensalidade: c.valorMensalidade.toString(),
    ativo: c.ativo,
  };
}
