// Blocos básicos dos sons gerados: buffers de ruído em loop sem emenda,
// agendador com "lookahead" no relógio do áudio e um coletor que registra
// tudo o que é criado para poder liberar ao parar.

export type TipoRuido = "branco" | "rosa" | "marrom";

const SEGUNDOS_BUFFER = 10;
const SEGUNDOS_EMENDA = 0.05; // crossfade interno que esconde o ponto do loop
const LOOKAHEAD_SEGUNDOS = 2; // quanto à frente os eventos são agendados
const INTERVALO_AGENDADOR_MS = 200;

export function aleatorio(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// ---------- Geração dos buffers ----------

function gerarAmostras(tipo: TipoRuido, n: number): Float32Array {
  const dados = new Float32Array(n);

  if (tipo === "branco") {
    for (let i = 0; i < n; i++) dados[i] = Math.random() * 2 - 1;
  } else if (tipo === "rosa") {
    // filtro de Paul Kellet
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      dados[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
      b6 = w * 0.115926;
    }
  } else {
    // marrom: integração com vazamento
    let ultimo = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      ultimo = (ultimo + 0.02 * w) / 1.02;
      dados[i] = ultimo;
    }
  }

  // remove o nível DC e normaliza o pico
  let soma = 0;
  for (let i = 0; i < n; i++) soma += dados[i];
  const media = soma / n;
  let pico = 0;
  for (let i = 0; i < n; i++) {
    dados[i] -= media;
    pico = Math.max(pico, Math.abs(dados[i]));
  }
  const fator = pico > 0 ? 0.95 / pico : 1;
  for (let i = 0; i < n; i++) dados[i] *= fator;

  return dados;
}

function criarBuffer(ctx: BaseAudioContext, tipo: TipoRuido): AudioBuffer {
  const taxa = ctx.sampleRate;
  const n = Math.floor(SEGUNDOS_BUFFER * taxa);
  const emenda = Math.floor(SEGUNDOS_EMENDA * taxa);
  const bruto = gerarAmostras(tipo, n + emenda);

  // O início do buffer recebe uma mistura (potência igual) com as amostras que
  // vêm logo depois do fim. Assim, ao voltar do fim para o início, o sinal
  // continua exatamente de onde parou: sem clique no loop.
  const dados = new Float32Array(n);
  dados.set(bruto.subarray(0, n));
  for (let i = 0; i < emenda; i++) {
    const x = i / emenda;
    dados[i] = bruto[i] * Math.sin((x * Math.PI) / 2) + bruto[n + i] * Math.cos((x * Math.PI) / 2);
  }

  const buffer = ctx.createBuffer(1, n, taxa);
  buffer.getChannelData(0).set(dados);
  return buffer;
}

const cacheBuffers = new WeakMap<BaseAudioContext, Record<TipoRuido, AudioBuffer>>();

function buffersDo(ctx: BaseAudioContext): Record<TipoRuido, AudioBuffer> {
  let buffers = cacheBuffers.get(ctx);
  if (!buffers) {
    buffers = {
      branco: criarBuffer(ctx, "branco"),
      rosa: criarBuffer(ctx, "rosa"),
      marrom: criarBuffer(ctx, "marrom"),
    };
    cacheBuffers.set(ctx, buffers);
  }
  return buffers;
}

// ---------- Coletor ----------

export interface OpcoesRajada {
  tipo?: TipoRuido;
  duracao: number;
  ganho: number;
  filtro: BiquadFilterType;
  freq: number;
  q?: number;
  pan?: number;
  ataque?: number;
  destino?: AudioNode;
}

export interface Coletor {
  readonly ctx: AudioContext;
  readonly saida: GainNode;
  buffer(tipo: TipoRuido): AudioBuffer;
  ruido(tipo: TipoRuido): AudioBufferSourceNode;
  oscilador(tipo: OscillatorType, freq: number): OscillatorNode;
  lfo(freq: number, profundidade: number, alvo: AudioParam): OscillatorNode;
  filtro(tipo: BiquadFilterType, freq: number, q?: number): BiquadFilterNode;
  ganho(valor: number): GainNode;
  pan(valor: number): AudioNode;
  rajada(t: number, opcoes: OpcoesRajada): void;
  processo(atrasoInicial: number, evento: (t: number) => number): void;
  parar(): void;
}

function criarPan(ctx: AudioContext, valor: number): AudioNode {
  if (typeof ctx.createStereoPanner === "function") {
    const p = ctx.createStereoPanner();
    p.pan.value = valor;
    return p;
  }
  return ctx.createGain(); // sem suporte a pan: segue em mono
}

export function criarColetor(ctx: AudioContext): Coletor {
  const buffers = buffersDo(ctx);
  const saida = ctx.createGain();
  const nos: AudioNode[] = [saida];
  const fontes: AudioScheduledSourceNode[] = [];
  const intervalos: number[] = [];
  let parado = false;

  function registrar<T extends AudioNode>(no: T): T {
    nos.push(no);
    return no;
  }

  function iniciarFonte<T extends AudioScheduledSourceNode>(fonte: T, offset?: number): T {
    registrar(fonte);
    fontes.push(fonte);
    if (fonte instanceof AudioBufferSourceNode) fonte.start(ctx.currentTime, offset ?? 0);
    else fonte.start(ctx.currentTime);
    return fonte;
  }

  return {
    ctx,
    saida,

    buffer: (tipo) => buffers[tipo],

    ruido(tipo) {
      const fonte = ctx.createBufferSource();
      fonte.buffer = buffers[tipo];
      fonte.loop = true;
      // offset aleatório: camadas do mesmo ruído não ficam em fase
      return iniciarFonte(fonte, Math.random() * SEGUNDOS_BUFFER * 0.9);
    },

    oscilador(tipo, freq) {
      const osc = ctx.createOscillator();
      osc.type = tipo;
      osc.frequency.value = freq;
      return iniciarFonte(osc);
    },

    lfo(freq, profundidade, alvo) {
      const osc = ctx.createOscillator();
      osc.frequency.value = freq;
      const g = registrar(ctx.createGain());
      g.gain.value = profundidade;
      osc.connect(g).connect(alvo);
      return iniciarFonte(osc);
    },

    filtro(tipo, freq, q = 0.7) {
      const f = registrar(ctx.createBiquadFilter());
      f.type = tipo;
      f.frequency.value = freq;
      f.Q.value = q;
      return f;
    },

    ganho(valor) {
      const g = registrar(ctx.createGain());
      g.gain.value = valor;
      return g;
    },

    pan(valor) {
      return registrar(criarPan(ctx, valor));
    },

    // Evento curto de ruído filtrado (gota, estalo...). Não é registrado:
    // desconecta a si mesmo ao terminar, para não acumular nós.
    rajada(t, o) {
      const tipo = o.tipo ?? "branco";
      const fonte = ctx.createBufferSource();
      fonte.buffer = buffers[tipo];
      const f = ctx.createBiquadFilter();
      f.type = o.filtro;
      f.frequency.value = o.freq;
      f.Q.value = o.q ?? 1;
      const g = ctx.createGain();
      const ataque = o.ataque ?? Math.min(0.002, o.duracao / 3);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(o.ganho, 0.0002), t + ataque);
      g.gain.exponentialRampToValueAtTime(0.0001, t + o.duracao);

      fonte.connect(f).connect(g);
      let ultimo: AudioNode = g;
      let pan: AudioNode | null = null;
      if (o.pan !== undefined) {
        pan = criarPan(ctx, o.pan);
        g.connect(pan);
        ultimo = pan;
      }
      ultimo.connect(o.destino ?? saida);

      const offset = Math.random() * Math.max(0, SEGUNDOS_BUFFER - o.duracao - 0.1);
      fonte.start(t, offset);
      fonte.stop(t + o.duracao + 0.05);
      fonte.onended = () => {
        fonte.disconnect();
        f.disconnect();
        g.disconnect();
        pan?.disconnect();
      };
    },

    // Agendador: "evento" agenda algo no instante t (relógio do áudio) e
    // devolve quantos segundos até o próximo. Eventos são agendados com
    // LOOKAHEAD_SEGUNDOS de antecedência, o que tolera timers atrasados
    // (ex.: aba em segundo plano).
    processo(atrasoInicial, evento) {
      let t = ctx.currentTime + atrasoInicial;
      const tick = () => {
        if (parado) return;
        const limite = ctx.currentTime + LOOKAHEAD_SEGUNDOS;
        while (t < limite) {
          if (t < ctx.currentTime) t = ctx.currentTime + 0.02; // atrasou: não agenda no passado
          t += Math.max(0.005, evento(t));
        }
      };
      tick();
      intervalos.push(window.setInterval(tick, INTERVALO_AGENDADOR_MS));
    },

    parar() {
      if (parado) return;
      parado = true;
      intervalos.forEach((id) => window.clearInterval(id));
      for (const fonte of fontes) {
        try {
          fonte.stop();
        } catch {
          // já parada
        }
      }
      nos.forEach((no) => no.disconnect());
    },
  };
}
