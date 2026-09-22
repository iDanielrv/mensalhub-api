import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  TENANT_PRISMA,
  type TenantPrismaClient,
} from '../../common/tenant/tenant.extension.js';

// Camada de dados do Aluno. O isolamento por organizacaoId é garantido pela
// extensão de tenant (TENANT_PRISMA); os filtros explícitos abaixo são redundância.
@Injectable()
export class AlunoRepository {
  constructor(
    @Inject(TENANT_PRISMA) private readonly prisma: TenantPrismaClient,
  ) {}

  create(data: Prisma.AlunoUncheckedCreateInput) {
    return this.prisma.aluno.create({ data });
  }

  findMany(organizacaoId: string) {
    return this.prisma.aluno.findMany({
      where: { organizacaoId },
      orderBy: { nome: 'asc' },
    });
  }

  // findFirst com organizacaoId → registro de outra organização retorna null.
  findOne(organizacaoId: string, id: string) {
    return this.prisma.aluno.findFirst({ where: { id, organizacaoId } });
  }

  update(id: string, data: Prisma.AlunoUncheckedUpdateInput) {
    return this.prisma.aluno.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.aluno.delete({ where: { id } });
  }

  // Valida que um responsável pertence à mesma organização (isolamento de tenant).
  responsavelExisteNaOrg(organizacaoId: string, responsavelId: string) {
    return this.prisma.responsavel.findFirst({
      where: { id: responsavelId, organizacaoId },
    });
  }
}
