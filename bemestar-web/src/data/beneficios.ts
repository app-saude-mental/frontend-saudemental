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
  { texto: "Sons para meditar, dormir e focar", gratuito: "6 sons", assinante: "22 sons", paciente: "22 sons" },
  { texto: "Diário (emoções e humor)", gratuito: true, assinante: true, paciente: true },
  { texto: "Hábitos (checklist diário)", gratuito: true, assinante: true, paciente: true },
  { texto: "Dicas gerais de saúde mental", gratuito: true, assinante: true, paciente: true },
  { texto: "Medicamentos organizados por horário", gratuito: false, assinante: true, paciente: true },
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
