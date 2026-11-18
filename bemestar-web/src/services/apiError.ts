import { isAxiosError } from "axios";
import type { ErrorResponse, ValidationErrorResponse } from "../types/auth";

export function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) return "Erro inesperado. Tente novamente.";
  if (!error.response) return "Não foi possível conectar ao servidor.";

  const data = error.response.data as Partial<ErrorResponse & ValidationErrorResponse>;
  return data?.mensagem ?? "Erro inesperado. Tente novamente.";
}