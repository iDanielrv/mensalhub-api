import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import type { Usuario } from '@prisma/client';
import bcrypt from 'bcrypt';
import { UsuarioRepository } from '../modules/usuario/usuario.repository.js';
import type { JwtPayload, TokenPair } from './auth.types.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, senha: string): Promise<TokenPair> {
    const usuario = await this.usuarios.findByEmail(email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const senhaOk = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaOk) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.gerarTokens(usuario);
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    // Garante que o usuário ainda existe.
    const usuario = await this.usuarios.findById(payload.sub);
    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return this.gerarTokens(usuario);
  }

  private async gerarTokens(usuario: Usuario): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: usuario.id,
      organizacaoId: usuario.organizacaoId,
      email: usuario.email,
      role: usuario.role,
    };

    // expiresIn do @nestjs/jwt é tipado como StringValue; o valor vem do .env
    // como string ("15m", "7d"), então tipamos o cast num só lugar.
    type ExpiresIn = JwtSignOptions['expiresIn'];

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.config.getOrThrow<string>('JWT_ACCESS_EXPIRES') as ExpiresIn,
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES') as ExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
