import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  competenciaDe,
  vencimentoDe,
} from '../../common/date/competencia.util.js';
import { MatriculaRepository } from './matricula.repository.js';
import {
  toMatriculaResponse,
  type MatriculaResponse,
} from './matricula.response.js';
import type { CreateMatriculaDto } from './dto/create-matricula.dto.js';
import type { UpdateMatriculaDto } from './dto/update-matricula.dto.js';
import type { AtivarMatriculaDto } from './dto/ativar-matricula.dto.js';

@Injectable()
export class MatriculaService {
  constructor(private readonly matriculas: MatriculaRepository) {}

  async create(
    organizacaoId: string,
    dto: CreateMatriculaDto,
  ): Promise<MatriculaResponse> {
    const aluno = await this.matriculas.alunoExisteNaOrg(organizacaoId, dto.alunoId);
    if (!aluno) throw new BadRequestException('Aluno não encontrado nesta organização');

    const curso = await this.matriculas.cursoExisteNaOrg(organizacaoId, dto.cursoId);
    if (!curso) throw new BadRequestException('Curso não encontrado nesta organização');

    const matricula = await this.matriculas.create({
      organizacaoId,
      alunoId: dto.alunoId,
      cursoId: dto.cursoId,
      inicio: new Date(dto.inicio),
      fim: dto.fim ? new Date(dto.fim) : null,
      diaVencimento: dto.diaVencimento ?? 10,
      // Usa o valor do curso como padrão; permite override por matrícula.
      valor: dto.valor ?? curso.valorMensalidade,
    });
    return toMatriculaResponse(matricula);
  }

  async findAll(organizacaoId: string): Promise<MatriculaResponse[]> {
    const matriculas = await this.matriculas.findMany(organizacaoId);
    return matriculas.map(toMatriculaResponse);
  }

  async findOne(organizacaoId: string, id: string): Promise<MatriculaResponse> {
    const matricula = await this.matriculas.findOne(organizacaoId, id);
    if (!matricula) throw new NotFoundException('Matrícula não encontrada');
    return toMatriculaResponse(matricula);
  }

  // Ativa uma matrícula AGUARDANDO cobrando o 1º pagamento (mensalidade do mês
  // de início, já paga). A matrícula só passa a gerar mensalidades depois disso.
  async ativarComPagamento(
    organizacaoId: string,
    id: string,
    dto: AtivarMatriculaDto,
  ) {
    const matricula = await this.findOne(organizacaoId, id);

    if (matricula.status !== 'AGUARDANDO') {
      throw new BadRequestException(
        'Apenas matrículas aguardando pagamento podem ser ativadas por aqui',
      );
    }

    const valor = dto.valor ?? (matricula.valor ? Number(matricula.valor) : null);
    if (valor === null) {
      throw new BadRequestException(
        'Defina o valor da mensalidade antes de ativar a matrícula',
      );
    }

    // Competência e vencimento derivam do mês de início da matrícula.
    const inicio = new Date(matricula.inicio);
    const ano = inicio.getUTCFullYear();
    const mes = inicio.getUTCMonth() + 1; // 1-based

    const ativada = await this.matriculas.ativarComPrimeiroPagamento({
      organizacaoId,
      matriculaId: id,
      competencia: competenciaDe(ano, mes),
      vencimento: vencimentoDe(ano, mes, matricula.diaVencimento),
      valor,
      metodo: dto.metodo,
      data: dto.data ? new Date(dto.data) : new Date(),
    });
    return toMatriculaResponse(ativada);
  }

  async update(
    organizacaoId: string,
    id: string,
    dto: UpdateMatriculaDto,
  ): Promise<MatriculaResponse> {
    await this.findOne(organizacaoId, id);
    const matricula = await this.matriculas.update(id, {
      fim: dto.fim ? new Date(dto.fim) : undefined,
      diaVencimento: dto.diaVencimento,
      valor: dto.valor,
      status: dto.status,
    });
    return toMatriculaResponse(matricula);
  }
}
