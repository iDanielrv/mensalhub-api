import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { AuthUser } from '../types/auth-user.js';
import { TenantContext } from './tenant-context.service.js';

// Abre o contexto de tenant a partir do usuário autenticado (setado pelo JWT
// guard, que roda antes dos interceptors). Rotas públicas (login) não têm user,
// então rodam sem organização — e devem usar runCrossTenant onde acessam o banco.
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenant: TenantContext) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const organizacaoId = req.user?.organizacaoId;
    const store = organizacaoId ? { organizacaoId } : {};

    // O Observable é lazy: precisamos nos inscrever DENTRO do run() para o
    // AsyncLocalStorage continuar ativo durante toda a execução do handler.
    return new Observable((subscriber) => {
      let sub: { unsubscribe: () => void } | undefined;
      this.tenant.run(store, () => {
        sub = next.handle().subscribe(subscriber);
      });
      return () => sub?.unsubscribe();
    });
  }
}
