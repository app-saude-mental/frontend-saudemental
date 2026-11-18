import { z } from "zod";

export const medicamentoSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome").max(100, "Máximo de 100 caracteres"),
  dosagem: z.string().trim().min(1, "Informe a dosagem").max(100, "Máximo de 100 caracteres"),
  // <input type="time"> entrega "HH:mm", que é o que o back espera
  horas: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Informe um horário válido"),
});

export type MedicamentoFormData = z.infer<typeof medicamentoSchema>;
