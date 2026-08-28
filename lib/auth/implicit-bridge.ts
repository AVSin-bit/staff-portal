// lib/auth/implicit-bridge.ts
// Мостик для implicit-флоу Supabase: токены приходят во фрагменте ссылки,
// а фрагмент браузер на сервер не отправляет. Эта страница перекладывает их
// в query и уходит на /auth/callback/hash, где ставится cookie-сессия.

export function implicitFlowBridgeHtml(next: string): string {
  const nextJson = JSON.stringify(next);

  return [
    '<!doctype html>',
    '<html lang="ru">',
    '<head><meta charset="utf-8"><title>Вход в портал</title></head>',
    '<body style="font-family:system-ui;padding:40px;text-align:center;color:#0f172a">',
    '<p>Завершаем вход…</p>',
    '<script>',
    '(function () {',
    '  var bad = "/?error=" + encodeURIComponent("Ссылка для входа неполная. Запросите новую.");',
    '  var hash = window.location.hash.substring(1);',
    '  if (!hash) { window.location.replace(bad); return; }',
    '  var p = new URLSearchParams(hash);',
    '  var at = p.get("access_token");',
    '  var rt = p.get("refresh_token");',
    '  if (!at || !rt) { window.location.replace(bad); return; }',
    '  var q = new URLSearchParams();',
    '  q.set("access_token", at);',
    '  q.set("refresh_token", rt);',
    '  q.set("next", ' + nextJson + ');',
    '  window.location.replace("/auth/callback/hash?" + q.toString());',
    '})();',
    '</script>',
    '</body>',
    '</html>',
  ].join('\n');
}
