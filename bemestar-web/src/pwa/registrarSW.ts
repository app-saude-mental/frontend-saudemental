// Registro do service worker (só no build de produção) e aviso de nova versão.

export const EVENTO_NOVA_VERSAO = "respire-nova-versao";

let aguardando: ServiceWorker | null = null;

export function existeNovaVersao() {
  return aguardando !== null;
}

// a pessoa clicou em "Atualizar": o novo service worker assume e a página recarrega
export function aplicarNovaVersao() {
  aguardando?.postMessage("SKIP_WAITING");
}

function avisar(sw: ServiceWorker) {
  aguardando = sw;
  window.dispatchEvent(new Event(EVENTO_NOVA_VERSAO));
}

export function registrarServiceWorker() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  // só recarrega numa troca de versão (na primeira instalação ainda não havia controlador)
  const tinhaControlador = navigator.serviceWorker.controller !== null;
  let recarregou = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!tinhaControlador || recarregou) return;
    recarregou = true;
    window.location.reload();
  });

  window.addEventListener("load", async () => {
    try {
      const registro = await navigator.serviceWorker.register("/sw.js");

      if (registro.waiting && navigator.serviceWorker.controller) avisar(registro.waiting);
      registro.addEventListener("updatefound", () => {
        const novo = registro.installing;
        if (!novo) return;
        novo.addEventListener("statechange", () => {
          if (novo.state === "installed" && navigator.serviceWorker.controller) avisar(novo);
        });
      });

      // procura atualização sempre que o app volta para a frente
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") registro.update().catch(() => undefined);
      });
    } catch {
      // sem service worker o app funciona normalmente (só não abre offline)
    }
  });
}
