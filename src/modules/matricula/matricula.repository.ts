import { Injectable } from '@nestjs/common';
import { MetodoPagamento, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

// Camada de dados da Matrícula. Regra: TODO acesso é escopado por organizacaoId.
@Injectable()
export class MatriculaRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MatriculaUncheckedCreateInput) {
    return this.prisma.matricula.create({
      data,
      include: {
        aluno: { select: { nome: true } },
        curso: { select: { nome: true } },
      },
    });
  }

  findMany(organizacaoId: string) {
    return this.prisma.matricula.findMany({
      where: { organizacaoId },
      include: {
        aluno: { select: { nome: true } },
        curso: { select: { nome: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(organizacaoId: string, id: string) {
    return this.prisma.matricula.findFirst({
      where: { id, organizacaoId },
      include: {
        aluno: { select: { nome: true } },
        curso: { select: { nome: true } },
      },
    });
  }

  update(id: string, data: Prisma.MatriculaUncheckedUpdateInput) {
    return this.prisma.matricula.update({
      where: { id },
      data,
      include: {
        aluno: { select: { nome: true } },
        curso: { select: { nome: true } },
      },
    });
  }

  // Ativa a matrícula registrando o 1º pagamento: cria a mensalidade do mês de
  // início já PAGA, o pagamento vinculado e muda o status para ATIVA — tudo numa
  // transação, para nunca liberar o aluno sem registro financeiro.
  ativarComPrimeiroPagamento(args: {
    organizacaoId: string;
    matriculaId: string;
    competencia: Date;
    vencimento: Date;
    valor: Prisma.Decimal | number;
    metodo: MetodoPagamento;
    data: Date;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const mensalidade = await tx.mensalidade.create({
        data: {
          organizacaoId: args.organizacaoId,
          matriculaId: args.matriculaId,
          competencia: args.competencia,
          vencimento: args.vencimento,
          valor: args.valor,
          status: 'PAGA',
        },
      });
      await tx.pagamento.create({
        data: {
          organizacaoId: args.organizacaoId,
          mensalidadeId: mensalidade.id,
          valor: args.valor,
          metodo: args.metodo,
          data: args.data,
        },
      });
      return tx.matricula.update({
        where: { id: args.matriculaId },
        data: { status: 'ATIVA' },
        include: {
          aluno: { select: { nome: true } },
          curso: { select: { nome: true } },
        },
      });
    });
  }

  // Valida pertencimento à org antes de criar a matrícula.
  alunoExisteNaOrg(organizacaoId: string, alunoId: string) {
    return this.prisma.aluno.findFirst({ where: { id: alunoId, organizacaoId } });
  }

  cursoExisteNaOrg(organizacaoId: string, cursoId: string) {
    return this.prisma.curso.findFirst({ where: { id: cursoId, organizacaoId } });
  }
}
