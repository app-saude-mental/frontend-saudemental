import { createContext } from "react";
import type { LoginRequest, Recurso, Usuario } from "../types/auth";

export interface AuthContextData {
  usuario: Usuario | null;
  autenticado: boolean;
  // true enquanto a sessão salva é renovada em silêncio ao abrir o app
  inicializando: boolean;
  entrar: (dados: LoginRequest) => Promise<void>;
  entrarComGoogle: (idToken: string) => Promise<void>;
  atualizarUsuario: (usuario: Usuario) => void;
  sair: () => void;
  sairDeTodos: () => Promise<void>;
  // o plano efetivo do usuário libera o recurso? (só interface: o back valida de novo)
  pode: (recurso: Recurso) => boolean;
  ehAdmin: boolean;
  // renova o token e rebusca /usuarios/me: mostra mudança de plano sem novo login
  atualizarStatus: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData | undefined>(undefined);
