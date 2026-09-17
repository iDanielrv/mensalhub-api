import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.js';
import { PagamentoService } from './pagamento.service.js';
import { CreatePagamentoDto } from './dto/create-pagamento.dto.js';

@Controller('pagamentos')
export class PagamentoController {
  constructor(private readonly pagamentos: PagamentoService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePagamentoDto) {
    return this.pagamentos.create(user.organizacaoId, dto);
  }
}
