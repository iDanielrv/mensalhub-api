import { Injectable, NotFoundException } from '@nestjs/common';
import { ResponsavelRepository } from './responsavel.repository.js';
import type { CreateResponsavelDto } from './dto/create-responsavel.dto.js';
import type { UpdateResponsavelDto } from './dto/update-responsavel.dto.js';

@Injectable()
export class ResponsavelService {
  constructor(private readonly responsaveis: ResponsavelRepository) {}

  create(organizacaoId: string, dto: CreateResponsavelDto) {
    return this.responsaveis.create({
      organizacaoId,
      nome: dto.nome,
      cpf: dto.cpf ?? null,
      email: dto.email ?? null,
      telefone: dto.telefone ?? null,
      endereco: dto.endereco ?? null,
    });
  }

  findAll(organizacaoId: string) {
    return this.responsaveis.findMany(organizacaoId);
  }

  async findOne(organizacaoId: string, id: string) {
    const responsavel = await this.responsaveis.findOne(organizacaoId, id);
    if (!responsavel) throw new NotFoundException('Responsável não encontrado');
    return responsavel;
  }

  async update(organizacaoId: string, id: string, dto: UpdateResponsavelDto) {
    await this.findOne(organizacaoId, id);
    return this.responsaveis.update(id, {
      nome: dto.nome,
      cpf: dto.cpf,
      email: dto.email,
      telefone: dto.telefone,
      endereco: dto.endereco,
    });
  }

  async remove(organizacaoId: string, id: string) {
    await this.findOne(organizacaoId, id);
    // onDelete: SetNull em Aluno → remover responsável não quebra alunos vinculados.
    await this.responsaveis.delete(id);
  }
}
