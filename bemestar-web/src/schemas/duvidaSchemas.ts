import { z } from "zod";

export const duvidaSchema = z.object({
  mensagem: z
    .string()
    .trim()
    .min(1, "Escreva sua dúvida")
    .max(1000, "Máximo de 1000 caracteres"),
});

export type DuvidaFormData = z.infer<typeof duvidaSchema>;
