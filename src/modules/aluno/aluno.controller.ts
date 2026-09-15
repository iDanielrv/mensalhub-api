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
import { AlunoService } from './aluno.service.js';
import { CreateAlunoDto } from './dto/create-aluno.dto.js';
import { UpdateAlunoDto } from './dto/update-aluno.dto.js';

// Só entrada/saída HTTP. organizacaoId vem do token (@CurrentUser), nunca do body.
@Controller('alunos')
export class AlunoController {
  constructor(private readonly alunos: AlunoService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAlunoDto) {
    return this.alunos.create(user.organizacaoId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.alunos.findAll(user.organizacaoId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.alunos.findOne(user.organizacaoId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAlunoDto,
  ) {
    return this.alunos.update(user.organizacaoId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.alunos.remove(user.organizacaoId, id);
  }
}
