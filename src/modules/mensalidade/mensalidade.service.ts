import { Injectable, NotFoundException } from '@nestjs/common';
import { MensalidadeRepository } from './mensalidade.repository.js';
import type { GerarMensalidadesDto } from './dto/gerar-mensalidades.dto.js';
import type { UpdateMensalidadeDto } from './dto/update-mensalidade.dto.js';

@Injectable()
export class MensalidadeService {
  constructor(private readonly mensalidades: MensalidadeRepository) {}

  gerar(organizacaoId: string, dto: GerarMensalidadesDto) {
    return this.mensalidades.gerar(organizacaoId, dto.mes, dto.ano);
  }

  async findAll(organizacaoId: string, mes?: number, ano?: number) {
    // Atualiza status antes de retornar para refletir atrasos sem precisar de cron.
    await this.mensalidades.marcarAtrasadas(organizacaoId);
    return this.mensalidades.findMany(organizacaoId, mes, ano);
  }

  async findOne(organizacaoId: string, id: string) {
    const mensalidade = await this.mensalidades.findOne(organizacaoId, id);
    if (!mensalidade) throw new NotFoundException('Mensalidade não encontrada');
    return mensalidade;
  }

  async inadimplencia(organizacaoId: string) {
    const { mensalidades, totalAlunosAtivos } =
      await this.mensalidades.findInadimplentes(organizacaoId);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Agrupa por aluno e calcula dias de atraso por mensalidade.
    const porAluno = new Map<
      string,
      {
        alunoId: string;
        alunoNome: string;
        responsavelNome: string | null;
        responsavelTelefone: string | null;
        mensalidades: {
          id: string;
          competencia: Date;
          vencimento: Date;
          valor: string;
          diasAtraso: number;
          cursoNome: string;
        }[];
        totalDevido: number;
      }
    >();

    for (const m of mensalidades) {
      const aluno = m.matricula.aluno;
      const venc = new Date(m.vencimento);
      venc.setHours(0, 0, 0, 0);
      const diasAtraso = Math.max(
        0,
        Math.floor((hoje.getTime() - venc.getTime()) / 86_400_000),
      );

      if (!porAluno.has(aluno.id)) {
        porAluno.set(aluno.id, {
          alunoId: aluno.id,
          alunoNome: aluno.nome,
          responsavelNome: aluno.responsavel?.nome ?? null,
          responsavelTelefone: aluno.responsavel?.telefone ?? null,
          mensalidades: [],
          totalDevido: 0,
        });
      }

      const entrada = porAluno.get(aluno.id)!;
      entrada.mensalidades.push({
        id: m.id,
        competencia: m.competencia,
        vencimento: m.vencimento,
        valor: m.valor.toString(),
        diasAtraso,
        cursoNome: m.matricula.curso.nome,
      });
      entrada.totalDevido += Number(m.valor);
    }

    const inadimplentes = [...porAluno.values()];
    const totalGeral = inadimplentes.reduce((s, a) => s + a.totalDevido, 0);
    const percentual =
      totalAlunosAtivos > 0
        ? Math.round((inadimplentes.length / totalAlunosAtivos) * 100)
        : 0;

    return { totalGeral, totalAlunos: inadimplentes.length, percentualInadimplentes: percentual, inadimplentes };
  }

  async update(organizacaoId: string, id: string, dto: UpdateMensalidadeDto) {
    await this.findOne(organizacaoId, id);
    return this.mensalidades.update(id, { status: dto.status });
  }
}
