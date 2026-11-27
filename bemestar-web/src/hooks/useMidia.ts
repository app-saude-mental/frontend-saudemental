import { useSyncExternalStore } from "react";

// true enquanto a media query casar (ex.: "(max-width: 820px)"); reage a girar/redimensionar
export function useMidia(consulta: string): boolean {
  return useSyncExternalStore(
    (avisar) => {
      const mq = window.matchMedia(consulta);
      mq.addEventListener("change", avisar);
      return () => mq.removeEventListener("change", avisar);
    },
    () => window.matchMedia(consulta).matches,
    () => false,
  );
}
