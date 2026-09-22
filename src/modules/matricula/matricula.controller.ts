import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { MatriculaService } from './matricula.service.js';
import { CreateMatriculaDto } from './dto/create-matricula.dto.js';
import { UpdateMatriculaDto } from './dto/update-matricula.dto.js';
import { AtivarMatriculaDto } from './dto/ativar-matricula.dto.js';

// Matrícula não tem delete — encerra via PATCH { status: 'ENCERRADA' }.
@Controller('matriculas')
export class MatriculaController {
  constructor(private readonly matriculas: MatriculaService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateMatriculaDto) {
    return this.matriculas.create(user.organizacaoId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.matriculas.findAll(user.organizacaoId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.matriculas.findOne(user.organizacaoId, id);
  }

  // Ativa a matrícula registrando o 1º pagamento (a entrada).
  @Post(':id/ativar')
  ativar(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtivarMatriculaDto,
  ) {
    return this.matriculas.ativarComPagamento(user.organizacaoId, id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMatriculaDto,
  ) {
    return this.matriculas.update(user.organizacaoId, id, dto);
  }
}
