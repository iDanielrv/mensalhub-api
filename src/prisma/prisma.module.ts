import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { TenantContext } from '../common/tenant/tenant-context.service.js';
import {
  TENANT_PRISMA,
  extendForTenant,
} from '../common/tenant/tenant.extension.js';

// @Global: qualquer módulo injeta TENANT_PRISMA / TenantContext sem reimportar.
// Os repositórios usam TENANT_PRISMA (client já com isolamento de tenant); o
// PrismaService cru fica interno, só para gerenciar a conexão e construir a extensão.
@Global()
@Module({
  providers: [
    TenantContext,
    PrismaService,
    {
      provide: TENANT_PRISMA,
      useFactory: (base: PrismaService, tenant: TenantContext) =>
        extendForTenant(base, tenant),
      inject: [PrismaService, TenantContext],
    },
  ],
  exports: [TENANT_PRISMA, TenantContext],
})
export class PrismaModule {}
