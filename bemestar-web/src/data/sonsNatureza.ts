// Catálogo da tela "Momento de paz" (Natureza anti-estresse).
// Os sons são gerados no navegador (src/audio); aqui ficam só os dados de interface.

export type SomId = "chuva" | "trovoada" | "passaros" | "rio" | "lareira" | "mar" | "noite";

interface SomInfo {
  id: SomId;
  rotulo: string; // texto curto do chip
  nome: string; // nome completo mostrado acima do tempo
}

export const SONS_NATUREZA: SomInfo[] = [
  { id: "chuva", rotulo: "Chuva", nome: "Chuva" },
  { id: "trovoada", rotulo: "Trovoada", nome: "Chuva com trovão" },
  { id: "passaros", rotulo: "Pássaros", nome: "Pássaros cantando de fundo" },
  { id: "rio", rotulo: "Rio", nome: "Rio" },
  { id: "lareira", rotulo: "Lareira", nome: "Lareira" },
  { id: "mar", rotulo: "Mar", nome: "Ondas do mar em ritmo lento" },
  { id: "noite", rotulo: "Noite", nome: "Grilos e cigarras noturnas" },
];

export const SOM_INICIAL: SomId = "chuva";

// Plano Gratuito: só estes dois. Os demais exigem o recurso SONS_COMPLETOS.
// Limite apenas de interface: os sons são gerados no navegador, sem passar pelo servidor.
export const SONS_GRATUITOS: SomId[] = ["chuva", "mar"];

export const DURACOES_MINUTOS = [5, 10, 15, 20];
export const DURACAO_PADRAO_MINUTOS = 10;

export const VOLUME_PADRAO = 60; // 0 a 100
