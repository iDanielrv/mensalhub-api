import type { UserRole } from '@prisma/client';

// Conteúdo do JWT (access e refresh usam o mesmo formato de payload).
export interface JwtPayload {
  sub: string; // id do usuário
  organizacaoId: string;
  email: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
