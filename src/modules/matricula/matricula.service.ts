import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MatriculaRepository } from './matricula.repository.js';
import type { CreateMatriculaDto } from './dto/create-matricula.dto.js';
import type { UpdateMatriculaDto } from './dto/update-matricula.dto.js';

@Injectable()
export class MatriculaService {
  constructor(private readonly matriculas: MatriculaRepository) {}

  async create(organizacaoId: string, dto: CreateMatriculaDto) {
    const aluno = await this.matriculas.alunoExisteNaOrg(organizacaoId, dto.alunoId);
    if (!aluno) throw new BadRequestException('Aluno não encontrado nesta organização');

    const curso = await this.matriculas.cursoExisteNaOrg(organizacaoId, dto.cursoId);
    if (!curso) throw new BadRequestException('Curso não encontrado nesta organização');

    return this.matriculas.create({
      organizacaoId,
      alunoId: dto.alunoId,
      cursoId: dto.cursoId,
      inicio: new Date(dto.inicio),
      fim: dto.fim ? new Date(dto.fim) : null,
      diaVencimento: dto.diaVencimento ?? 10,
      // Usa o valor do curso como padrão; permite override por matrícula.
      valor: dto.valor ?? curso.valorMensalidade,
    });
  }

  findAll(organizacaoId: string) {
    return this.matriculas.findMany(organizacaoId);
  }

  async findOne(organizacaoId: string, id: string) {
    const matricula = await this.matriculas.findOne(organizacaoId, id);
    if (!matricula) throw new NotFoundException('Matrícula não encontrada');
    return matricula;
  }

  async update(organizacaoId: string, id: string, dto: UpdateMatriculaDto) {
    await this.findOne(organizacaoId, id);
    return this.matriculas.update(id, {
      fim: dto.fim ? new Date(dto.fim) : undefined,
      diaVencimento: dto.diaVencimento,
      valor: dto.valor,
      status: dto.status,
    });
  }
}
