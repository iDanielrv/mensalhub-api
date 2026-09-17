import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

// Camada de dados do Curso. Regra: TODO acesso é escopado por organizacaoId.
@Injectable()
export class CursoRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.CursoUncheckedCreateInput) {
    return this.prisma.curso.create({ data });
  }

  findMany(organizacaoId: string) {
    return this.prisma.curso.findMany({
      where: { organizacaoId },
      orderBy: { nome: 'asc' },
    });
  }

  // findFirst com organizacaoId → registro de outra organização retorna null.
  findOne(organizacaoId: string, id: string) {
    return this.prisma.curso.findFirst({ where: { id, organizacaoId } });
  }

  update(id: string, data: Prisma.CursoUncheckedUpdateInput) {
    return this.prisma.curso.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.curso.delete({ where: { id } });
  }
}
