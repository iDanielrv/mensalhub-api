import { Module } from '@nestjs/common';
import { AlunoController } from './aluno.controller.js';
import { AlunoRepository } from './aluno.repository.js';
import { AlunoService } from './aluno.service.js';

@Module({
  controllers: [AlunoController],
  providers: [AlunoService, AlunoRepository],
})
export class AlunoModule {}
