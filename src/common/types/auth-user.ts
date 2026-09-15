import type { UserRole } from '@prisma/client';

// Usuário autenticado, extraído do JWT e anexado ao request.
export interface AuthUser {
  id: string;
  organizacaoId: string;
  email: string;
  role: UserRole;
}
