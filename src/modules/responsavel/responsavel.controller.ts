import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { ResponsavelService } from './responsavel.service.js';
import { CreateResponsavelDto } from './dto/create-responsavel.dto.js';
import { UpdateResponsavelDto } from './dto/update-responsavel.dto.js';

// Só entrada/saída HTTP. organizacaoId vem do token (@CurrentUser), nunca do body.
@Controller('responsaveis')
export class ResponsavelController {
  constructor(private readonly responsaveis: ResponsavelService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateResponsavelDto) {
    return this.responsaveis.create(user.organizacaoId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.responsaveis.findAll(user.organizacaoId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.responsaveis.findOne(user.organizacaoId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateResponsavelDto,
  ) {
    return this.responsaveis.update(user.organizacaoId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.responsaveis.remove(user.organizacaoId, id);
  }
}
