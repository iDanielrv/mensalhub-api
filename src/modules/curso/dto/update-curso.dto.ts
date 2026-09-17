import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

// Todos os campos opcionais (atualização parcial). Sem organizacaoId (vem do token).
export class UpdateCursoDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorMensalidade?: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
