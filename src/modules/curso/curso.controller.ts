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
import { CursoService } from './curso.service.js';
import { CreateCursoDto } from './dto/create-curso.dto.js';
import { UpdateCursoDto } from './dto/update-curso.dto.js';

// Só entrada/saída HTTP. organizacaoId vem do token (@CurrentUser), nunca do body.
@Controller('cursos')
export class CursoController {
  constructor(private readonly cursos: CursoService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCursoDto) {
    return this.cursos.create(user.organizacaoId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.cursos.findAll(user.organizacaoId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.cursos.findOne(user.organizacaoId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCursoDto,
  ) {
    return this.cursos.update(user.organizacaoId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.cursos.remove(user.organizacaoId, id);
  }
}
