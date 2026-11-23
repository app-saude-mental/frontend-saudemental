// Blocos de "água" para chuva, rio e cachoeira.
//
// Por que a chuva antiga soava como ruído: ela era quase só ruído contínuo filtrado,
// com "gotas" de ruído curtíssimas e baixas. O ouvido reconhece chuva pelos PINGOS:
// cada gota que cai na água faz um "plic" tonal com o tom SUBINDO rápido (a bolha de
// ar que se forma e vibra). Aqui cada gota é um tom curto com essa subida, mais um
// estalo de impacto, espalhados no estéreo e com um pouco de ambiente (reverberação).

import { aleatorio, type Coletor } from "./ruido";

// ---------- Ambiente (reverberação leve) ----------

// Resposta de impulso sintética: ruído estéreo decaindo exponencialmente, um pouco abafado.
function impulso(ctx: BaseAudioContext, segundos: number, decaimento: number): AudioBuffer {
  const n = Math.floor(ctx.sampleRate * segundos);
  const buf = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let canal = 0; canal < 2; canal++) {
    const d = buf.getChannelData(canal);
    let suave = 0;
    for (let i = 0; i < n; i++) {
      suave = suave * 0.6 + (Math.random() * 2 - 1) * 0.4; // passa-baixa simples: cauda menos "chiada"
      d[i] = suave * Math.pow(1 - i / n, decaimento);
    }
  }
  return buf;
}

// Entrada que toca seco + com ambiente. Tudo registrado no coletor (liberado em parar()).
export function sala(c: Coletor, segundos = 1.4, mistura = 0.28): GainNode {
  const { ctx } = c;
  const entrada = c.ganho(1);
  entrada.connect(c.saida);
  const conv = c.registrar(ctx.createConvolver());
  conv.buffer = impulso(ctx, segundos, 3);
  const molhado = c.ganho(mistura);
  entrada.connect(conv).connect(molhado).connect(c.saida);
  return entrada;
}

// ---------- Eventos ----------

function panDe(ctx: AudioContext, valor: number): StereoPannerNode | null {
  if (typeof ctx.createStereoPanner !== "function") return null;
  const p = ctx.createStereoPanner();
  p.pan.value = valor;
  return p;
}

export interface OpcoesGota {
  freq: number; // tom inicial (Hz)
  subida: number; // quanto o tom sobe (1.6 = 60%)
  duracao: number; // segundos
  ganho: number;
  pan: number;
  estalo?: number; // volume do impacto (0 = só o "plic")
}

// "Plic" de uma gota caindo na água. Desconecta tudo ao terminar.
export function gota(c: Coletor, destino: AudioNode, t: number, o: OpcoesGota) {
  const { ctx } = c;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(o.freq, t);
  osc.frequency.exponentialRampToValueAtTime(o.freq * o.subida, t + o.duracao * 0.7);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(o.ganho, t + 0.0015);
  env.gain.exponentialRampToValueAtTime(0.0001, t + o.duracao);

  const pan = panDe(ctx, o.pan);
  osc.connect(env);
  if (pan) env.connect(pan).connect(destino);
  else env.connect(destino);

  osc.start(t);
  osc.stop(t + o.duracao + 0.02);
  osc.onended = () => {
    osc.disconnect();
    env.disconnect();
    pan?.disconnect();
  };

  // impacto: um "tic" de ruído agudo bem curto junto com a gota
  const estalo = o.estalo ?? 0.35;
  if (estalo > 0) {
    c.rajada(t, {
      duracao: 0.004,
      ganho: o.ganho * estalo,
      filtro: "bandpass",
      freq: aleatorio(3000, 6000),
      q: 1.2,
      pan: o.pan,
      destino,
    });
  }
}

// Gota batendo em superfície dura (telhado, folha, janela): estalo seco + "toc" grave curto.
export function toque(c: Coletor, destino: AudioNode, t: number, o: { ganho: number; pan: number; grave: number }) {
  const { ctx } = c;
  c.rajada(t, {
    duracao: aleatorio(0.008, 0.018),
    ganho: o.ganho,
    filtro: "bandpass",
    freq: aleatorio(1200, 2600),
    q: 2.5,
    pan: o.pan,
    destino,
  });

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(o.grave, t);
  osc.frequency.exponentialRampToValueAtTime(o.grave * 0.7, t + 0.03);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(o.ganho * 0.6, t + 0.002);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
  const pan = panDe(ctx, o.pan);
  osc.connect(env);
  if (pan) env.connect(pan).connect(destino);
  else env.connect(destino);
  osc.start(t);
  osc.stop(t + 0.05);
  osc.onended = () => {
    osc.disconnect();
    env.disconnect();
    pan?.disconnect();
  };
}

// ---------- Receitas prontas ----------

export interface OpcoesChuva {
  nivel: number; // volume geral
  densidade: number; // 1 = chuva normal; <1 mais espaçada
  brilho: number; // 1 = normal; <1 gotas mais graves (chuva "escura", para dormir)
  fundo: number; // volume do chiado contínuo (o "longe")
}

// Chuva com pingos audíveis: fundo baixo + chuvisco de pingos finos + gotas próximas + gotas grandes.
export function chuva(c: Coletor, o: OpcoesChuva) {
  const ambiente = sala(c, 1.3, 0.3);

  // fundo: chuva distante, baixo e respirando devagar (antes era o som principal)
  const fundo = c.ganho(0.1 * o.fundo * o.nivel);
  c.lfo(0.06, 0.03 * o.fundo * o.nivel, fundo.gain);
  c.ruido("rosa")
    .connect(c.filtro("highpass", 500, 0.5))
    .connect(c.filtro("lowpass", 3500 * o.brilho + 1500, 0.5))
    .connect(fundo)
    .connect(c.saida);
  c.ruido("marrom").connect(c.filtro("lowpass", 220)).connect(c.ganho(0.05 * o.nivel)).connect(c.saida);

  // chuvisco: muitos pingos finos e baixos, bem espalhados (dá a textura de "muitas gotas")
  c.processo(0.05, (t) => {
    c.rajada(t, {
      duracao: aleatorio(0.003, 0.009),
      ganho: aleatorio(0.01, 0.035) * o.nivel,
      filtro: "bandpass",
      freq: aleatorio(2200, 6500) * (0.6 + 0.4 * o.brilho),
      q: 1.6,
      pan: aleatorio(-0.95, 0.95),
      destino: ambiente,
    });
    return aleatorio(0.012, 0.035) / o.densidade;
  });

  // gotas próximas: o "plic plic" que faz o ouvido reconhecer chuva
  c.processo(0.2, (t) => {
    gota(c, ambiente, t, {
      freq: aleatorio(1100, 2800) * o.brilho,
      subida: aleatorio(1.4, 2.3),
      duracao: aleatorio(0.025, 0.07),
      ganho: aleatorio(0.04, 0.12) * o.nivel,
      pan: aleatorio(-0.85, 0.85),
    });
    return aleatorio(0.04, 0.28) / o.densidade;
  });

  // de vez em quando uma gota maior e mais perto
  c.processo(1, (t) => {
    gota(c, ambiente, t, {
      freq: aleatorio(550, 1000) * o.brilho,
      subida: aleatorio(1.6, 2.4),
      duracao: aleatorio(0.08, 0.14),
      ganho: aleatorio(0.1, 0.17) * o.nivel,
      pan: aleatorio(-0.6, 0.6),
      estalo: 0.5,
    });
    return aleatorio(0.8, 3) / o.densidade;
  });
}

// Riacho: o "borbulhar" de um rio é um monte de bolhas pequenas (mesmo princípio da gota),
// bem densas e baixas, sobre a massa de água.
export function borbulhar(c: Coletor, o: { nivel: number; densidade: number; grave: number }) {
  const ambiente = sala(c, 0.9, 0.22);
  c.processo(0.05, (t) => {
    gota(c, ambiente, t, {
      freq: aleatorio(350, 1400) * o.grave,
      subida: aleatorio(1.25, 1.9),
      duracao: aleatorio(0.02, 0.06),
      ganho: aleatorio(0.012, 0.05) * o.nivel,
      pan: aleatorio(-0.8, 0.8),
      estalo: 0,
    });
    return aleatorio(0.008, 0.045) / o.densidade;
  });
}
