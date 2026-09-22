import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatriculaService } from './matricula.service.js';
import type { MatriculaRepository } from './matricula.repository.js';

const ORG = 'org-1';

// Matrícula base para os testes de ativação (mês de início setembro/2026).
// Espelha o retorno do repositório, que sempre inclui os nomes de aluno e curso.
function matriculaBase(overrides: Record<string, unknown> = {}) {
  return {
    id: 'mat-1',
    organizacaoId: ORG,
    alunoId: 'a-1',
    cursoId: 'c-1',
    status: 'AGUARDANDO',
    inicio: new Date(Date.UTC(2026, 8, 1)), // setembro (0-based 8)
    fim: null,
    diaVencimento: 10,
    valor: 150,
    aluno: { nome: 'João' },
    curso: { nome: 'Violão' },
    ...overrides,
  };
}

describe('MatriculaService.ativarComPagamento', () => {
  let repo: {
    findOne: ReturnType<typeof vi.fn>;
    ativarComPrimeiroPagamento: ReturnType<typeof vi.fn>;
  };
  let service: MatriculaService;

  beforeEach(() => {
    repo = {
      findOne: vi.fn(),
      // Retorna uma matrícula mapeável (com aluno/curso), como o repo real faz.
      ativarComPrimeiroPagamento: vi
        .fn()
        .mockResolvedValue(matriculaBase({ status: 'ATIVA' })),
    };
    service = new MatriculaService(repo as unknown as MatriculaRepository);
  });

  it('lança NotFound quando a matrícula não existe', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(
      service.ativarComPagamento(ORG, 'x', { metodo: 'PIX' } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.ativarComPrimeiroPagamento).not.toHaveBeenCalled();
  });

  it('recusa ativar quando o status não é AGUARDANDO', async () => {
    repo.findOne.mockResolvedValue(matriculaBase({ status: 'ATIVA' }));
    await expect(
      service.ativarComPagamento(ORG, 'mat-1', { metodo: 'PIX' } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.ativarComPrimeiroPagamento).not.toHaveBeenCalled();
  });

  it('recusa ativar sem valor (nem no dto, nem na matrícula)', async () => {
    repo.findOne.mockResolvedValue(matriculaBase({ valor: null }));
    await expect(
      service.ativarComPagamento(ORG, 'mat-1', { metodo: 'PIX' } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deriva competência e vencimento do mês de início e repassa o valor', async () => {
    repo.findOne.mockResolvedValue(matriculaBase());
    await service.ativarComPagamento(ORG, 'mat-1', { metodo: 'PIX' } as never);

    const args = repo.ativarComPrimeiroPagamento.mock.calls[0][0];
    expect(args.matriculaId).toBe('mat-1');
    expect(args.valor).toBe(150); // veio da matrícula
    expect(args.metodo).toBe('PIX');
    expect(args.competencia.toISOString().slice(0, 10)).toBe('2026-09-01');
    expect(args.vencimento.toISOString().slice(0, 10)).toBe('2026-09-10');
  });

  it('dá preferência ao valor do dto sobre o da matrícula', async () => {
    repo.findOne.mockResolvedValue(matriculaBase({ valor: 150 }));
    await service.ativarComPagamento(ORG, 'mat-1', {
      metodo: 'PIX',
      valor: 200,
    } as never);
    expect(repo.ativarComPrimeiroPagamento.mock.calls[0][0].valor).toBe(200);
  });

  it('faz clamp do vencimento em mês curto (início 31/jan → venc. 28/fev não se aplica; usa mês de início)', async () => {
    // Início em 31/01/2026, diaVencimento 31 → vencimento 31/01 (janeiro tem 31).
    repo.findOne.mockResolvedValue(
      matriculaBase({ inicio: new Date(Date.UTC(2026, 0, 31)), diaVencimento: 31 }),
    );
    await service.ativarComPagamento(ORG, 'mat-1', { metodo: 'PIX' } as never);
    const args = repo.ativarComPrimeiroPagamento.mock.calls[0][0];
    expect(args.competencia.toISOString().slice(0, 10)).toBe('2026-01-01');
    expect(args.vencimento.toISOString().slice(0, 10)).toBe('2026-01-31');
  });
});
