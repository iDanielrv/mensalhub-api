import type { Mensalidade } from '@prisma/client';

// A mensalidade vem com o nome do aluno e do curso (via matrícula).
type MensalidadeComMatricula = Mensalidade & {
  matricula: { aluno: { nome: string }; curso: { nome: string } };
};

// Saída da Mensalidade exposta pela API. valor sai como string (Decimal), como o
// front consome. Fora: organizacaoId, matriculaId, createdAt, updatedAt.
export interface MensalidadeResponse {
  id: string;
  competencia: Date;
  vencimento: Date;
  valor: string;
  status: Mensalidade['status'];
  matricula: { aluno: { nome: string }; curso: { nome: string } };
}

export function toMensalidadeResponse(
  m: MensalidadeComMatricula,
): MensalidadeResponse {
  return {
    id: m.id,
    competencia: m.competencia,
    vencimento: m.vencimento,
    valor: m.valor.toString(),
    status: m.status,
    matricula: {
      aluno: { nome: m.matricula.aluno.nome },
      curso: { nome: m.matricula.curso.nome },
    },
  };
}
