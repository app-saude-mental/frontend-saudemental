// Instalação do PWA. Importado cedo em main.tsx: o evento beforeinstallprompt pode chegar
// antes de a tela /instalar existir, então ele é guardado aqui.

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const EVENTO_INSTALACAO = "respire-instalacao";
export type Plataforma = "ios" | "android" | "windows" | "outra";

let eventoGuardado: BeforeInstallPromptEvent | null = null;

function notificar() {
  window.dispatchEvent(new Event(EVENTO_INSTALACAO));
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (evento) => {
    evento.preventDefault(); // guarda para mostrar o nosso botão "Instalar"
    eventoGuardado = evento as BeforeInstallPromptEvent;
    notificar();
  });
  window.addEventListener("appinstalled", () => {
    eventoGuardado = null;
    notificar();
  });
}

// Chrome/Edge no Android e no Windows oferecem o evento; Safari (iPhone) não
export function podeInstalar() {
  return eventoGuardado !== null;
}

export async function instalar(): Promise<boolean> {
  const evento = eventoGuardado;
  if (!evento) return false;
  await evento.prompt();
  const escolha = await evento.userChoice;
  eventoGuardado = null;
  notificar();
  return escolha.outcome === "accepted";
}

export function estaInstalado() {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return window.matchMedia("(display-mode: standalone)").matches || iosStandalone;
}

export function detectarPlataforma(): Plataforma {
  const ua = navigator.userAgent;
  // iPad recente se apresenta como Mac, mas tem toque
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Windows/i.test(ua)) return "windows";
  return "outra";
}
