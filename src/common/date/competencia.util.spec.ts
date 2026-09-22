import { describe, expect, it } from 'vitest';
import { competenciaDe, vencimentoDe } from './competencia.util.js';

const iso = (d: Date) => d.toISOString().slice(0, 10);

describe('competenciaDe', () => {
  it('retorna o 1º dia do mês em UTC', () => {
    expect(iso(competenciaDe(2026, 9))).toBe('2026-09-01');
    expect(iso(competenciaDe(2026, 1))).toBe('2026-01-01');
    expect(iso(competenciaDe(2026, 12))).toBe('2026-12-01');
  });
});

describe('vencimentoDe', () => {
  it('usa o dia pedido quando cabe no mês', () => {
    expect(iso(vencimentoDe(2026, 9, 10))).toBe('2026-09-10');
    expect(iso(vencimentoDe(2026, 3, 1))).toBe('2026-03-01');
  });

  it('faz clamp para o último dia em meses curtos (fevereiro)', () => {
    // 2026 não é bissexto → fevereiro tem 28 dias.
    expect(iso(vencimentoDe(2026, 2, 31))).toBe('2026-02-28');
    expect(iso(vencimentoDe(2026, 2, 30))).toBe('2026-02-28');
  });

  it('respeita o 29 de fevereiro em ano bissexto', () => {
    // 2024 é bissexto → fevereiro tem 29 dias.
    expect(iso(vencimentoDe(2024, 2, 31))).toBe('2024-02-29');
    expect(iso(vencimentoDe(2024, 2, 29))).toBe('2024-02-29');
  });

  it('faz clamp em meses de 30 dias', () => {
    expect(iso(vencimentoDe(2026, 4, 31))).toBe('2026-04-30'); // abril
    expect(iso(vencimentoDe(2026, 11, 31))).toBe('2026-11-30'); // novembro
  });

  it('mantém o dia 31 em meses de 31 dias', () => {
    expect(iso(vencimentoDe(2026, 1, 31))).toBe('2026-01-31');
    expect(iso(vencimentoDe(2026, 12, 31))).toBe('2026-12-31');
  });
});
