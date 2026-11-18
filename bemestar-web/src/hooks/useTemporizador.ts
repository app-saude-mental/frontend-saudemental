import { useCallback, useEffect, useRef, useState } from "react";

// arredonda para cima ao segundo: "10:00" só vira "09:59" depois de 1 s
function emSegundosInteiros(ms: number) {
  return Math.ceil(ms / 1000) * 1000;
}

/**
 * Timer regressivo baseado no relógio (performance.now), não na contagem de
 * ticks: se o navegador atrasar os timers (aba em segundo plano), o tempo
 * exibido continua correto. onFim é chamado uma única vez ao zerar.
 */
export function useTemporizador(duracaoMs: number, onFim: () => void) {
  const [restanteMs, setRestanteMs] = useState(duracaoMs);
  const [rodando, setRodando] = useState(false);
  const relogio = useRef({ fimEm: 0, restante: duracaoMs, rodando: false, onFim });

  useEffect(() => {
    relogio.current.onFim = onFim;
  }, [onFim]);

  useEffect(() => {
    if (!rodando) return;
    const r = relogio.current;

    const atualizar = () => {
      if (!r.rodando) return;
      const resta = Math.max(0, r.fimEm - performance.now());
      r.restante = resta;
      setRestanteMs(emSegundosInteiros(resta)); // mesmo valor = sem novo render
      if (resta <= 0) {
        r.rodando = false;
        setRodando(false);
        r.onFim();
      }
    };

    const id = window.setInterval(atualizar, 250);
    document.addEventListener("visibilitychange", atualizar);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", atualizar);
    };
  }, [rodando]);

  const iniciar = useCallback(() => {
    const r = relogio.current;
    if (r.rodando || r.restante <= 0) return;
    r.fimEm = performance.now() + r.restante;
    r.rodando = true;
    setRodando(true);
  }, []);

  const pausar = useCallback(() => {
    const r = relogio.current;
    if (!r.rodando) return;
    r.restante = Math.max(0, r.fimEm - performance.now());
    r.rodando = false;
    setRestanteMs(emSegundosInteiros(r.restante));
    setRodando(false);
  }, []);

  const redefinir = useCallback((ms: number) => {
    const r = relogio.current;
    r.restante = ms;
    r.rodando = false;
    setRestanteMs(ms);
    setRodando(false);
  }, []);

  return { restanteMs, rodando, iniciar, pausar, redefinir };
}
