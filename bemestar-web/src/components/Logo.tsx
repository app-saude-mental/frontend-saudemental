// Marca do Respire: um círculo de traço fino (respiração, acolhimento) com uma folha
// simétrica no centro (cuidado, natureza). Usa currentColor: herda a cor do contexto.
export function LogoMarca({ tamanho = 32, className = "" }: { tamanho?: number; className?: string }) {
  return (
    <svg
      className={`logo-marca ${className}`}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="21.5" />
      <path d="M24 36.5C15.5 31 14 19.5 24 10.5c10 9 8.5 20.5 0 26Z" />
      <path d="M24 34.5V16" />
      <path d="M24 27.5l-4.6-3.9M24 22.5l4.2-3.6" />
    </svg>
  );
}

// Marca + nome. O nome usa a fonte de títulos (Cormorant Garamond).
export default function Logo({ tamanho = 32, className = "" }: { tamanho?: number; className?: string }) {
  return (
    <span className={`logo ${className}`}>
      <LogoMarca tamanho={tamanho} />
      <span className="logo-nome">Respire</span>
    </span>
  );
}
