import { Prisma, PrismaClient } from '@prisma/client';
import type { TenantContext, TenantStore } from './tenant-context.service.js';

// Token de injeção do client Prisma já estendido (com isolamento de tenant).
// Os repositórios injetam ISSO, e não o PrismaClient cru — assim não existe
// delegate sem escopo para alguém esquecer de filtrar.
export const TENANT_PRISMA = Symbol('TENANT_PRISMA');

// Modelos que pertencem a uma organização. "Organizacao" fica de fora: ela É o
// tenant. Precisa bater exatamente com os nomes de model do schema.prisma.
const TENANT_MODELS = new Set<string>([
  'Usuario',
  'Responsavel',
  'Aluno',
  'Curso',
  'Matricula',
  'Mensalidade',
  'Pagamento',
  'NotaFiscal',
]);

// Injeta organizacaoId no lugar certo conforme a operação. Reads e writes por
// filtro entram no `where`; creates entram no `data`.
function scopeArgs(
  operation: string,
  args: Record<string, unknown>,
  organizacaoId: string,
): void {
  switch (operation) {
    case 'create':
      args.data = { ...(args.data as object), organizacaoId };
      break;
    case 'createMany':
    case 'createManyAndReturn':
      args.data = Array.isArray(args.data)
        ? args.data.map((d) => ({ ...(d as object), organizacaoId }))
        : { ...(args.data as object), organizacaoId };
      break;
    case 'upsert':
      args.where = { ...(args.where as object), organizacaoId };
      args.create = { ...(args.create as object), organizacaoId };
      break;
    default:
      // find*, update*, delete*, count, aggregate, groupBy → filtra por org.
      // Em update/delete o id continua sendo a chave; organizacaoId é filtro
      // extra (extendedWhereUnique), então acesso cruzado vira "não encontrado".
      args.where = { ...(args.where as object), organizacaoId };
  }
}

// Núcleo (puro e testável) da regra de isolamento. Decide, a partir do store
// atual, se a operação passa direto, é filtrada por org, ou deve falhar.
// Fail-closed: consulta a modelo de tenant sem contexto de organização (e sem
// bypass explícito) lança erro, em vez de vazar dados de outros clientes.
export function applyTenantScope(
  store: TenantStore | undefined,
  model: string | undefined,
  operation: string,
  args: Record<string, unknown>,
): void {
  if (!model || !TENANT_MODELS.has(model)) {
    return;
  }
  if (store?.crossTenant) {
    return;
  }

  const organizacaoId = store?.organizacaoId;
  if (!organizacaoId) {
    throw new Error(
      `Consulta a "${model}.${operation}" sem contexto de organização. ` +
        'Requisições autenticadas definem a org automaticamente; fluxos ' +
        'de sistema devem usar TenantContext.runCrossTenant().',
    );
  }

  scopeArgs(operation, args, organizacaoId);
}

// Extensão de isolamento multi-tenant aplicada ao PrismaClient.
export function tenantExtension(tenant: TenantContext) {
  return Prisma.defineExtension({
    name: 'tenant-isolation',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          applyTenantScope(
            tenant.store,
            model,
            operation,
            args as Record<string, unknown>,
          );
          return query(args);
        },
      },
    },
  });
}

// Aplica a extensão a um client base. Exposto também para inferência de tipo.
export function extendForTenant(client: PrismaClient, tenant: TenantContext) {
  return client.$extends(tenantExtension(tenant));
}

// Tipo do client estendido, usado pelos repositórios ao injetar TENANT_PRISMA.
export type TenantPrismaClient = ReturnType<typeof extendForTenant>;
