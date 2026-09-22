import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CursoRepository } from './curso.repository.js';
import { toCursoResponse, type CursoResponse } from './curso.response.js';
import type { CreateCursoDto } from './dto/create-curso.dto.js';
import type { UpdateCursoDto } from './dto/update-curso.dto.js';

@Injectable()
export class CursoService {
  constructor(private readonly cursos: CursoRepository) {}

  async create(organizacaoId: string, dto: CreateCursoDto): Promise<CursoResponse> {
    const curso = await this.cursos.create({
      organizacaoId,
      nome: dto.nome,
      valorMensalidade: dto.valorMensalidade,
      ativo: dto.ativo ?? true,
    });
    return toCursoResponse(curso);
  }

  async findAll(organizacaoId: string): Promise<CursoResponse[]> {
    const cursos = await this.cursos.findMany(organizacaoId);
    return cursos.map(toCursoResponse);
  }

  async findOne(organizacaoId: string, id: string): Promise<CursoResponse> {
    const curso = await this.cursos.findOne(organizacaoId, id);
    if (!curso) throw new NotFoundException('Curso não encontrado');
    return toCursoResponse(curso);
  }

  async update(
    organizacaoId: string,
    id: string,
    dto: UpdateCursoDto,
  ): Promise<CursoResponse> {
    await this.findOne(organizacaoId, id);
    const curso = await this.cursos.update(id, {
      nome: dto.nome,
      valorMensalidade: dto.valorMensalidade,
      ativo: dto.ativo,
    });
    return toCursoResponse(curso);
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
