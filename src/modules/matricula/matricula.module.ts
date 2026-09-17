import { Module } from '@nestjs/common';
import { MatriculaController } from './matricula.controller.js';
import { MatriculaRepository } from './matricula.repository.js';
import { MatriculaService } from './matricula.service.js';

@Module({
  controllers: [MatriculaController],
  providers: [MatriculaService, MatriculaRepository],
})
export class MatriculaModule {}
