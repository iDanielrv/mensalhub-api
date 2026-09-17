import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// organizacaoId NUNCA vai no DTO — vem sempre do token (isolamento de tenant).
export class CreateResponsavelDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(14) // 000.000.000-00
  cpf?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  endereco?: string;
}
