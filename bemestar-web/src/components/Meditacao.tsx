export default function Meditacao() {
  return (
    <svg className="med" viewBox="0 0 300 300" role="img" aria-label="Pessoa meditando">
      {/* aura */}
      <g className="aura">
        <circle cx="150" cy="140" r="112" fill="#ead8c0" />
        <circle cx="150" cy="140" r="84" fill="#f0e2cf" />
      </g>

      <ellipse className="sombra" cx="150" cy="262" rx="96" ry="9" fill="#5b4636" opacity="0.12" />

      <g className="pessoa">
        {/* pernas cruzadas */}
        <path
          d="M62 238 C80 208 120 212 150 226 C180 212 220 208 238 238 C215 262 180 258 150 246 C120 258 85 262 62 238Z"
          fill="#5aaf9c"
        />
        <path
          d="M110 240 C130 232 170 232 190 240"
          stroke="#3f9382"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        <g className="tronco">
          {/* corpo */}
          <path d="M112 140 C120 124 180 124 188 140 L196 226 C170 238 130 238 104 226 Z" fill="#e9a27a" />
          {/* braços e mãos */}
          <path d="M118 146 C96 172 92 202 104 226" stroke="#e9a27a" strokeWidth="16" fill="none" strokeLinecap="round" />
          <path d="M182 146 C204 172 208 202 196 226" stroke="#e9a27a" strokeWidth="16" fill="none" strokeLinecap="round" />
          <circle cx="104" cy="228" r="8" fill="#e3b08c" />
          <circle cx="196" cy="228" r="8" fill="#e3b08c" />
          {/* pescoço e cabeça */}
          <rect x="141" y="112" width="18" height="20" rx="8" fill="#d9a07c" />
          <circle cx="150" cy="96" r="25" fill="#e3b08c" />
          {/* cabelo */}
          <circle cx="150" cy="68" r="10" fill="#4a3728" />
          <path d="M124 96 C122 70 178 66 176 96 C168 84 132 84 124 96Z" fill="#4a3728" />
          {/* olhos fechados e sorriso */}
          <path d="M138 98 q5 4 10 0" stroke="#4a3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M152 98 q5 4 10 0" stroke="#4a3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M144 108 q6 5 12 0" stroke="#b5654a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      </g>

      {/* brilhos que sobem no hover */}
      <circle className="brilho b1" cx="70" cy="120" r="4" fill="#d9a441" />
      <circle className="brilho b2" cx="232" cy="100" r="3.5" fill="#5aaf9c" />
      <circle className="brilho b3" cx="205" cy="55" r="4" fill="#d9a441" />
    </svg>
  );
}