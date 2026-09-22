import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { MetodoPagamento } from '@prisma/client';

// Ativa uma matrícula AGUARDANDO registrando o 1º pagamento (a "entrada").
// Cria a mensalidade do mês de início já como PAGA e libera o aluno.
export class AtivarMatriculaDto {
  @IsEnum(MetodoPagamento)
  metodo: MetodoPagamento;

  // Quando omitido, usa o valor da própria matrícula.
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor?: number;

  @IsOptional()
  @IsDateString()
  data?: string;
}
