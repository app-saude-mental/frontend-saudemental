import { isAxiosError } from "axios";
import type { ErrorResponse, ValidationErrorResponse } from "../types/auth";

// código de negócio do ErrorDTO (ex.: "CONTA_JA_EXISTE"), ou null
export function getErrorCode(error: unknown): string | null {
  if (!isAxiosError(error) || !error.response) return null;
  const data = error.response.data as Partial<ErrorResponse> & { codigo?: string };
  return data?.codigo ?? null;
}

export function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) return "Erro inesperado. Tente novamente.";
  if (!error.response) return "Não foi possível conectar ao servidor.";

  const data = error.response.data as Partial<ErrorResponse & ValidationErrorResponse>;
  return data?.mensagem ?? "Erro inesperado. Tente novamente.";
}