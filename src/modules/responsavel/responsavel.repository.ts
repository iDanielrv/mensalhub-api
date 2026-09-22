import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  TENANT_PRISMA,
  type TenantPrismaClient,
} from '../../common/tenant/tenant.extension.js';

// Camada de dados do Responsável. O isolamento por organizacaoId é garantido pela
// extensão de tenant (TENANT_PRISMA); os filtros explícitos abaixo são redundância.
@Injectable()
export class ResponsavelRepository {
  constructor(
    @Inject(TENANT_PRISMA) private readonly prisma: TenantPrismaClient,
  ) {}

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
