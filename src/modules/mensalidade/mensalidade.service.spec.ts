import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TenantContext } from '../../common/tenant/tenant-context.service.js';
import { MensalidadeService } from './mensalidade.service.js';
import type { MensalidadeRepository } from './mensalidade.repository.js';

describe('MensalidadeService', () => {
  let repo: Record<string, ReturnType<typeof vi.fn>>;
  let tenant: TenantContext;
  let service: MensalidadeService;

  beforeEach(() => {
    repo = {
      gerar: vi.fn().mockResolvedValue({ geradas: 1, total: 1 }),
      gerarTodas: vi.fn().mockResolvedValue({ geradas: 2, total: 3 }),
      findOne: vi.fn(),
      update: vi.fn().mockResolvedValue({ ok: true }),
    };
    tenant = new TenantContext();
    service = new MensalidadeService(
      repo as unknown as MensalidadeRepository,
      tenant,
    );
  });

  describe('gerarMensalidadesDoMes (cron)', () => {
    it('roda a geração como cross-tenant', async () => {
      const spy = vi.spyOn(tenant, 'runCrossTenant');
      await service.gerarMensalidadesDoMes();
      expect(spy).toHaveBeenCalledOnce();
      expect(repo.gerarTodas).toHaveBeenCalledOnce();
    });

    it('não propaga erro (num cron não há quem trate) — apenas registra', async () => {
      repo.gerarTodas.mockRejectedValue(new Error('falha de banco'));
      await expect(service.gerarMensalidadesDoMes()).resolves.toBeUndefined();
    });
  });

  describe('update', () => {
    it('lança NotFound quando a mensalidade não existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(
        service.update('org-1', 'x', { status: 'CANCELADA' } as never),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('atualiza o status quando a mensalidade existe', async () => {
      repo.findOne.mockResolvedValue({ id: 'men-1' });
      await service.update('org-1', 'men-1', { status: 'CANCELADA' } as never);
      expect(repo.update).toHaveBeenCalledWith('men-1', { status: 'CANCELADA' });
    });
  });
});
