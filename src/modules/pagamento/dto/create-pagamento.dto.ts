import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { MetodoPagamento } from '@prisma/client';

export class CreatePagamentoDto {
  @IsUUID()
  mensalidadeId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor: number;

  @IsEnum(MetodoPagamento)
  metodo: MetodoPagamento;

  @IsOptional()
  @IsDateString()
  data?: string;
}
