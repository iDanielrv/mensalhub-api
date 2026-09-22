import type { Matricula } from '@prisma/client';

// A matrícula vem do repositório sempre com os nomes do aluno e do curso.
type MatriculaComNomes = Matricula & {
  aluno: { nome: string };
  curso: { nome: string };
};

// Saída da Matrícula exposta pela API. valor sai como string|null (Decimal),
// como o front consome. Fora: organizacaoId, createdAt, updatedAt.
export interface MatriculaResponse {
  id: string;
  alunoId: string;
  cursoId: string;
  aluno: { nome: string };
  curso: { nome: string };
  inicio: Date;
  fim: Date | null;
  diaVencimento: number;
  valor: string | null;
  status: Matricula['status'];
}

export function toMatriculaResponse(m: MatriculaComNomes): MatriculaResponse {
  return {
    id: m.id,
    alunoId: m.alunoId,
    cursoId: m.cursoId,
    aluno: { nome: m.aluno.nome },
    curso: { nome: m.curso.nome },
    inicio: m.inicio,
    fim: m.fim,
    diaVencimento: m.diaVencimento,
    valor: m.valor?.toString() ?? null,
    status: m.status,
  };
}
