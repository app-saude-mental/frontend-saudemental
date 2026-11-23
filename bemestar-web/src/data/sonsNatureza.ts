// Catálogo da tela "Momento de paz": sons separados por categoria.
// Todos são gerados no navegador (src/audio); aqui ficam só os dados de interface.
// Para trocar um som por um MP3 real depois, basta mudar a fábrica dele em src/audio/sons.ts.

export type CategoriaId = "natureza" | "meditar" | "dormir" | "concentracao" | "sensorial";

export type SomId =
  // natureza
  | "chuva"
  | "trovoada"
  | "passaros"
  | "rio"
  | "lareira"
  | "mar"
  | "noite"
  | "vento"
  | "cachoeira"
  | "telhado"
  // meditar
  | "tigelas"
  | "drone"
  | "sinos"
  // dormir / insônia
  | "chuvaLenta"
  | "marromProfundo"
  | "deltaSono"
  // concentração
  | "piano"
  | "alfaFoco"
  | "fluxo"
  // ruído sensorial (cancelamento de ruído)
  | "ruidoBranco"
  | "ruidoRosa"
  | "ruidoMarrom";

export interface SomInfo {
  id: SomId;
  rotulo: string; // texto curto do chip
  nome: string; // nome completo mostrado no player
  fone?: boolean; // batida binaural: só funciona com fone de ouvido
}

export interface Categoria {
  id: CategoriaId;
  rotulo: string;
  descricao: string;
  sons: SomInfo[];
}

export const CATEGORIAS: Categoria[] = [
  {
    id: "natureza",
    rotulo: "Natureza",
    descricao: "Sons da natureza para aliviar o estresse.",
    sons: [
      { id: "chuva", rotulo: "Chuva", nome: "Chuva" },
      { id: "mar", rotulo: "Mar", nome: "Ondas do mar em ritmo lento" },
      { id: "trovoada", rotulo: "Trovoada", nome: "Chuva com trovão" },
      { id: "passaros", rotulo: "Pássaros", nome: "Pássaros cantando de fundo" },
      { id: "rio", rotulo: "Rio", nome: "Rio" },
      { id: "cachoeira", rotulo: "Cachoeira", nome: "Cachoeira" },
      { id: "vento", rotulo: "Vento", nome: "Vento nas árvores" },
      { id: "telhado", rotulo: "Chuva no telhado", nome: "Chuva no telhado" },
      { id: "lareira", rotulo: "Lareira", nome: "Lareira" },
      { id: "noite", rotulo: "Noite", nome: "Grilos e cigarras noturnas" },
    ],
  },
  {
    id: "meditar",
    rotulo: "Meditar",
    descricao: "Tons suaves para acompanhar a respiração.",
    sons: [
      { id: "tigelas", rotulo: "Tigelas", nome: "Tigelas tibetanas" },
      { id: "drone", rotulo: "Om", nome: "Tom contínuo (om)" },
      { id: "sinos", rotulo: "Sinos de vento", nome: "Sinos de vento" },
    ],
  },
  {
    id: "dormir",
    rotulo: "Dormir",
    descricao: "Para insônia: sons graves e lentos, sem surpresas.",
    sons: [
      { id: "chuvaLenta", rotulo: "Chuva lenta", nome: "Chuva lenta para dormir" },
      { id: "marromProfundo", rotulo: "Ruído profundo", nome: "Ruído marrom profundo" },
      { id: "deltaSono", rotulo: "Ondas delta", nome: "Ondas delta (sono profundo)", fone: true },
    ],
  },
  {
    id: "concentracao",
    rotulo: "Concentração",
    descricao: "Fundo calmo para estudar ou trabalhar.",
    sons: [
      { id: "piano", rotulo: "Piano ambiente", nome: "Piano ambiente" },
      { id: "fluxo", rotulo: "Fluxo", nome: "Atmosfera suave para foco" },
      { id: "alfaFoco", rotulo: "Ondas alfa", nome: "Ondas alfa (foco relaxado)", fone: true },
    ],
  },
  {
    id: "sensorial",
    rotulo: "Ruído sensorial",
    descricao:
      "Ruídos contínuos que abafam sons do ambiente. Sem nenhum som repentino: indicado para sensibilidade sensorial (como no autismo).",
    sons: [
      { id: "ruidoMarrom", rotulo: "Marrom", nome: "Ruído marrom (grave)" },
      { id: "ruidoRosa", rotulo: "Rosa", nome: "Ruído rosa (equilibrado)" },
      { id: "ruidoBranco", rotulo: "Branco", nome: "Ruído branco (agudo)" },
    ],
  },
];

export const TODOS_OS_SONS: SomInfo[] = CATEGORIAS.flatMap((c) => c.sons);

export function infoDoSom(id: SomId): SomInfo {
  return TODOS_OS_SONS.find((s) => s.id === id) ?? TODOS_OS_SONS[0];
}

export function categoriaDoSom(id: SomId): CategoriaId {
  return CATEGORIAS.find((c) => c.sons.some((s) => s.id === id))?.id ?? "natureza";
}

export const SOM_INICIAL: SomId = "chuva";

// Plano Gratuito: uma amostra de cada categoria. Os demais exigem o recurso SONS_COMPLETOS.
// Limite apenas de interface: os sons são gerados no navegador, sem passar pelo servidor.
export const SONS_GRATUITOS: SomId[] = ["chuva", "mar", "tigelas", "chuvaLenta", "piano", "ruidoMarrom"];

// null = sem limite (para deixar tocando enquanto navega ou para dormir)
export const DURACOES_MINUTOS: (number | null)[] = [5, 10, 15, 20, 30, 60, null];
export const DURACAO_PADRAO_MINUTOS = 10;

export const VOLUME_PADRAO = 60; // 0 a 100
