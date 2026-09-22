// Utilitários de data do ciclo de cobrança. Trabalham sempre em UTC, porque as
// colunas competencia/vencimento são @db.Date (data pura, sem fuso) — misturar
// horário local levaria a "off-by-one" perto da virada do dia. Mês é 1-based
// (1 = janeiro … 12 = dezembro), batendo com o domínio e os DTOs.

// Primeiro dia do mês de competência (mês de referência da mensalidade).
export function competenciaDe(ano: number, mes: number): Date {
  return new Date(Date.UTC(ano, mes - 1, 1));
}

// Data de vencimento no mês, respeitando o dia desejado mas sem estourar o último
// dia do mês (ex.: diaVencimento 31 em fevereiro vira 28, ou 29 em ano bissexto).
export function vencimentoDe(
  ano: number,
  mes: number,
  diaVencimento: number,
): Date {
  // Date.UTC(ano, mes, 0): dia 0 do mês seguinte = último dia do mês atual.
  const ultimoDia = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const dia = Math.min(diaVencimento, ultimoDia);
  return new Date(Date.UTC(ano, mes - 1, dia));
}
