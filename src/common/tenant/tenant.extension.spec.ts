import { describe, expect, it } from 'vitest';
import { applyTenantScope } from './tenant.extension.js';
import { TenantContext } from './tenant-context.service.js';

const ORG = 'org-1';

describe('applyTenantScope', () => {
  it('injeta organizacaoId no where de um findMany', () => {
    const args: Record<string, unknown> = { where: { status: 'ATIVA' } };
    applyTenantScope({ organizacaoId: ORG }, 'Matricula', 'findMany', args);
    expect(args.where).toEqual({ status: 'ATIVA', organizacaoId: ORG });
  });

  it('cria o where quando a consulta não tinha nenhum', () => {
    const args: Record<string, unknown> = {};
    applyTenantScope({ organizacaoId: ORG }, 'Aluno', 'count', args);
    expect(args.where).toEqual({ organizacaoId: ORG });
  });

  it('injeta organizacaoId no data de um create', () => {
    const args: Record<string, unknown> = { data: { nome: 'João' } };
    applyTenantScope({ organizacaoId: ORG }, 'Aluno', 'create', args);
    expect(args.data).toEqual({ nome: 'João', organizacaoId: ORG });
  });

  it('injeta organizacaoId em cada item de um createMany', () => {
    const args: Record<string, unknown> = { data: [{ a: 1 }, { a: 2 }] };
    applyTenantScope({ organizacaoId: ORG }, 'Mensalidade', 'createMany', args);
    expect(args.data).toEqual([
      { a: 1, organizacaoId: ORG },
      { a: 2, organizacaoId: ORG },
    ]);
  });

  it('escopa where e create num upsert', () => {
    const args: Record<string, unknown> = {
      where: { id: 'x' },
      create: { nome: 'y' },
      update: { nome: 'z' },
    };
    applyTenantScope({ organizacaoId: ORG }, 'Curso', 'upsert', args);
    expect(args.where).toEqual({ id: 'x', organizacaoId: ORG });
    expect(args.create).toEqual({ nome: 'y', organizacaoId: ORG });
  });

  it('escopa update por id com organizacaoId (extendedWhereUnique)', () => {
    const args: Record<string, unknown> = { where: { id: 'x' }, data: {} };
    applyTenantScope({ organizacaoId: ORG }, 'Aluno', 'update', args);
    expect(args.where).toEqual({ id: 'x', organizacaoId: ORG });
  });

  it('FALHA (fail-closed) em modelo de tenant sem contexto de org', () => {
    const args: Record<string, unknown> = { where: {} };
    expect(() =>
      applyTenantScope(undefined, 'Matricula', 'findMany', args),
    ).toThrow(/sem contexto de organização/);
  });

  it('NÃO toca em modelos fora do tenant (ex.: Organizacao)', () => {
    const args: Record<string, unknown> = { where: { id: 'x' } };
    applyTenantScope(undefined, 'Organizacao', 'findFirst', args);
    expect(args.where).toEqual({ id: 'x' });
  });

  it('faz bypass quando o store está marcado como crossTenant', () => {
    const args: Record<string, unknown> = { where: { status: 'ATIVA' } };
    applyTenantScope({ crossTenant: true }, 'Matricula', 'findMany', args);
    expect(args.where).toEqual({ status: 'ATIVA' });
  });
});

describe('TenantContext', () => {
  it('run() disponibiliza a org só dentro do escopo', () => {
    const ctx = new TenantContext();
    expect(ctx.store).toBeUndefined();
    ctx.run({ organizacaoId: ORG }, () => {
      expect(ctx.store?.organizacaoId).toBe(ORG);
    });
    expect(ctx.store).toBeUndefined();
  });

  it('propaga o contexto através de awaits (AsyncLocalStorage)', async () => {
    const ctx = new TenantContext();
    await ctx.run({ organizacaoId: ORG }, async () => {
      await Promise.resolve();
      expect(ctx.store?.organizacaoId).toBe(ORG);
    });
  });

  it('runCrossTenant() marca o store como crossTenant', async () => {
    const ctx = new TenantContext();
    await ctx.runCrossTenant(async () => {
      expect(ctx.store?.crossTenant).toBe(true);
      expect(ctx.store?.organizacaoId).toBeUndefined();
    });
  });
});
