import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

// Contexto por requisição/execução. Guarda a organização (tenant) atual, de forma
// que a extensão do Prisma consiga isolar os dados sem que cada repositório
// precise lembrar de filtrar por organizacaoId.
export interface TenantStore {
  organizacaoId?: string;
  // Marca uma execução legitimamente cross-tenant (login, jobs de sistema),
  // na qual a extensão do Prisma não deve injetar/filtrar por organização.
  crossTenant?: boolean;
}

@Injectable()
export class TenantContext {
  private readonly als = new AsyncLocalStorage<TenantStore>();

  // Executa `fn` com o store informado ativo durante toda a cadeia assíncrona.
  run<T>(store: TenantStore, fn: () => T): T {
    return this.als.run(store, fn);
  }

  // Ignora o escopo de tenant. Use SOMENTE em fluxos que são cross-tenant por
  // natureza: login (ainda não se sabe a org) e jobs de sistema (cron).
  // O `await` DENTRO do run() é essencial: promises do Prisma são lazy, então
  // sem ele a consulta só executaria depois que o contexto já tivesse saído.
  runCrossTenant<T>(fn: () => Promise<T>): Promise<T> {
    return this.als.run({ crossTenant: true }, async () => await fn());
  }

  get store(): TenantStore | undefined {
    return this.als.getStore();
  }
}
