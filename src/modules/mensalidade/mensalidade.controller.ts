import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { MensalidadeService } from './mensalidade.service.js';
import { GerarMensalidadesDto } from './dto/gerar-mensalidades.dto.js';
import { UpdateMensalidadeDto } from './dto/update-mensalidade.dto.js';

@Controller('mensalidades')
export class MensalidadeController {
  constructor(private readonly mensalidades: MensalidadeService) {}

  // Gera mensalidades do mês para todas as matrículas ATIVA da organização.
  @Post('gerar')
  gerar(@CurrentUser() user: AuthUser, @Body() dto: GerarMensalidadesDto) {
    return this.mensalidades.gerar(user.organizacaoId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('mes') mes?: string,
    @Query('ano') ano?: string,
  ) {
    return this.mensalidades.findAll(
      user.organizacaoId,
      mes ? Number(mes) : undefined,
      ano ? Number(ano) : undefined,
    );
  }

  // Rota estática declarada antes de ':id' para não ser capturada pelo ParseUUIDPipe.
  @Get('inadimplencia')
  inadimplencia(@CurrentUser() user: AuthUser) {
    return this.mensalidades.inadimplencia(user.organizacaoId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.mensalidades.findOne(user.organizacaoId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMensalidadeDto,
  ) {
    return this.mensalidades.update(user.organizacaoId, id, dto);
  }
}
