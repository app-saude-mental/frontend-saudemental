/* Service worker do Respire — escrito à mão, sem biblioteca.
 * Este arquivo é um MODELO: no build, o plugin em vite.config.ts preenche a versão e a
 * lista de arquivos (marcadores abaixo) e grava o resultado em dist/sw.js.
 * Ele não é carregado em desenvolvimento.
 *
 * Regras de privacidade (dados de saúde):
 * - Só guarda o "app shell" (index.html, manifest, ícones) e os arquivos do build (com hash).
 * - NUNCA intercepta a API (outra origem) nem requisições com Authorization.
 * - Só responde do cache o que está na lista exata do build.
 */
const VERSAO = "__VERSAO__";
const ARQUIVOS = __ARQUIVOS__;
const CACHE = `respire-${VERSAO}`;

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ARQUIVOS)));
  // não chama skipWaiting: numa atualização, a página mostra "Nova versão disponível"
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(chaves.filter((c) => c.startsWith("respire-") && c !== CACHE).map((c) => caches.delete(c))),
      )
      .then(() => self.clients.claim()),
  );
});

// a página pede para ativar a nova versão quando a pessoa clica em "Atualizar"
self.addEventListener("message", (evento) => {
  if (evento.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (evento) => {
  const requisicao = evento.request;
  if (requisicao.method !== "GET") return;

  const url = new URL(requisicao.url);
  if (url.origin !== self.location.origin) return; // API, Google, fontes externas: rede direta
  if (requisicao.headers.has("Authorization")) return; // defesa extra: nada autenticado passa pelo cache

  // navegação: rede primeiro; sem internet, abre o app a partir do shell em cache
  if (requisicao.mode === "navigate") {
    evento.respondWith(fetch(requisicao).catch(() => caches.match("/index.html")));
    return;
  }

  // arquivos do build (nomes com hash) e do shell: cache primeiro
  if (ARQUIVOS.includes(url.pathname)) {
    evento.respondWith(caches.match(requisicao).then((resposta) => resposta || fetch(requisicao)));
  }
});
