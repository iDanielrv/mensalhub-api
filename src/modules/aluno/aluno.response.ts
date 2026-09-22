import type { Aluno } from '@prisma/client';

// Formato do Aluno exposto pela API (deny-by-default): declara SÓ o que o cliente
// consome. Campos internos como organizacaoId e updatedAt ficam de fora — se um
// dia precisarem ser expostos, é uma linha aqui; nunca vazam por acidente.
export interface AlunoResponse {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  createdAt: Date;
}

export function toAlunoResponse(a: Aluno): AlunoResponse {
  return {
    id: a.id,
    nome: a.nome,
    telefone: a.telefone,
    email: a.email,
    createdAt: a.createdAt,
  };
}
