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

  findOne(organizacaoId: string, id: string) {
    return this.prisma.mensalidade.findFirst({
      where: { id, organizacaoId },
    });
  }

  update(id: string, data: Prisma.MensalidadeUncheckedUpdateInput) {
    return this.prisma.mensalidade.update({ where: { id }, data });
  }
}
