import { IsEnum, IsOptional } from 'class-validator';
import { MensalidadeStatus } from '@prisma/client';

export class UpdateMensalidadeDto {
  @IsOptional()
  @IsEnum(MensalidadeStatus)
  status?: MensalidadeStatus;
}
