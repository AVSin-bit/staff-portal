import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calcTenure,
  formatHours,
  formatMonthsLeft,
  formatMoney,
  formatPeriod,
  formatTenure,
  plural,
} from '../lib/format';

/** В ru-RU разделитель разрядов — неразрывный пробел, для сравнения нормализуем. */
function norm(s: string): string {
  return s.replace(/\u00a0/g, ' ').replace(/\u202f/g, ' ');
}

test('деньги показываются в рублях без копеек', () => {
  assert.equal(norm(formatMoney(170898)), '170 898 ₽');
  assert.equal(norm(formatMoney(0)), '0 ₽');
  assert.equal(norm(formatMoney(1234.56)), '1 235 ₽');
});

test('нечисло не превращается в NaN', () => {
  assert.equal(formatMoney(null), '—');
  assert.equal(formatMoney(undefined), '—');
  assert.equal(formatMoney('нет'), '—');
  assert.equal(formatHours(null), '—');
  assert.equal(formatMoney(''), '—');
  assert.equal(formatHours(undefined), '—');
});

test('часы показываются с одним знаком и только при необходимости', () => {
  assert.equal(formatHours(182), '182 ч');
  assert.equal(formatHours(115.75), '115,8 ч');
  assert.equal(formatHours(0), '0 ч');
});

test('русские склонения', () => {
  assert.equal(plural(1, 'год', 'года', 'лет'), 'год');
  assert.equal(plural(2, 'год', 'года', 'лет'), 'года');
  assert.equal(plural(5, 'год', 'года', 'лет'), 'лет');
  assert.equal(plural(11, 'год', 'года', 'лет'), 'лет');
  assert.equal(plural(21, 'год', 'года', 'лет'), 'год');
  assert.equal(plural(112, 'год', 'года', 'лет'), 'лет');
  assert.equal(plural(122, 'год', 'года', 'лет'), 'года');
});

test('период выводится русским месяцем', () => {
  assert.equal(formatPeriod(2026, 8), 'август 2026');
  assert.equal(formatPeriod(2025, 12), 'декабрь 2025');
});

test('стаж учитывает число месяца, а не только месяц', () => {
  const now = new Date('2026-03-10T12:00:00Z');
  // 15 марта ещё не наступило, значит полных месяцев меньше.
  assert.equal(calcTenure('2025-03-15', now)?.years, 0);
  assert.equal(calcTenure('2025-03-15', now)?.months, 11);
  assert.equal(calcTenure('2025-03-05', now)?.years, 1);
});

test('стаж словами', () => {
  const now = new Date('2026-08-28T12:00:00Z');
  assert.equal(formatTenure('2023-06-28', now), '3 года 2 месяца');
  assert.equal(formatTenure('2025-08-28', now), '1 год');
  assert.equal(formatTenure('2026-08-20', now), 'менее месяца');
  assert.equal(formatTenure(null, now), 'нет данных');
});

test('дата из будущего не даёт отрицательный стаж', () => {
  const now = new Date('2026-08-28T12:00:00Z');
  assert.equal(formatTenure('2030-01-01', now), 'нет данных');
});

test('сколько осталось до поездки', () => {
  assert.equal(formatMonthsLeft(0), 'уже доступно');
  assert.equal(formatMonthsLeft(-3), 'уже доступно');
  assert.equal(formatMonthsLeft(14), '1 год 2 месяца');
  assert.equal(formatMonthsLeft(24), '2 года');
  assert.equal(formatMonthsLeft(5), '5 месяцев');
});
