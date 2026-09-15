/**
 * Provisiona uma nova Organização + seu usuário dono.
 * Uso (onboarding controlado — só você roda isto):
 *
 *   npm run provision -- \
 *     --org "Escola de Música Dó-Ré-Mi" \
 *     --tipo PJ \
 *     --doc 12345678000199 \
 *     --nome "Daniel" \
 *     --email dono@escola.com \
 *     --senha "senhaForte123"
 *
 * --tipo: PF (professor autônomo/CPF) ou PJ (escola/CNPJ). --doc é opcional.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, TipoPessoa } from '@prisma/client';
import bcrypt from 'bcrypt';

function getArg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const nomeOrg = getArg('--org');
  const tipoArg = (getArg('--tipo') ?? 'PJ').toUpperCase();
  const documento = getArg('--doc');
  const nomeUsuario = getArg('--nome');
  const email = getArg('--email');
  const senha = getArg('--senha');

  if (!nomeOrg || !nomeUsuario || !email || !senha) {
    throw new Error(
      'Faltam argumentos. Obrigatórios: --org, --nome, --email, --senha (--tipo PF|PJ, --doc opcionais).',
    );
  }
  if (tipoArg !== 'PF' && tipoArg !== 'PJ') {
    throw new Error('--tipo deve ser PF ou PJ.');
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL não definida.');

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      throw new Error(`Já existe um usuário com o e-mail ${email}.`);
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const org = await prisma.organizacao.create({
      data: {
        nome: nomeOrg,
        tipoPessoa: tipoArg as TipoPessoa,
        documento: documento ?? null,
        usuarios: {
          create: {
            nome: nomeUsuario,
            email,
            senhaHash,
            role: 'DONO',
          },
        },
      },
      include: { usuarios: true },
    });

    console.log('✅ Organização criada:');
    console.log(`   id:    ${org.id}`);
    console.log(`   nome:  ${org.nome} (${org.tipoPessoa})`);
    console.log(`👤 Usuário dono:`);
    console.log(`   email: ${org.usuarios[0].email}`);
    console.log(`   id:    ${org.usuarios[0].id}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : err);
  process.exit(1);
});
