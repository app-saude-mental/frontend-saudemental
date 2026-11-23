// Receitas de todos os sons do "Momento de paz", gerados com Web Audio API.
// Natureza e chuva ficam aqui; meditar, concentração e ruídos em sonsMusicais.ts.
// Cada fábrica monta seu grafo num Coletor, que libera tudo em parar().

import type { SomId } from "../data/sonsNatureza";
import { aleatorio, criarColetor, type Coletor } from "./ruido";
import { FABRICAS_MUSICAIS } from "./sonsMusicais";
import type { FabricaSom } from "./tipos";

function fabrica(montar: (c: Coletor) => void): FabricaSom {
  return (ctx) => {
    const c = criarColetor(ctx);
    montar(c);
    return { saida: c.saida, parar: () => c.parar() };
  };
}

// Nota tonal curta (canto de pássaro). Desconecta a si mesma ao terminar.
function nota(
  c: Coletor,
  t: number,
  o: { f0: number; f1: number; duracao: number; ganho: number; pan: number; vibrato: number },
) {
  const { ctx } = c;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(o.f0, t);
  osc.frequency.exponentialRampToValueAtTime(o.f1, t + o.duracao);

  const vib = ctx.createOscillator();
  vib.frequency.value = aleatorio(20, 30);
  const vibGanho = ctx.createGain();
  vibGanho.gain.value = o.vibrato;
  vib.connect(vibGanho).connect(osc.frequency);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(o.ganho, t + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, t + o.duracao);

  // sem suporte a StereoPanner: a nota segue em mono
  const pan = typeof ctx.createStereoPanner === "function" ? ctx.createStereoPanner() : null;
  if (pan) pan.pan.value = o.pan;

  osc.connect(env);
  if (pan) env.connect(pan).connect(c.saida);
  else env.connect(c.saida);
  osc.start(t);
  vib.start(t);
  osc.stop(t + o.duracao + 0.02);
  vib.stop(t + o.duracao + 0.02);
  osc.onended = () => {
    osc.disconnect();
    vib.disconnect();
    vibGanho.disconnect();
    env.disconnect();
    pan?.disconnect();
  };
}

// ---------- 1. Chuva ----------
function camadasChuva(c: Coletor, nivel: number) {
  // corpo da chuva
  const corpo = c.ruido("rosa");
  const gCorpo = c.ganho(0.32 * nivel);
  corpo
    .connect(c.filtro("highpass", 400, 0.5))
    .connect(c.filtro("lowpass", 7000, 0.5))
    .connect(gCorpo)
    .connect(c.saida);

  // chiado que oscila devagar
  const chiado = c.ruido("branco");
  const gChiado = c.ganho(0.08 * nivel);
  c.lfo(0.07, 0.012 * nivel, gChiado.gain);
  chiado.connect(c.filtro("bandpass", 3500, 0.8)).connect(gChiado).connect(c.saida);

  // gotas isoladas
  c.processo(0.1, (t) => {
    c.rajada(t, {
      duracao: aleatorio(0.005, 0.015),
      ganho: aleatorio(0.02, 0.07) * nivel,
      filtro: "bandpass",
      freq: aleatorio(2000, 6000),
      q: 2,
      pan: aleatorio(-0.8, 0.8),
    });
    return aleatorio(0.02, 0.09);
  });
}

// ---------- 2. Chuva com trovão ----------
function trovao(c: Coletor, t: number) {
  const { ctx } = c;
  const distante = Math.random() < 0.5;
  const pico = distante ? 0.25 : 0.55; // limitado para não assustar
  const duracao = aleatorio(4, 7);

  const fonte = ctx.createBufferSource();
  fonte.buffer = c.buffer("marrom");

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.Q.value = 0.7;
  lp.frequency.setValueAtTime(distante ? 150 : 220, t);
  lp.frequency.exponentialRampToValueAtTime(distante ? 70 : 90, t + duracao);

  // 2 a 4 "estalos" no começo, depois decaimento longo
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  const picos = Math.floor(aleatorio(2, 5));
  const janela = aleatorio(0.3, 0.8);
  for (let i = 0; i < picos; i++) {
    const v = pico * aleatorio(0.6, 1);
    g.gain.exponentialRampToValueAtTime(v, t + (janela * (i + 0.5)) / picos);
    if (i < picos - 1) g.gain.exponentialRampToValueAtTime(v * 0.45, t + (janela * (i + 1)) / picos);
  }
  g.gain.exponentialRampToValueAtTime(0.0001, t + duracao);

  fonte.connect(lp).connect(g).connect(c.saida);
  const offset = Math.random() * Math.max(0, fonte.buffer.duration - duracao - 0.1);
  fonte.start(t, offset);
  fonte.stop(t + duracao + 0.05);
  fonte.onended = () => {
    fonte.disconnect();
    lp.disconnect();
    g.disconnect();
  };
}

// ---------- 3. Pássaros ----------
const ESPECIES = [
  // trinado
  { fMin: 2800, fMax: 4200, notas: [3, 6], duracao: [0.06, 0.11], pausa: [0.07, 0.14], fator: 1.25 },
  // assobio descendente
  { fMin: 2000, fMax: 3200, notas: [2, 3], duracao: [0.12, 0.2], pausa: [0.15, 0.3], fator: 0.75 },
  // piado agudo
  { fMin: 3800, fMax: 5000, notas: [3, 5], duracao: [0.04, 0.07], pausa: [0.05, 0.09], fator: 1.15 },
];

function frasePassaro(c: Coletor, t: number) {
  const e = ESPECIES[Math.floor(Math.random() * ESPECIES.length)];
  const pan = aleatorio(-0.7, 0.7);
  const ganho = aleatorio(0.03, 0.09); // alguns mais distantes
  const base = aleatorio(e.fMin, e.fMax);
  const total = Math.floor(aleatorio(e.notas[0], e.notas[1] + 1));
  let tn = t;
  for (let i = 0; i < total; i++) {
    const duracao = aleatorio(e.duracao[0], e.duracao[1]);
    const f0 = base * aleatorio(0.95, 1.05);
    nota(c, tn, { f0, f1: f0 * e.fator, duracao, ganho, pan, vibrato: aleatorio(50, 150) });
    tn += duracao + aleatorio(e.pausa[0], e.pausa[1]);
  }
}

// ---------- 6. Mar ----------
interface CamadaOnda {
  lp: BiquadFilterNode;
  ganho: GainNode;
  espuma: GainNode;
}

function onda(camada: CamadaOnda, t: number, duracao: number) {
  const crista = t + duracao * 0.45;
  const fim = t + duracao;
  const forca = aleatorio(0.7, 1);

  camada.ganho.gain.setValueAtTime(0.02, t);
  camada.ganho.gain.linearRampToValueAtTime(0.5 * forca, crista);
  camada.ganho.gain.linearRampToValueAtTime(0.02, fim);

  camada.lp.frequency.setValueAtTime(300, t);
  camada.lp.frequency.exponentialRampToValueAtTime(1800, crista);
  camada.lp.frequency.exponentialRampToValueAtTime(300, fim);

  camada.espuma.gain.setValueAtTime(0, t);
  camada.espuma.gain.linearRampToValueAtTime(0, crista - 1);
  camada.espuma.gain.linearRampToValueAtTime(0.05 * forca, crista + 0.4);
  camada.espuma.gain.linearRampToValueAtTime(0, crista + 2.5);
}

// ---------- Fábricas ----------
export const FABRICAS: Record<SomId, FabricaSom> = {
  ...FABRICAS_MUSICAIS,

  chuva: fabrica((c) => camadasChuva(c, 1)),

  // chuva escura e lenta para dormir: sem chiado agudo, poucas gotas e graves
  chuvaLenta: fabrica((c) => {
    const corpo = c.ganho(0.34);
    c.lfo(0.04, 0.05, corpo.gain);
    c.ruido("rosa").connect(c.filtro("lowpass", 1800, 0.5)).connect(corpo).connect(c.saida);
    c.ruido("marrom").connect(c.filtro("lowpass", 300)).connect(c.ganho(0.12)).connect(c.saida);
    c.processo(0.4, (t) => {
      c.rajada(t, {
        tipo: "rosa",
        duracao: aleatorio(0.02, 0.05),
        ganho: aleatorio(0.01, 0.03),
        filtro: "bandpass",
        freq: aleatorio(700, 1600),
        q: 1.5,
        pan: aleatorio(-0.7, 0.7),
      });
      return aleatorio(0.12, 0.4);
    });
  }),

  // chuva batendo no telhado: corpo médio + "tocs" graves e frequentes
  telhado: fabrica((c) => {
    camadasChuva(c, 0.55);
    c.processo(0.1, (t) => {
      c.rajada(t, {
        duracao: aleatorio(0.01, 0.03),
        ganho: aleatorio(0.03, 0.09),
        filtro: "bandpass",
        freq: aleatorio(600, 1500),
        q: 3,
        pan: aleatorio(-0.9, 0.9),
      });
      return aleatorio(0.03, 0.12);
    });
  }),

  // vento: ruído rosa num filtro que "sopra" devagar, com rajadas suaves
  vento: fabrica((c) => {
    for (const [lado, taxa] of [
      [-0.5, 0.05],
      [0.5, 0.07],
    ] as const) {
      const bp = c.filtro("bandpass", 500, 0.8);
      c.lfo(taxa, 300, bp.frequency);
      const g = c.ganho(0.22);
      c.lfo(taxa * 1.6, 0.12, g.gain);
      c.ruido("rosa").connect(bp).connect(g).connect(c.pan(lado)).connect(c.saida);
    }
    // folhas: chiado agudo bem baixo
    const folhas = c.ganho(0.02);
    c.lfo(0.11, 0.012, folhas.gain);
    c.ruido("branco").connect(c.filtro("highpass", 5000)).connect(folhas).connect(c.saida);
  }),

  // cachoeira: massa de água constante e cheia, com brilho leve
  cachoeira: fabrica((c) => {
    c.ruido("marrom").connect(c.filtro("lowpass", 1200)).connect(c.ganho(0.45)).connect(c.saida);
    c.ruido("rosa").connect(c.filtro("lowpass", 4500)).connect(c.ganho(0.22)).connect(c.saida);
    const brilho = c.ganho(0.05);
    c.lfo(0.3, 0.015, brilho.gain);
    c.ruido("branco").connect(c.filtro("bandpass", 3000, 0.6)).connect(brilho).connect(c.saida);
  }),

  trovoada: fabrica((c) => {
    camadasChuva(c, 0.9);
    c.processo(aleatorio(4, 10), (t) => {
      trovao(c, t);
      return aleatorio(15, 35);
    });
  }),

  passaros: fabrica((c) => {
    // leito de folhagem/vento bem baixo
    const leito = c.ganho(0.035);
    c.lfo(0.05, 0.01, leito.gain);
    c.ruido("rosa").connect(c.filtro("lowpass", 1500)).connect(leito).connect(c.saida);

    c.processo(0.5, (t) => {
      frasePassaro(c, t);
      return aleatorio(1, 4);
    });
  }),

  rio: fabrica((c) => {
    // massa de água
    c.ruido("marrom").connect(c.filtro("lowpass", 900)).connect(c.ganho(0.4)).connect(c.saida);

    // borbulhar: duas camadas com LFOs de taxas diferentes, uma de cada lado
    const camadas: [number, number, number][] = [
      [-0.4, 0.13, 0.21],
      [0.4, 0.17, 0.27],
    ];
    for (const [lado, taxaFreq, taxaGanho] of camadas) {
      const bp = c.filtro("bandpass", aleatorio(1200, 2000), 0.7);
      c.lfo(taxaFreq, 300, bp.frequency);
      const g = c.ganho(0.06);
      c.lfo(taxaGanho, 0.025, g.gain);
      c.ruido("branco").connect(bp).connect(g).connect(c.pan(lado)).connect(c.saida);
    }
  }),

  lareira: fabrica((c) => {
    // rumor do fogo
    const rumor = c.ganho(0.25);
    c.lfo(0.3, 0.05, rumor.gain);
    c.ruido("marrom").connect(c.filtro("lowpass", 400)).connect(rumor).connect(c.saida);

    // estalos (intervalos com distribuição exponencial, média ~150 ms)
    c.processo(0.1, (t) => {
      c.rajada(t, {
        duracao: aleatorio(0.002, 0.02),
        ganho: aleatorio(0.03, 0.15),
        filtro: "highpass",
        freq: aleatorio(1500, 3000),
        q: 0.7,
        pan: aleatorio(-0.5, 0.5),
      });
      return Math.min(1.2, -Math.log(1 - Math.random()) * 0.15);
    });

    // "pops" mais fortes e espaçados
    c.processo(1, (t) => {
      c.rajada(t, {
        duracao: aleatorio(0.01, 0.04),
        ganho: aleatorio(0.15, 0.3),
        filtro: "bandpass",
        freq: aleatorio(800, 1500),
        q: 1.5,
        pan: aleatorio(-0.5, 0.5),
      });
      return aleatorio(2, 6);
    });
  }),

  mar: fabrica((c) => {
    // fundo grave contínuo
    c.ruido("marrom").connect(c.filtro("lowpass", 200)).connect(c.ganho(0.08)).connect(c.saida);

    // duas camadas alternadas: ondas consecutivas se sobrepõem sem disputar o mesmo parâmetro
    const camadas: CamadaOnda[] = [-0.3, 0.3].map((lado) => {
      const pan = c.pan(lado);
      pan.connect(c.saida);

      const lp = c.filtro("lowpass", 300);
      const ganho = c.ganho(0.02);
      c.ruido("rosa").connect(lp).connect(ganho).connect(pan);

      const espuma = c.ganho(0);
      c.ruido("branco").connect(c.filtro("highpass", 4000)).connect(espuma).connect(pan);

      return { lp, ganho, espuma };
    });

    let indice = 0;
    c.processo(0.05, (t) => {
      const duracao = aleatorio(9, 13);
      onda(camadas[indice % 2], t, duracao);
      indice++;
      return duracao * 0.75; // a próxima começa antes desta terminar
    });
  }),

  noite: fabrica((c) => {
    // tudo passa por um passa-baixa final: noite "suave"
    const suave = c.filtro("lowpass", 7000);
    suave.connect(c.saida);

    // ar noturno
    c.ruido("marrom").connect(c.filtro("lowpass", 400)).connect(c.ganho(0.06)).connect(suave);

    // cigarras ao longe: ruído estreito com tremolo rápido e ondulação lenta
    const cigarras = c.ganho(0.04);
    c.lfo(40, 0.02, cigarras.gain);
    c.lfo(0.05, 0.015, cigarras.gain);
    c.ruido("branco").connect(c.filtro("bandpass", 5500, 8)).connect(cigarras).connect(suave);

    // grilos: cada um com tom, ritmo, lado e volume próprios
    const quantidade = Math.random() < 0.5 ? 2 : 3;
    for (let i = 0; i < quantidade; i++) {
      const ganhoGrilo = aleatorio(0.02, 0.05);
      const periodo = aleatorio(0.6, 1.2);
      const pulso = c.ganho(0);
      c.oscilador("sine", aleatorio(4200, 4800)).connect(pulso).connect(c.pan(aleatorio(-0.8, 0.8))).connect(suave);

      c.processo(aleatorio(0.2, 1.5), (t) => {
        const pulsos = Math.floor(aleatorio(3, 6));
        for (let k = 0; k < pulsos; k++) {
          const tk = t + k * 0.03;
          pulso.gain.setValueAtTime(0, tk);
          pulso.gain.linearRampToValueAtTime(ganhoGrilo, tk + 0.004);
          pulso.gain.linearRampToValueAtTime(0, tk + 0.015);
        }
        // de vez em quando o grilo descansa
        const descanso = Math.random() < 0.1 ? aleatorio(2, 5) : 0;
        return periodo * aleatorio(0.85, 1.15) + descanso;
      });
    }
  }),
};
