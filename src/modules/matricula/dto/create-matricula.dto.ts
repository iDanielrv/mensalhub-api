import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

// organizacaoId NUNCA vai no DTO — vem sempre do token (isolamento de tenant).
export class CreateMatriculaDto {
  @IsUUID()
  alunoId: string;

  @IsUUID()
  cursoId: string;

  @IsDateString()
  inicio: string;

  @IsOptional()
  @IsDateString()
  fim?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  diaVencimento?: number;

  // Quando omitido, o serviço usa o valorMensalidade do curso.
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valor?: number;
}
