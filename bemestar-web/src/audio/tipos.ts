// Um som ambiente em execução. A "saida" é ligada pelo hook ao ganho da voz;
// "parar" interrompe fontes e agendadores e desconecta todos os nós criados.
export interface SomAmbiente {
  saida: AudioNode;
  parar(): void;
}

// Cada som é criado por uma fábrica. Para trocar um som gerado por um arquivo
// (ex.: public/sons/chuva.mp3), basta registrar outra fábrica com a mesma
// assinatura em FABRICAS (src/audio/sons.ts); a página e o hook não mudam.
export type FabricaSom = (ctx: AudioContext) => SomAmbiente;
