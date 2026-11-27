import { useState, type InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { AlertCircle, Eye, EyeOff, type LucideIcon } from "lucide-react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> {
  id: string;
  rotulo: string;
  Icone: LucideIcon;
  tipo?: "text" | "email" | "password";
  erro?: string;
  dica?: string; // texto de apoio abaixo do campo
  registro: UseFormRegisterReturn; // retorno do register() do react-hook-form
}

// Campo da tela de entrada: rótulo acima, campo macio com ícone, mostrar/esconder senha
// e erro ligado ao campo (aria-describedby), com ícone para não depender só da cor.
export default function CampoAuth({ id, rotulo, Icone, tipo = "text", erro, dica, registro, ...resto }: Props) {
  const [mostrar, setMostrar] = useState(false);
  const ehSenha = tipo === "password";
  const idApoio = `${id}-apoio`;
  const temApoio = Boolean(erro || dica);

  return (
    <div className={`acesso-campo ${erro ? "invalido" : ""}`}>
      <label htmlFor={id} className="acesso-campo-rotulo">
        {rotulo}
      </label>
      <div className="acesso-campo-caixa">
        <Icone size={18} className="acesso-campo-icone" aria-hidden="true" />
        <input
          id={id}
          type={ehSenha && mostrar ? "text" : tipo}
          aria-invalid={erro ? true : undefined}
          aria-describedby={temApoio ? idApoio : undefined}
          {...resto}
          {...registro}
        />
        {ehSenha && (
          <button
            type="button"
            className="acesso-campo-olho"
            onClick={() => setMostrar((m) => !m)}
            aria-label={mostrar ? "Esconder senha" : "Mostrar senha"}
            aria-pressed={mostrar}
          >
            {mostrar ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      {erro ? (
        <span id={idApoio} className="acesso-campo-erro" role="alert">
          <AlertCircle size={14} aria-hidden="true" /> {erro}
        </span>
      ) : (
        dica && (
          <span id={idApoio} className="acesso-campo-dica">
            {dica}
          </span>
        )
      )}
    </div>
  );
}
