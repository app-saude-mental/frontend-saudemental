// Sons "musicais" e ruídos do Momento de paz: meditar, dormir, concentração e ruído sensorial.
// Tudo gerado com Web Audio (sem arquivos, funciona offline). São paisagens e tons
// ambientes, não canções. Para trocar por um MP3 depois, substitua a fábrica do som.

import type { SomId } from "../data/sonsNatureza";
import { aleatorio, criarColetor, type Coletor } from "./ruido";
import type { FabricaSom } from "./tipos";

function fabrica(montar: (c: Coletor) => void): FabricaSom {
  return (ctx) => {
    const c = criarColetor(ctx);
    montar(c);
    return { saida: c.saida, parar: () => c.parar() };
  };
}

// Pentatônica maior de Dó (sem semitons: nenhuma combinação soa "errada")
const PENTATONICA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];

// Eco simples (delay com realimentação filtrada): dá sensação de sala sem pesar no processador.
function eco(c: Coletor, tempo: number, realimentacao: number, mistura: number): GainNode {
  const { ctx } = c;
  const entrada = c.ganho(1);
  const atraso = c.registrar(ctx.createDelay(2));
  atraso.delayTime.value = tempo;
  const volta = c.ganho(realimentacao);
  const abafa = c.filtro("lowpass", 2500);
  const molhado = c.ganho(mistura);
  entrada.connect(c.saida); // som direto
  entrada.connect(atraso);
  atraso.connect(abafa).connect(volta).connect(atraso); // repetições que vão sumindo
  abafa.connect(molhado).connect(c.saida);
  return entrada;
}

// Nota com parciais e decaimento exponencial (sino, tigela, piano suave).
// Desconecta a si mesma ao terminar, para não acumular nós.
function tocarNota(
  c: Coletor,
  destino: AudioNode,
  t: number,
  o: { freq: number; parciais: [number, number][]; ataque: number; duracao: number; ganho: number; pan: number },
) {
  const { ctx } = c;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(o.ganho, t + o.ataque);
  env.gain.exponentialRampToValueAtTime(0.0001, t + o.duracao);

  const pan = typeof ctx.createStereoPanner === "function" ? ctx.createStereoPanner() : null;
  if (pan) {
    pan.pan.value = o.pan;
    env.connect(pan).connect(destino);
  } else {
    env.connect(destino);
  }

  const oscs = o.parciais.map(([razao, nivel]) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = o.freq * razao;
    const g = ctx.createGain();
    g.gain.value = nivel;
    osc.connect(g).connect(env);
    osc.start(t);
    osc.stop(t + o.duracao + 0.05);
    return { osc, g };
  });
  oscs[0].osc.onended = () => {
    oscs.forEach(({ osc, g }) => {
      osc.disconnect();
      g.disconnect();
    });
    env.disconnect();
    pan?.disconnect();
  };
}

// Acorde contínuo e macio (pad), com respiração lenta no filtro e no volume.
function pad(c: Coletor, freqs: number[], o: { ganho: number; corte: number; tipo?: OscillatorType }) {
  const filtro = c.filtro("lowpass", o.corte, 0.5);
  c.lfo(0.03, o.corte * 0.35, filtro.frequency);
  const g = c.ganho(o.ganho);
  c.lfo(0.05, o.ganho * 0.25, g.gain);
  filtro.connect(g).connect(c.saida);
  freqs.forEach((f, i) => {
    // duas vozes levemente desafinadas por nota: som "vivo", sem ficar metálico
    for (const desvio of [-1.5, 1.5]) {
      const osc = c.oscilador(o.tipo ?? "triangle", f);
      osc.detune.value = desvio * (i + 1);
      osc.connect(c.ganho(1 / (freqs.length * 2))).connect(filtro);
    }
  });
}

// Batida binaural: um tom em cada ouvido com diferença de "batida" Hz. Só funciona com fone.
function binaural(c: Coletor, base: number, batida: number, ganho: number) {
  const nivel = c.ganho(ganho);
  nivel.connect(c.saida);
  c.oscilador("sine", base).connect(c.pan(-1)).connect(nivel);
  c.oscilador("sine", base + batida).connect(c.pan(1)).connect(nivel);
}

export const FABRICAS_MUSICAIS: Pick<
  Record<SomId, FabricaSom>,
  | "tigelas"
  | "drone"
  | "sinos"
  | "marromProfundo"
  | "deltaSono"
  | "piano"
  | "alfaFoco"
  | "fluxo"
  | "ruidoBranco"
  | "ruidoRosa"
  | "ruidoMarrom"
> = {
  // ---------- Meditar ----------

  // tigelas tibetanas: parciais inarmônicas típicas, ressonância longa
  tigelas: fabrica((c) => {
    const sala = eco(c, 0.45, 0.35, 0.4);
    const bases = [130.81, 146.83, 164.81, 196.0];
    c.processo(0.3, (t) => {
      tocarNota(c, sala, t, {
        freq: bases[Math.floor(Math.random() * bases.length)],
        parciais: [
          [1, 1],
          [1.006, 0.6], // batimento lento: o "uó-uó" da tigela
          [2.71, 0.35],
          [5.15, 0.12],
        ],
        ataque: 0.02,
        duracao: aleatorio(9, 13),
        ganho: aleatorio(0.12, 0.2),
        pan: aleatorio(-0.4, 0.4),
      });
      return aleatorio(7, 12);
    });
  }),

  // om: tom grave contínuo com quinta e oitava
  drone: fabrica((c) => {
    pad(c, [110, 164.81, 220], { ganho: 0.32, corte: 700, tipo: "sawtooth" });
    c.ruido("marrom").connect(c.filtro("lowpass", 250)).connect(c.ganho(0.05)).connect(c.saida);
  }),

  // sinos de vento: notas agudas esparsas da pentatônica sobre um vento leve
  sinos: fabrica((c) => {
    const vento = c.ganho(0.05);
    c.lfo(0.06, 0.03, vento.gain);
    c.ruido("rosa").connect(c.filtro("bandpass", 700, 0.6)).connect(vento).connect(c.saida);
    const sala = eco(c, 0.3, 0.3, 0.3);
    c.processo(0.5, (t) => {
      const quantas = Math.random() < 0.3 ? 2 : 1;
      for (let i = 0; i < quantas; i++) {
        tocarNota(c, sala, t + i * aleatorio(0.08, 0.25), {
          freq: PENTATONICA[5 + Math.floor(Math.random() * 5)] * 2,
          parciais: [
            [1, 1],
            [2.76, 0.25],
            [5.4, 0.08],
          ],
          ataque: 0.004,
          duracao: aleatorio(2.5, 4.5),
          ganho: aleatorio(0.03, 0.07),
          pan: aleatorio(-0.8, 0.8),
        });
      }
      return aleatorio(0.8, 3.5);
    });
  }),

  // ---------- Dormir ----------

  marromProfundo: fabrica((c) => {
    c.ruido("marrom").connect(c.filtro("lowpass", 380, 0.5)).connect(c.ganho(0.6)).connect(c.saida);
  }),

  // ondas delta (2 Hz) sobre um pad grave e um sopro de ruído marrom
  deltaSono: fabrica((c) => {
    binaural(c, 100, 2, 0.1);
    pad(c, [65.41, 98.0], { ganho: 0.18, corte: 320 });
    c.ruido("marrom").connect(c.filtro("lowpass", 300)).connect(c.ganho(0.12)).connect(c.saida);
  }),

  // ---------- Concentração ----------

  // piano ambiente: notas suaves e espaçadas da pentatônica, com eco
  piano: fabrica((c) => {
    const sala = eco(c, 0.38, 0.4, 0.45);
    c.processo(0.4, (t) => {
      const raiz = Math.floor(Math.random() * 6);
      const notas = Math.random() < 0.25 ? [raiz, raiz + 2] : [raiz]; // às vezes um intervalo
      notas.forEach((n, i) =>
        tocarNota(c, sala, t + i * 0.12, {
          freq: PENTATONICA[Math.min(n, PENTATONICA.length - 1)],
          parciais: [
            [1, 1],
            [2, 0.3],
            [3, 0.1],
            [4, 0.05],
          ],
          ataque: 0.008,
          duracao: aleatorio(3, 5),
          ganho: aleatorio(0.06, 0.1),
          pan: aleatorio(-0.5, 0.5),
        }),
      );
      return aleatorio(1.4, 3.6);
    });
  }),

  // ondas alfa (10 Hz): foco relaxado, com ruído rosa baixo de fundo
  alfaFoco: fabrica((c) => {
    binaural(c, 200, 10, 0.08);
    c.ruido("rosa").connect(c.filtro("lowpass", 3000)).connect(c.ganho(0.1)).connect(c.saida);
  }),

  // atmosfera de foco: acorde aberto e macio + ruído rosa bem baixo
  fluxo: fabrica((c) => {
    pad(c, [130.81, 196.0, 329.63, 392.0], { ganho: 0.22, corte: 900 });
    c.ruido("rosa").connect(c.filtro("lowpass", 2000)).connect(c.ganho(0.06)).connect(c.saida);
  }),

  // ---------- Ruído sensorial ----------
  // Contínuos e sem nenhum evento repentino. Ganhos ajustados para volume percebido parecido.

  ruidoBranco: fabrica((c) => {
    // passa-baixa alto só tira o "chiado" mais áspero
    c.ruido("branco").connect(c.filtro("lowpass", 9000, 0.5)).connect(c.ganho(0.14)).connect(c.saida);
  }),

  ruidoRosa: fabrica((c) => {
    c.ruido("rosa").connect(c.ganho(0.3)).connect(c.saida);
  }),

  ruidoMarrom: fabrica((c) => {
    c.ruido("marrom").connect(c.filtro("lowpass", 1000, 0.5)).connect(c.ganho(0.5)).connect(c.saida);
  }),
};
