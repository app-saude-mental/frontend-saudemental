import type { ReactNode } from "react";

// Ilustrações em traço fino, na mesma linguagem da logo (círculo + folha).
// Usam currentColor no traço e --ilu-fundo no "halo" atrás, então funcionam
// nos temas claro e escuro sem cores fixas. São decorativas (aria-hidden).

export type NomeIlustracao =
  | "amanhecer"
  | "sol"
  | "lua"
  | "broto"
  | "caderno"
  | "ondas"
  | "conversa"
  | "capsula"
  | "folhas"
  | "pessoa"
  | "maos";

interface Props {
  nome: NomeIlustracao;
  tamanho?: number;
  className?: string;
}

export default function Ilustracao({ nome, tamanho = 120, className = "" }: Props) {
  return (
    <svg
      className={`ilustracao ${className}`}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* halo suave atrás de todas */}
      <circle cx="60" cy="60" r="50" fill="var(--ilu-fundo)" stroke="none" />
      {DESENHOS[nome]}
    </svg>
  );
}

const DESENHOS: Record<NomeIlustracao, ReactNode> = {
  // sol nascendo atrás de colinas
  amanhecer: (
    <>
      <path d="M38 74a22 22 0 0 1 44 0" fill="var(--ilu-destaque)" />
      <path d="M60 40v-8M41 47l-5-5M79 47l5-5M32 62h-7M88 62h7" />
      <path d="M18 80c12-8 22-8 32-2s20 6 30-1 18-6 22-2" />
      <path d="M26 90c10-4 18-4 26 0s18 4 28 0 14-3 16-1" opacity="0.6" />
    </>
  ),
  // sol pleno com nuvem
  sol: (
    <>
      <circle cx="54" cy="52" r="16" fill="var(--ilu-destaque)" />
      <path d="M54 26v-6M54 84v-6M28 52h-6M86 52h-6M36 34l-4-4M72 34l4-4M36 70l-4 4" />
      <path d="M62 86h30a10 10 0 0 0 0-20 14 14 0 0 0-27-2 9 9 0 0 0-3 22Z" fill="var(--ilu-fundo-forte)" />
    </>
  ),
  // lua crescente e estrelas
  lua: (
    <>
      <path d="M68 30a28 28 0 1 0 22 40 24 24 0 0 1-22-40Z" fill="var(--ilu-destaque)" />
      <path d="M34 34v6M31 37h6M86 30v4M84 32h4M30 76v4M28 78h4" />
      <circle cx="92" cy="50" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="40" cy="58" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  // broto saindo da terra (hábitos, crescimento)
  broto: (
    <>
      <path d="M30 86h60" />
      <path d="M40 92h40" opacity="0.5" />
      <path d="M60 86V56" />
      <path d="M60 64c-2-12-12-18-24-17 1 12 11 18 24 17Z" fill="var(--ilu-destaque)" />
      <path d="M60 58c3-13 14-20 27-18-2 13-13 19-27 18Z" fill="var(--ilu-destaque)" />
      <path d="M60 64l-12-9M60 58l13-9" opacity="0.7" />
    </>
  ),
  // caderno aberto com caneta (diário)
  caderno: (
    <>
      <path d="M60 40c-8-6-18-7-30-5v46c12-2 22-1 30 5 8-6 18-7 30-5V35c-12-2-22-1-30 5Z" fill="var(--ilu-fundo-forte)" />
      <path d="M60 40v46" />
      <path d="M38 50h14M38 58h14M38 66h10M68 50h14M68 58h10" opacity="0.7" />
      <path d="M84 70l10-22 4 2-10 22-5 3Z" fill="var(--ilu-destaque)" />
    </>
  ),
  // ondas e círculo (meditar, respirar)
  ondas: (
    <>
      <circle cx="60" cy="46" r="14" fill="var(--ilu-destaque)" />
      <path d="M22 70c8-6 15-6 22 0s15 6 22 0 15-6 22 0 10 5 12 3" />
      <path d="M22 80c8-6 15-6 22 0s15 6 22 0 15-6 22 0 10 5 12 3" opacity="0.7" />
      <path d="M30 90c7-5 13-5 19 0s13 5 19 0 13-5 19 0" opacity="0.45" />
    </>
  ),
  // dois balões de conversa com coração (dúvidas, enfermeiro)
  conversa: (
    <>
      <path d="M26 38h42a8 8 0 0 1 8 8v18a8 8 0 0 1-8 8H44l-10 9v-9h-8a8 8 0 0 1-8-8V46a8 8 0 0 1 8-8Z" fill="var(--ilu-fundo-forte)" />
      <path d="M58 60h34a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8h-4v8l-9-8H58a8 8 0 0 1-8-8" fill="var(--ilu-destaque)" />
      <path d="M47 51c-2-3-7-2-7 2 0 4 7 8 7 8s7-4 7-8c0-4-5-5-7-2Z" />
    </>
  ),
  // cápsula e folhinha (medicamentos)
  capsula: (
    <>
      <g transform="rotate(-35 60 60)">
        <rect x="34" y="48" width="52" height="24" rx="12" fill="var(--ilu-fundo-forte)" />
        <path d="M60 48v24" />
        <path d="M60 48h14a12 12 0 0 1 0 24H60Z" fill="var(--ilu-destaque)" />
      </g>
      <path d="M84 88c-1-8 4-14 12-15 1 8-4 14-12 15Z" />
      <path d="M84 88l6-7" opacity="0.7" />
      <circle cx="32" cy="34" r="2" fill="currentColor" stroke="none" opacity="0.5" />
    </>
  ),
  // ramo com folhas (dicas)
  folhas: (
    <>
      <path d="M36 92c10-20 24-38 50-58" />
      <path d="M52 70c-12-2-18-10-18-20 12 0 19 8 18 20Z" fill="var(--ilu-destaque)" />
      <path d="M62 58c2-12 10-19 21-19 0 12-9 19-21 19Z" fill="var(--ilu-destaque)" />
      <path d="M70 52c-10-6-12-15-8-24 9 5 12 14 8 24Z" fill="var(--ilu-fundo-forte)" />
      <path d="M46 80c-11 3-20-1-24-10 10-4 19 0 24 10Z" fill="var(--ilu-fundo-forte)" />
    </>
  ),
  // pessoa sentada meditando
  pessoa: (
    <>
      <circle cx="60" cy="38" r="8" fill="var(--ilu-destaque)" />
      <path d="M60 48c-9 0-14 7-14 17v6h28v-6c0-10-5-17-14-17Z" fill="var(--ilu-fundo-forte)" />
      <path d="M46 62l-10 10 10 4M74 62l10 10-10 4" />
      <path d="M32 84c10-6 46-6 56 0-10 5-46 5-56 0Z" fill="var(--ilu-destaque)" />
    </>
  ),
  // mãos acolhendo um coração (ajuda, cuidado)
  maos: (
    <>
      <path d="M60 58c-3-6-13-5-13 3 0 8 13 15 13 15s13-7 13-15c0-8-10-9-13-3Z" fill="var(--ilu-destaque)" />
      <path d="M24 72c8 0 14 4 20 10 4 4 10 6 16 6s12-2 16-6c6-6 12-10 20-10" />
      <path d="M24 72V60M96 72V60" opacity="0.6" />
    </>
  ),
};
