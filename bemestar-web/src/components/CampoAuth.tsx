import { useState, type InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> {
  id: string;
  rotulo: string;
  Icone: LucideIcon;
  tipo?: "text" | "email" | "password";
  erro?: string;
  registro: UseFormRegisterReturn; // retorno do register() do react-hook-form
}

// Campo do login/cadastro com rótulo flutuante: o rótulo fica dentro do campo e sobe
// quando a pessoa foca ou digita (truque do :placeholder-shown, sem JavaScript).
// Senha tem botão de mostrar/esconder. O erro fica ligado ao campo por aria-describedby.
export default function CampoAuth({ id, rotulo, Icone, tipo = "text", erro, registro, ...resto }: Props) {
  const [mostrar, setMostrar] = useState(false);
  const ehSenha = tipo === "password";
  const idErro = `${id}-erro`;

  return (
    <div className={`entrada-campo ${erro ? "invalido" : ""}`}>
      <div className="entrada-campo-caixa">
        <Icone size={18} className="entrada-campo-icone" aria-hidden="true" />
        <input
          id={id}
          type={ehSenha && mostrar ? "text" : tipo}
          placeholder=" "
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? idErro : undefined}
          {...resto}
          {...registro}
        />
        <label htmlFor={id}>{rotulo}</label>
        {ehSenha && (
          <button
            type="button"
            className="entrada-campo-olho"
            onClick={() => setMostrar((m) => !m)}
            aria-label={mostrar ? "Esconder senha" : "Mostrar senha"}
            aria-pressed={mostrar}
          >
            {mostrar ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      {erro && (
        <span id={idErro} className="entrada-campo-erro" role="alert">
          {erro}
        </span>
      )}
    </div>
  );
}
