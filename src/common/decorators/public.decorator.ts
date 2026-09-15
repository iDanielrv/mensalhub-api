import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Marca uma rota como pública (sem exigir JWT). Uso: @Public() no handler.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
