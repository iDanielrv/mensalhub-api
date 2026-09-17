import { Module } from '@nestjs/common';
import { CursoController } from './curso.controller.js';
import { CursoRepository } from './curso.repository.js';
import { CursoService } from './curso.service.js';

@Module({
  controllers: [CursoController],
  providers: [CursoService, CursoRepository],
})
export class CursoModule {}
