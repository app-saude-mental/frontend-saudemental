import { createContext } from "react";
import type { LoginRequest, Usuario } from "../types/auth";




export interface AuthContextData {
  usuario: Usuario | null;
  autenticado: boolean;
  entrar: (dados: LoginRequest) => Promise<void>;
  entrarComGoogle: (idToken: string) => Promise<void>;
  atualizarUsuario: (usuario: Usuario) => void;
  sair: () => void;
}

export const AuthContext = createContext<AuthContextData | undefined>(undefined);