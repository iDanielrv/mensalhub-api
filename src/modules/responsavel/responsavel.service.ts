import { Injectable, NotFoundException } from '@nestjs/common';
import { ResponsavelRepository } from './responsavel.repository.js';
import {
  toResponsavelResponse,
  type ResponsavelResponse,
} from './responsavel.response.js';
import type { CreateResponsavelDto } from './dto/create-responsavel.dto.js';
import type { UpdateResponsavelDto } from './dto/update-responsavel.dto.js';

@Injectable()
export class ResponsavelService {
  constructor(private readonly responsaveis: ResponsavelRepository) {}

  async create(
    organizacaoId: string,
    dto: CreateResponsavelDto,
  ): Promise<ResponsavelResponse> {
    const responsavel = await this.responsaveis.create({
      organizacaoId,
      nome: dto.nome,
      cpf: dto.cpf ?? null,
      email: dto.email ?? null,
      telefone: dto.telefone ?? null,
      endereco: dto.endereco ?? null,
    });
    return toResponsavelResponse(responsavel);
  }

  async findAll(organizacaoId: string): Promise<ResponsavelResponse[]> {
    const responsaveis = await this.responsaveis.findMany(organizacaoId);
    return responsaveis.map(toResponsavelResponse);
  }

  async findOne(organizacaoId: string, id: string): Promise<ResponsavelResponse> {
    const responsavel = await this.responsaveis.findOne(organizacaoId, id);
    if (!responsavel) throw new NotFoundException('Responsável não encontrado');
    return toResponsavelResponse(responsavel);
  }

  async update(
    organizacaoId: string,
    id: string,
    dto: UpdateResponsavelDto,
  ): Promise<ResponsavelResponse> {
    await this.findOne(organizacaoId, id);
    const responsavel = await this.responsaveis.update(id, {
      nome: dto.nome,
      cpf: dto.cpf,
      email: dto.email,
      telefone: dto.telefone,
      endereco: dto.endereco,
    });
    return toResponsavelResponse(responsavel);
  }

  async remove(organizacaoId: string, id: string) {
    await this.findOne(organizacaoId, id);
    // onDelete: SetNull em Aluno → remover responsável não quebra alunos vinculados.
    await this.responsaveis.delete(id);
  }
}
