import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

// Camada de dados do Responsável. Regra: TODO acesso é escopado por organizacaoId.
@Injectable()
export class ResponsavelRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ResponsavelUncheckedCreateInput) {
    return this.prisma.responsavel.create({ data });
  }

  findMany(organizacaoId: string) {
    return this.prisma.responsavel.findMany({
      where: { organizacaoId },
      orderBy: { nome: 'asc' },
    });
  }

  // findFirst com organizacaoId → registro de outra organização retorna null.
  findOne(organizacaoId: string, id: string) {
    return this.prisma.responsavel.findFirst({ where: { id, organizacaoId } });
  }

  update(id: string, data: Prisma.ResponsavelUncheckedUpdateInput) {
    return this.prisma.responsavel.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.responsavel.delete({ where: { id } });
  }
}
