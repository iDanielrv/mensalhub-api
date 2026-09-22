import type { Responsavel } from '@prisma/client';

// Saída do Responsável exposta pela API. Fora: organizacaoId, endereco (não
// consumido pelo front), createdAt, updatedAt.
export interface ResponsavelResponse {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
}

export function toResponsavelResponse(r: Responsavel): ResponsavelResponse {
  return {
    id: r.id,
    nome: r.nome,
    cpf: r.cpf,
    email: r.email,
    telefone: r.telefone,
  };
}
