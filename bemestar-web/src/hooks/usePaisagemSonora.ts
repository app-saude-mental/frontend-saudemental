import { useCallback, useEffect, useRef, useState } from "react";
import { FABRICAS } from "../audio/sons";
import type { SomAmbiente } from "../audio/tipos";
import type { SomId } from "../data/sonsNatureza";

const FADE_ENTRADA = 1.5;
const FADE_TROCA = 1.5;
const FADE_PAUSA = 0.8;
const FADE_FIM = 3;

export const MENSAGEM_SEM_SUPORTE =
  "Seu navegador não permite reproduzir os sons. Tente outro navegador.";
const MENSAGEM_FALHA = "Não foi possível iniciar o som. Tente novamente.";

type ConstrutorAudio = typeof AudioContext;

function obterConstrutor(): ConstrutorAudio | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as typeof window & { webkitAudioContext?: ConstrutorAudio };
  return w.AudioContext ?? w.webkitAudioContext;
}

// volume 0–100 → ganho com curva perceptiva e teto de segurança
function ganhoDoVolume(volume: number) {
  const v = Math.min(100, Math.max(0, volume)) / 100;
  return v * v * 0.8;
}

// Rampa que aproxima uma curva de potência igual (dois trechos lineares).
// Lê o valor atual antes de cancelar, para não dar salto se outra rampa estava em andamento.
function rampa(param: AudioParam, ctx: AudioContext, alvo: number, duracao: number) {
  const agora = ctx.currentTime;
  const atual = param.value;
  const meio = alvo > atual ? atual + (alvo - atual) * 0.707 : alvo + (atual - alvo) * 0.707;
  param.cancelScheduledValues(agora);
  param.setValueAtTime(atual, agora);
  param.linearRampToValueAtTime(meio, agora + duracao / 2);
  param.linearRampToValueAtTime(alvo, agora + duracao);
}

interface Voz {
  som: SomAmbiente;
  ganho: GainNode;
}

interface EstadoAudio {
  ctx: AudioContext | null;
  mestre: GainNode | null;
  voz: Voz | null;
  saindo: Set<Voz>;
  timeouts: Set<number>;
  suspensao: number | null;
  volume: number;
}

function liberarVoz(voz: Voz) {
  voz.som.parar();
  voz.ganho.disconnect();
}

/**
 * Gerencia o áudio da tela "Momento de paz": cria o AudioContext só após um
 * clique (política de autoplay), controla volume, crossfade entre sons, fades
 * de pausa/fim e libera tudo ao sair da página.
 */
export function usePaisagemSonora(volumeInicial: number) {
  const [suportado] = useState(() => obterConstrutor() !== undefined);
  const [erro, setErro] = useState<string | null>(null);
  const audio = useRef<EstadoAudio>({
    ctx: null,
    mestre: null,
    voz: null,
    saindo: new Set(),
    timeouts: new Set(),
    suspensao: null,
    volume: volumeInicial,
  });

  const depois = useCallback((ms: number, acao: () => void) => {
    const e = audio.current;
    const id = window.setTimeout(() => {
      e.timeouts.delete(id);
      acao();
    }, ms);
    e.timeouts.add(id);
    return id;
  }, []);

  const cancelarSuspensao = useCallback(() => {
    const e = audio.current;
    if (e.suspensao !== null) {
      window.clearTimeout(e.suspensao);
      e.timeouts.delete(e.suspensao);
      e.suspensao = null;
    }
  }, []);

  const criarVoz = useCallback((ctx: AudioContext, mestre: GainNode, id: SomId): Voz => {
    const ganho = ctx.createGain();
    ganho.gain.value = 0;
    ganho.connect(mestre);
    const som = FABRICAS[id](ctx);
    som.saida.connect(ganho);
    return { som, ganho };
  }, []);

  const retirarVoz = useCallback(
    (voz: Voz, duracao: number) => {
      const e = audio.current;
      if (!e.ctx) return;
      rampa(voz.ganho.gain, e.ctx, 0, duracao);
      e.saindo.add(voz);
      depois(duracao * 1000 + 100, () => {
        liberarVoz(voz);
        e.saindo.delete(voz);
      });
    },
    [depois],
  );

  // Deve ser chamado dentro de um clique. Retorna false se não conseguiu tocar.
  const tocar = useCallback(
    async (id: SomId) => {
      setErro(null);
      const Construtor = obterConstrutor();
      if (!Construtor) {
        setErro(MENSAGEM_SEM_SUPORTE);
        return false;
      }

      const e = audio.current;
      try {
        if (!e.ctx || !e.mestre) {
          const ctx = new Construtor();
          const limitador = ctx.createDynamicsCompressor();
          limitador.threshold.value = -12;
          limitador.knee.value = 6;
          limitador.ratio.value = 12;
          limitador.attack.value = 0.003;
          limitador.release.value = 0.25;
          const mestre = ctx.createGain();
          mestre.gain.value = ganhoDoVolume(e.volume);
          mestre.connect(limitador).connect(ctx.destination);
          e.ctx = ctx;
          e.mestre = mestre;
        }

        const ctx = e.ctx;
        const mestre = e.mestre;
        cancelarSuspensao();
        if (ctx.state !== "running") await ctx.resume();
        if (audio.current.ctx !== ctx) return false; // a página foi fechada durante o resume

        if (e.voz) retirarVoz(e.voz, 0.3);
        const voz = criarVoz(ctx, mestre, id);
        rampa(voz.ganho.gain, ctx, 1, FADE_ENTRADA);
        e.voz = voz;
        return true;
      } catch {
        setErro(MENSAGEM_FALHA);
        return false;
      }
    },
    [cancelarSuspensao, criarVoz, retirarVoz],
  );

  // Crossfade para outro som; só tem efeito se algo estiver tocando.
  const trocar = useCallback(
    (id: SomId) => {
      const e = audio.current;
      if (!e.ctx || !e.mestre || !e.voz) return;
      const nova = criarVoz(e.ctx, e.mestre, id);
      rampa(nova.ganho.gain, e.ctx, 1, FADE_TROCA);
      retirarVoz(e.voz, FADE_TROCA);
      e.voz = nova;
    },
    [criarVoz, retirarVoz],
  );

  const silenciar = useCallback(
    (duracao: number) => {
      const e = audio.current;
      if (!e.ctx || !e.voz) return;
      retirarVoz(e.voz, duracao);
      e.voz = null;
      cancelarSuspensao();
      // depois do fade, suspende o contexto para não gastar CPU/bateria
      e.suspensao = depois(duracao * 1000 + 150, () => {
        e.suspensao = null;
        if (!e.voz && e.ctx?.state === "running") void e.ctx.suspend().catch(() => undefined);
      });
    },
    [cancelarSuspensao, depois, retirarVoz],
  );

  const pausar = useCallback(() => silenciar(FADE_PAUSA), [silenciar]);
  const encerrar = useCallback(() => silenciar(FADE_FIM), [silenciar]);

  const definirVolume = useCallback((volume: number) => {
    const e = audio.current;
    e.volume = volume;
    if (!e.ctx || !e.mestre) return;
    const agora = e.ctx.currentTime;
    e.mestre.gain.cancelScheduledValues(agora);
    e.mestre.gain.setTargetAtTime(ganhoDoVolume(volume), agora, 0.08);
  }, []);

  // Libera tudo ao sair da página. Em StrictMode este cleanup roda uma vez
  // antes de qualquer clique: como nada foi criado ainda, não há o que liberar.
  useEffect(() => {
    const e = audio.current;
    return () => {
      e.timeouts.forEach((id) => window.clearTimeout(id));
      e.timeouts.clear();
      e.suspensao = null;
      if (e.voz) liberarVoz(e.voz);
      e.voz = null;
      e.saindo.forEach(liberarVoz);
      e.saindo.clear();
      const ctx = e.ctx;
      e.ctx = null;
      e.mestre = null;
      if (ctx) void ctx.close().catch(() => undefined);
    };
  }, []);

  return { suportado, erro, tocar, trocar, pausar, encerrar, definirVolume };
}
