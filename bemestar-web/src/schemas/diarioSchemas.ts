import { z } from "zod";
import { HUMORES_VALORES } from "../types/diario";

export const diarioSchema = z.object({
  humor: z.enum(HUMORES_VALORES),
  texto: z
    .string()
    .trim()
    .min(1, "Escreva algo antes de salvar")
    .max(5000, "Máximo de 5000 caracteres"),
});

export type DiarioFormData = z.infer<typeof diarioSchema>;