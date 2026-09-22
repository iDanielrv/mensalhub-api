import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AlunoRepository } from './aluno.repository.js';
import { toAlunoResponse, type AlunoResponse } from './aluno.response.js';
import type { CreateAlunoDto } from './dto/create-aluno.dto.js';
import type { UpdateAlunoDto } from './dto/update-aluno.dto.js';

// Regra de negócio do Aluno. Recebe SEMPRE o organizacaoId (vindo do token).
@Injectable()
export class AlunoService {
  constructor(private readonly alunos: AlunoRepository) {}

  async create(organizacaoId: string, dto: CreateAlunoDto): Promise<AlunoResponse> {
    if (dto.responsavelId) {
      await this.assertResponsavel(organizacaoId, dto.responsavelId);
    }
    const aluno = await this.alunos.create({
      organizacaoId,
      nome: dto.nome,
      nascimento: dto.nascimento ? new Date(dto.nascimento) : null,
      responsavelId: dto.responsavelId ?? null,
      telefone: dto.telefone ?? null,
      email: dto.email ?? null,
      observacoes: dto.observacoes ?? null,
    });
    return toAlunoResponse(aluno);
  }

  async findAll(organizacaoId: string): Promise<AlunoResponse[]> {
    const alunos = await this.alunos.findMany(organizacaoId);
    return alunos.map(toAlunoResponse);
  }

  async findOne(organizacaoId: string, id: string): Promise<AlunoResponse> {
    const aluno = await this.alunos.findOne(organizacaoId, id);
    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }
    return toAlunoResponse(aluno);
  }

  async update(
    organizacaoId: string,
    id: string,
    dto: UpdateAlunoDto,
  ): Promise<AlunoResponse> {
    // Garante que o aluno existe E pertence à organização antes de atualizar.
    await this.findOne(organizacaoId, id);
    if (dto.responsavelId) {
      await this.assertResponsavel(organizacaoId, dto.responsavelId);
    }
    const aluno = await this.alunos.update(id, {
      nome: dto.nome,
      nascimento: dto.nascimento ? new Date(dto.nascimento) : undefined,
      responsavelId: dto.responsavelId,
      telefone: dto.telefone,
      email: dto.email,
      observacoes: dto.observacoes,
    });
    return toAlunoResponse(aluno);
  }

  async remove(organizacaoId: string, id: string) {
    await this.findOne(organizacaoId, id);
    await this.alunos.delete(id);
  }

  private async assertResponsavel(organizacaoId: string, responsavelId: string) {
    const responsavel = await this.alunos.responsavelExisteNaOrg(
      organizacaoId,
      responsavelId,
    );
    if (!responsavel) {
      throw new BadRequestException(
        'Responsável não encontrado nesta organização',
      );
    }
  }
}
