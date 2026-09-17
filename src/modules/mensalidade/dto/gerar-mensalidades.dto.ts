import { IsInt, Max, Min } from 'class-validator';

export class GerarMensalidadesDto {
  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;

  @IsInt()
  @Min(2020)
  @Max(2100)
  ano: number;
}
