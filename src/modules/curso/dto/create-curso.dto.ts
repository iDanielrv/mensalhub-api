import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

// organizacaoId NUNCA vai no DTO — vem sempre do token (isolamento de tenant).
export class CreateCursoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorMensalidade: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
