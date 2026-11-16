import { z } from "zod";

export const perfilSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome").max(100, "Máximo de 100 caracteres"),
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail")
    .email("E-mail inválido")
    .max(255, "Máximo de 255 caracteres"),
});

export type PerfilFormData = z.infer<typeof perfilSchema>;