import { Injectable } from '@nestjs/common';
import { MensalidadeStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class MensalidadeRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Gera mensalidades para todas as matrículas ATIVA do mês. Ignora duplicatas
  // (unique [matriculaId, competencia]) para poder chamar novamente sem problemas.
  async gerar(organizacaoId: string, mes: number, ano: number) {
    const matriculas = await this.prisma.matricula.findMany({
      where: { organizacaoId, status: 'ATIVA' },
      select: { id: true, diaVencimento: true, valor: true },
    });

    const competencia = new Date(Date.UTC(ano, mes - 1, 1));
    const ultimoDia = new Date(ano, mes, 0).getDate(); // Date(ano, mes, 0) = último dia do mês

    const dados = matriculas
      .filter((m) => m.valor !== null)
      .map((m) => ({
        organizacaoId,
        matriculaId: m.id,
        competencia,
        vencimento: new Date(Date.UTC(ano, mes - 1, Math.min(m.diaVencimento, ultimoDia))),
        valor: m.valor as Prisma.Decimal,
      }));

    const resultado = await this.prisma.mensalidade.createMany({
      data: dados,
      skipDuplicates: true,
    });

    return { geradas: resultado.count, total: matriculas.length };
  }

  // Geração de sistema (cron): gera para as matrículas ATIVA de TODAS as
  // organizações de uma vez. Não é scoped por JWT — é um job, não uma requisição.
  // Reaproveita o unique [matriculaId, competencia] via skipDuplicates, então é
  // seguro rodar mais de uma vez no mesmo mês.
  async gerarTodas(mes: number, ano: number) {
    const matriculas = await this.prisma.matricula.findMany({
      where: { status: 'ATIVA' },
      select: { id: true, organizacaoId: true, diaVencimento: true, valor: true },
    });

    const competencia = new Date(Date.UTC(ano, mes - 1, 1));
    const ultimoDia = new Date(ano, mes, 0).getDate();

    const dados = matriculas
      .filter((m) => m.valor !== null)
      .map((m) => ({
        organizacaoId: m.organizacaoId,
        matriculaId: m.id,
        competencia,
        vencimento: new Date(Date.UTC(ano, mes - 1, Math.min(m.diaVencimento, ultimoDia))),
        valor: m.valor as Prisma.Decimal,
      }));

    const resultado = await this.prisma.mensalidade.createMany({
      data: dados,
      skipDuplicates: true,
    });

    return { geradas: resultado.count, total: matriculas.length };
  }

  // Marca ABERTA → ATRASADA para mensalidades vencidas antes de retornar a lista.
  async marcarAtrasadas(organizacaoId: string) {
    await this.prisma.mensalidade.updateMany({
      where: {
        organizacaoId,
        status: MensalidadeStatus.ABERTA,
        vencimento: { lt: new Date() },
      },
      data: { status: MensalidadeStatus.ATRASADA },
    });
  }

  findMany(organizacaoId: string, mes?: number, ano?: number) {
    const where: Prisma.MensalidadeWhereInput = { organizacaoId };
    if (mes && ano) {
      where.competencia = new Date(Date.UTC(ano, mes - 1, 1));
    }
    return this.prisma.mensalidade.findMany({
      where,
      include: {
        matricula: {
          select: {
            aluno: { select: { nome: true } },
            curso: { select: { nome: true } },
          },
        },
      },
      orderBy: [{ vencimento: 'asc' }],
    });
  }

  async findInadimplentes(organizacaoId: string) {
    await this.marcarAtrasadas(organizacaoId);

    const mensalidades = await this.prisma.mensalidade.findMany({
      where: { organizacaoId, status: MensalidadeStatus.ATRASADA },
      include: {
        matricula: {
          select: {
            aluno: {
              select: {
                id: true,
                nome: true,
                responsavel: { select: { nome: true, telefone: true } },
              },
            },
            curso: { select: { nome: true } },
          },
        },
      },
      orderBy: { vencimento: 'asc' },
    });

    // Conta alunos únicos com pelo menos uma matrícula ATIVA (base para o %).
    const alunosAtivos = await this.prisma.matricula.findMany({
      where: { organizacaoId, status: 'ATIVA' },
      distinct: ['alunoId'],
      select: { alunoId: true },
    });

    return { mensalidades, totalAlunosAtivos: alunosAtivos.length };
  }

  async resumoFinanceiro(organizacaoId: string) {
    await this.marcarAtrasadas(organizacaoId);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const inicioMesAtual = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), 1));
    const fimMesAtual = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth() + 1, 0));

    // Janela de 6 meses para o gráfico de receita (mês atual + 5 anteriores).
    const inicioJanela = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth() - 5, 1));

    // Próximos 7 dias para "vencendo breve".
    const em7Dias = new Date(hoje);
    em7Dias.setDate(hoje.getDate() + 7);

    const [receitaMesRaw, aReceberRaw, atrasadoRaw, receitaPorMesRaw, vencendoBreve, recentes, inadimplentesCount] =
      await this.prisma.$transaction([
        // Receita do mês atual (mensalidades PAGAS com competência neste mês).
        this.prisma.mensalidade.aggregate({
          where: { organizacaoId, status: 'PAGA', competencia: inicioMesAtual },
          _sum: { valor: true },
        }),

        // A receber: ABERTA com competência neste mês.
        this.prisma.mensalidade.aggregate({
          where: { organizacaoId, status: 'ABERTA', competencia: inicioMesAtual },
          _sum: { valor: true },
        }),

        // Total atrasado: todas ATRASADA independente do mês.
        this.prisma.mensalidade.aggregate({
          where: { organizacaoId, status: 'ATRASADA' },
          _sum: { valor: true },
          _count: true,
        }),

        // Receita mensal: últimos 6 meses, agrupado por competência.
        this.prisma.mensalidade.groupBy({
          by: ['competencia'],
          where: {
            organizacaoId,
            status: 'PAGA',
            competencia: { gte: inicioJanela },
          },
          _sum: { valor: true },
          orderBy: { competencia: 'asc' },
        }),

        // Vencendo nos próximos 7 dias (ABERTA).
        this.prisma.mensalidade.findMany({
          where: {
            organizacaoId,
            status: 'ABERTA',
            vencimento: { gte: hoje, lte: em7Dias },
          },
          select: {
            id: true,
            vencimento: true,
            valor: true,
            matricula: {
              select: {
                aluno: { select: { nome: true } },
                curso: { select: { nome: true } },
              },
            },
          },
          orderBy: { vencimento: 'asc' },
          take: 10,
        }),

        // Mensalidades recentes (últimas 10, qualquer status).
        this.prisma.mensalidade.findMany({
          where: { organizacaoId },
          select: {
            id: true,
            vencimento: true,
            valor: true,
            status: true,
            matricula: {
              select: {
                aluno: { select: { nome: true } },
                curso: { select: { nome: true } },
              },
            },
          },
          orderBy: { vencimento: 'desc' },
          take: 10,
        }),

        // Conta alunos únicos inadimplentes.
        this.prisma.mensalidade.findMany({
          where: { organizacaoId, status: 'ATRASADA' },
          distinct: ['matriculaId'],
          select: { matricula: { select: { alunoId: true } } },
        }),
      ]);

    const alunosInadimplentes = new Set(inadimplentesCount.map((m) => m.matricula.alunoId)).size;

    return {
      receitaMes: Number(receitaMesRaw._sum.valor ?? 0),
      aReceber: Number(aReceberRaw._sum.valor ?? 0),
      totalAtrasado: Number(atrasadoRaw._sum.valor ?? 0),
      totalInadimplentes: alunosInadimplentes,
      receitaPorMes: receitaPorMesRaw.map((r) => ({
        competencia: r.competencia,
        total: Number(r._sum.valor ?? 0),
      })),
      vencendoBreve: vencendoBreve.map((m) => ({
        id: m.id,
        alunoNome: m.matricula.aluno.nome,
        cursoNome: m.matricula.curso.nome,
        vencimento: m.vencimento,
        valor: Number(m.valor),
      })),
      recentes: recentes.map((m) => ({
        id: m.id,
        alunoNome: m.matricula.aluno.nome,
        cursoNome: m.matricula.curso.nome,
        vencimento: m.vencimento,
        valor: Number(m.valor),
        status: m.status,
      })),
    };
  }

  findOne(organizacaoId: string, id: string) {
    return this.prisma.mensalidade.findFirst({
      where: { id, organizacaoId },
    });
  }

  update(id: string, data: Prisma.MensalidadeUncheckedUpdateInput) {
    return this.prisma.mensalidade.update({ where: { id }, data });
  }
}
