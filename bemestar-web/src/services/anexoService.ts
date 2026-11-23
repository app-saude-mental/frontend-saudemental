import { api } from "./api";
import type { Anexo } from "../types/duvida";

// Regras iguais às do back (DuvidaAnexoService); aqui servem para avisar antes de enviar.
export const MAX_ANEXOS = 3;
export const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB
export const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export function validarArquivo(arquivo: File): string | null {
  if (!TIPOS_ACEITOS.includes(arquivo.type)) return `"${arquivo.name}": envie JPG, PNG, WEBP ou PDF.`;
  if (arquivo.size === 0) return `"${arquivo.name}" está vazio.`;
  if (arquivo.size > TAMANHO_MAXIMO) return `"${arquivo.name}" passa de 5 MB.`;
  return null;
}

export function formatarTamanho(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

// multipart/form-data: o axios monta o cabeçalho com o "boundary" sozinho
export async function enviarAnexo(duvidaId: number, arquivo: File): Promise<Anexo> {
  const corpo = new FormData();
  corpo.append("arquivo", arquivo);
  const { data } = await api.post<Anexo>(`/duvidas/${duvidaId}/anexos`, corpo);
  return data;
}

export async function excluirAnexo(duvidaId: number, anexoId: number): Promise<void> {
  await api.delete(`/duvidas/${duvidaId}/anexos/${anexoId}`);
}

// O arquivo exige o token, então não dá para usar a URL direto num <img>/<a>:
// baixa como Blob (com o interceptor do api) e a tela cria uma URL local temporária.
export function urlDoAnexo(anexo: Anexo, comoAdmin: boolean) {
  return comoAdmin
    ? `/admin/duvidas/${anexo.duvidaId}/anexos/${anexo.id}`
    : `/duvidas/${anexo.duvidaId}/anexos/${anexo.id}`;
}

export async function baixarAnexo(url: string): Promise<Blob> {
  const { data } = await api.get<Blob>(url, { responseType: "blob" });
  return data;
}
