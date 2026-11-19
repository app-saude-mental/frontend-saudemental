// Matriz de recursos por plano (mesma regra do back: PlanoEfetivoService).
// Só recursos que existem no app. true = incluso; false = não incluso; texto = incluso com detalhe.

export type Inclusao = boolean | string;

export interface Beneficio {
  texto: string;
  gratuito: Inclusao;
  assinante: Inclusao;
  paciente: Inclusao;
}

export const BENEFICIOS: Beneficio[] = [
  { texto: "Sons da natureza", gratuito: "2 sons", assinante: "7 sons", paciente: "7 sons" },
  { texto: "Diário (emoções e humor)", gratuito: true, assinante: true, paciente: true },
  { texto: "Hábitos (checklist diário)", gratuito: true, assinante: true, paciente: true },
  { texto: "Dicas gerais de saúde mental", gratuito: true, assinante: true, paciente: true },
  { texto: "Medicamentos (editar e organizar)", gratuito: false, assinante: false, paciente: true },
  { texto: "Dúvidas com resposta do enfermeiro", gratuito: false, assinante: false, paciente: true },
  { texto: "Orientações do seu enfermeiro", gratuito: false, assinante: false, paciente: true },
];

export function itensDoPlano(plano: "gratuito" | "assinante" | "paciente") {
  return BENEFICIOS.map((b) => {
    const valor = b[plano];
    return {
      texto: b.texto,
      incluso: valor !== false,
      detalhe: typeof valor === "string" ? valor : undefined,
    };
  });
}
