import { Module } from '@nestjs/common';
import { UsuarioRepository } from './usuario.repository.js';

@Module({
  providers: [UsuarioRepository],
  exports: [UsuarioRepository],
})
export class UsuarioModule {}
