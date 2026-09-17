import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { MatriculaStatus } from '@prisma/client';

// Todos os campos opcionais (atualização parcial). alunoId/cursoId não são alteráveis.
export class UpdateMatriculaDto {
  @IsOptional()
  @IsDateString()
  fim?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  diaVencimento?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valor?: number;

  @IsOptional()
  @IsEnum(MatriculaStatus)
  status?: MatriculaStatus;
}
