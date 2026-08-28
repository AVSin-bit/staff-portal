import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRole, hasAtLeast, navFor } from '../lib/roles';

test('роль определяется по должности из 1С', () => {
  assert.equal(resolveRole('Директор'), 'director');
  assert.equal(resolveRole('директор сети'), 'director');
  assert.equal(resolveRole('Управляющий'), 'manager');
  assert.equal(resolveRole('Управляющая салоном'), 'manager');
  assert.equal(resolveRole('Администратор'), 'admin');
  assert.equal(resolveRole('Старший администратор'), 'admin');
  assert.equal(resolveRole('Мастер'), 'master');
  assert.equal(resolveRole('Мастер-универсал'), 'master');
});

test('незнакомая или пустая должность даёт самый узкий доступ', () => {
  assert.equal(resolveRole(null), 'master');
  assert.equal(resolveRole(''), 'master');
  assert.equal(resolveRole('   '), 'master');
  assert.equal(resolveRole('Бариста'), 'master');
});

test('буква ё и регистр не меняют результат', () => {
  assert.equal(resolveRole('УПРАВЛЯЮЩАЯ'), 'manager');
  assert.equal(resolveRole('администратор-стажёр'), 'admin');
});

test('UUID в поле должности не даёт лишних прав', () => {
  // Именно из-за сравнения role_id (UUID) со строкой "master"
  // экраны администратора и управляющего показывали пустые списки.
  assert.equal(resolveRole('c7cb5d89-368a-4a2e-8e24-c79eb3b2119e'), 'master');
});

test('уровни доступа выстроены по возрастанию', () => {
  assert.equal(hasAtLeast('director', 'admin'), true);
  assert.equal(hasAtLeast('manager', 'admin'), true);
  assert.equal(hasAtLeast('admin', 'admin'), true);
  assert.equal(hasAtLeast('master', 'admin'), false);
  assert.equal(hasAtLeast('admin', 'manager'), false);
  assert.equal(hasAtLeast('manager', 'director'), false);
});

test('навигация не показывает чужих разделов', () => {
  const master = navFor('master').map((i) => i.href);
  assert.deepEqual(master, ['/dashboard', '/motivation']);

  const admin = navFor('admin').map((i) => i.href);
  assert.deepEqual(admin, ['/dashboard', '/motivation', '/admin']);

  const director = navFor('director').map((i) => i.href);
  assert.deepEqual(director, ['/dashboard', '/motivation', '/admin', '/manager', '/director']);
});
