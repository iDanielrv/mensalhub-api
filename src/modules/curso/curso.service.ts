import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CursoRepository } from './curso.repository.js';
import type { CreateCursoDto } from './dto/create-curso.dto.js';
import type { UpdateCursoDto } from './dto/update-curso.dto.js';

@Injectable()
export class CursoService {
  constructor(private readonly cursos: CursoRepository) {}

  create(organizacaoId: string, dto: CreateCursoDto) {
    return this.cursos.create({
      organizacaoId,
      nome: dto.nome,
      valorMensalidade: dto.valorMensalidade,
      ativo: dto.ativo ?? true,
    });
  }

  findAll(organizacaoId: string) {
    return this.cursos.findMany(organizacaoId);
  }

  async findOne(organizacaoId: string, id: string) {
    const curso = await this.cursos.findOne(organizacaoId, id);
    if (!curso) throw new NotFoundException('Curso não encontrado');
    return curso;
  }

  async update(organizacaoId: string, id: string, dto: UpdateCursoDto) {
    await this.findOne(organizacaoId, id);
    return this.cursos.update(id, {
      nome: dto.nome,
      valorMensalidade: dto.valorMensalidade,
      ativo: dto.ativo,
    });
  }

  async remove(organizacaoId: string, id: string) {
    await this.findOne(organizacaoId, id);
    try {
      await this.cursos.delete(id);
    } catch {
      // Prisma lança P2003 se houver matrículas vinculadas (onDelete: Restrict).
      throw new BadRequestException(
        'Não é possível remover um curso com matrículas vinculadas',
      );
    }
  }
}
