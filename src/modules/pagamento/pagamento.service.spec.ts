import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PagamentoService } from './pagamento.service.js';
import type { PagamentoRepository } from './pagamento.repository.js';

const ORG = 'org-1';
const dto = { mensalidadeId: 'men-1', valor: 150, metodo: 'PIX' } as never;

describe('PagamentoService.create', () => {
  let repo: {
    findMensalidade: ReturnType<typeof vi.fn>;
    criarComBaixa: ReturnType<typeof vi.fn>;
  };
  let service: PagamentoService;

  beforeEach(() => {
    repo = {
      findMensalidade: vi.fn(),
      criarComBaixa: vi.fn().mockResolvedValue({ ok: true }),
    };
    service = new PagamentoService(repo as unknown as PagamentoRepository);
  });

  it('recusa quando a mensalidade não existe na organização', async () => {
    repo.findMensalidade.mockResolvedValue(null);
    await expect(service.create(ORG, dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repo.criarComBaixa).not.toHaveBeenCalled();
  });

  it('recusa pagar uma mensalidade já PAGA', async () => {
    repo.findMensalidade.mockResolvedValue({ id: 'men-1', status: 'PAGA' });
    await expect(service.create(ORG, dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repo.criarComBaixa).not.toHaveBeenCalled();
  });

  it('recusa pagar uma mensalidade CANCELADA', async () => {
    repo.findMensalidade.mockResolvedValue({ id: 'men-1', status: 'CANCELADA' });
    await expect(service.create(ORG, dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repo.criarComBaixa).not.toHaveBeenCalled();
  });

  it('dá baixa quando a mensalidade está ABERTA', async () => {
    repo.findMensalidade.mockResolvedValue({ id: 'men-1', status: 'ABERTA' });
    await service.create(ORG, dto);
    expect(repo.criarComBaixa).toHaveBeenCalledOnce();
    const args = repo.criarComBaixa.mock.calls[0][0];
    expect(args.mensalidadeId).toBe('men-1');
    expect(args.valor).toBe(150);
  });

  it('usa a data informada no dto quando presente', async () => {
    repo.findMensalidade.mockResolvedValue({ id: 'men-1', status: 'ATRASADA' });
    await service.create(ORG, {
      mensalidadeId: 'men-1',
      valor: 150,
      metodo: 'PIX',
      data: '2026-09-15',
    } as never);
    const args = repo.criarComBaixa.mock.calls[0][0];
    expect(args.data.toISOString().slice(0, 10)).toBe('2026-09-15');
  });
});
