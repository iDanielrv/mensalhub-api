import { Module } from '@nestjs/common';
import { ResponsavelController } from './responsavel.controller.js';
import { ResponsavelRepository } from './responsavel.repository.js';
import { ResponsavelService } from './responsavel.service.js';

@Module({
  controllers: [ResponsavelController],
  providers: [ResponsavelService, ResponsavelRepository],
})
export class ResponsavelModule {}
