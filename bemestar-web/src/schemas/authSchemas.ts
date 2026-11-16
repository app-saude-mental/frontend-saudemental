import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha"),
});

export const cadastroSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(1, "Informe o nome")
      .max(100, "Máximo de 100 caracteres"),
    email: z.string().min(1, "Informe o e-mail").email("E-mail inválido").max(255),
    senha: z
      .string()
      .min(6, "A senha deve ter no mínimo 6 caracteres")
      .max(72, "A senha deve ter no máximo 72 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme a senha"),
    aceitouTermos: z.boolean().refine((v) => v, "É necessário aceitar os termos"),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    path: ["confirmarSenha"],
    message: "As senhas não conferem",
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type CadastroFormData = z.infer<typeof cadastroSchema>;