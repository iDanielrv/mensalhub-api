import { Inject, Injectable } from '@nestjs/common';
import type { Usuario } from '@prisma/client';
import { TenantContext } from '../../common/tenant/tenant-context.service.js';
import {
  TENANT_PRISMA,
  type TenantPrismaClient,
} from '../../common/tenant/tenant.extension.js';

// Lookups de login/refresh são cross-tenant por natureza: ainda não se sabe a
// organização, então rodam via runCrossTenant, sem o filtro automático da
// extensão de tenant.
@Injectable()
export class UsuarioRepository {
  constructor(
    @Inject(TENANT_PRISMA) private readonly prisma: TenantPrismaClient,
    private readonly tenant: TenantContext,
  ) {}

  // Único ponto que precisa do senhaHash (para o bcrypt.compare do login), então
  // pede explicitamente o campo que o omit global esconde por padrão.
  findByEmail(email: string): Promise<Usuario | null> {
    return this.tenant.runCrossTenant(() =>
      this.prisma.usuario.findUnique({
        where: { email },
        omit: { senhaHash: false },
      }),
    );
  }

  findById(id: string): Promise<Usuario | null> {
    return this.tenant.runCrossTenant(() =>
      this.prisma.usuario.findUnique({ where: { id } }),
    );
  }
}
