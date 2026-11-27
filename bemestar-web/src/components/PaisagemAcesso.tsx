// Paisagem da tela de entrada: amanhecer num lago entre colinas (à noite, no tema escuro, vira lua).
// Só SVG + CSS: as animações mexem apenas em transform/opacity (leve até em celular simples).
// As cores vêm de variáveis CSS (acesso.css), então o mesmo desenho serve de dia e de noite.

// pinheiro estilizado com a base em (x, y) e altura proporcional a "escala"
function pinheiro(x: number, y: number, escala: number) {
  const s = escala;
  return `M${x} ${y - 120 * s} l${-20 * s} ${44 * s} h${12 * s} l${-18 * s} ${34 * s} h${12 * s} l${-20 * s} ${42 * s} h${92 * s} l${-20 * s} ${-42 * s} h${12 * s} l${-18 * s} ${-34 * s} h${12 * s} Z`;
}

const PINHEIROS_ESQ = [
  [70, 842, 1.15],
  [150, 830, 0.9],
  [215, 846, 1.3],
  [300, 858, 0.8],
] as const;
const PINHEIROS_DIR = [
  [1330, 836, 1.05],
  [1410, 822, 1.35],
  [1490, 832, 0.95],
  [1560, 818, 1.2],
] as const;

export default function PaisagemAcesso() {
  return (
    <div className="paisagem" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice" className="paisagem-svg" focusable="false">
        <defs>
          <linearGradient id="ceu-a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--ceu-1)" />
            <stop offset="0.55" stopColor="var(--ceu-2)" />
            <stop offset="1" stopColor="var(--ceu-3)" />
          </linearGradient>
          <linearGradient id="ceu-b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--ceu-b1)" />
            <stop offset="0.6" stopColor="var(--ceu-b2)" />
            <stop offset="1" stopColor="var(--ceu-b3)" />
          </linearGradient>
          <radialGradient id="brilho-sol">
            <stop offset="0" stopColor="var(--sol-brilho)" stopOpacity="0.85" />
            <stop offset="0.45" stopColor="var(--sol-brilho)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--sol-brilho)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lago" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--lago-1)" />
            <stop offset="1" stopColor="var(--lago-2)" />
          </linearGradient>
          <radialGradient id="neblina-grad">
            <stop offset="0" stopColor="var(--neblina)" stopOpacity="1" />
            <stop offset="1" stopColor="var(--neblina)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* céu: duas camadas que se alternam (Entrar = amanhecer, Criar conta = manhã) */}
        <rect className="pa-ceu" width="1600" height="1000" fill="url(#ceu-a)" />
        <rect className="pa-ceu pa-ceu-b" width="1600" height="1000" fill="url(#ceu-b)" />

        {/* estrelas (só aparecem à noite) */}
        <g className="pa-estrelas" fill="var(--estrela)">
          {[
            [140, 120, 1.6], [260, 230, 1.1], [420, 90, 1.4], [610, 180, 1], [760, 60, 1.5],
            [880, 210, 1.1], [1010, 110, 1.7], [1180, 70, 1.2], [1300, 190, 1.4], [1460, 110, 1.1],
            [1540, 260, 1.5], [350, 330, 1], [980, 320, 1.2], [1220, 300, 1],
          ].map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
          ))}
        </g>

        {/* sol (ou lua): nasce ao abrir a tela e o brilho "respira" a cada 8 s */}
        <g className="pa-sol">
          <g className="pa-sol-nasce">
            <circle className="pa-sol-brilho" cx="820" cy="610" r="380" fill="url(#brilho-sol)" />
            <circle className="pa-sol-disco" cx="820" cy="610" r="86" fill="var(--sol)" />
          </g>
        </g>

        {/* pássaros ao longe */}
        <g className="pa-passaros" fill="none" stroke="var(--passaro)" strokeWidth="2.2" strokeLinecap="round">
          <path d="M0 0 q8 -8 16 0 q8 -8 16 0" />
          <path d="M44 -18 q6 -6 12 0 q6 -6 12 0" />
          <path d="M70 10 q5 -5 10 0 q5 -5 10 0" />
        </g>

        {/* montanhas ao fundo */}
        <path
          className="pa-camada pa-longe"
          fill="var(--monte-1)"
          d="M0 640 C 120 560 220 520 340 560 S 560 470 700 520 S 920 600 1040 545 S 1260 450 1380 520 S 1540 590 1600 560 V 1000 H 0 Z"
        />

        {/* neblina que passa devagar entre as camadas */}
        <ellipse className="pa-neblina" cx="500" cy="700" rx="640" ry="70" fill="url(#neblina-grad)" />
        <ellipse className="pa-neblina pa-neblina-2" cx="1200" cy="728" rx="560" ry="54" fill="url(#neblina-grad)" />

        {/* colinas do meio */}
        <path
          className="pa-camada pa-meio"
          fill="var(--monte-2)"
          d="M0 722 C 160 664 300 650 460 690 S 760 760 920 702 S 1220 640 1380 690 S 1560 732 1600 712 V 1000 H 0 Z"
        />

        {/* lago com o reflexo do sol tremulando */}
        <rect className="pa-camada pa-lago" x="0" y="762" width="1600" height="238" fill="url(#lago)" />
        <g className="pa-reflexo">
          <rect x="745" y="770" width="150" height="4" rx="2" fill="var(--sol)" opacity="0.7" />
          <rect x="761" y="790" width="118" height="4" rx="2" fill="var(--sol)" opacity="0.6" />
          <rect x="774" y="810" width="92" height="4" rx="2" fill="var(--sol)" opacity="0.55" />
          <rect x="785" y="832" width="70" height="4" rx="2" fill="var(--sol)" opacity="0.45" />
          <rect x="795" y="856" width="50" height="4" rx="2" fill="var(--sol)" opacity="0.38" />
          <rect x="804" y="882" width="32" height="4" rx="2" fill="var(--sol)" opacity="0.3" />
          <rect x="811" y="910" width="18" height="4" rx="2" fill="var(--sol)" opacity="0.22" />
        </g>

        {/* margens com pinheiros (primeiro plano) */}
        <g className="pa-camada pa-perto" fill="var(--monte-3)">
          <path d="M0 818 C 140 778 260 790 380 832 S 560 906 610 1000 H 0 Z" />
          <path d="M1600 800 C 1480 780 1360 800 1260 852 S 1120 950 1080 1000 H 1600 Z" />
          {PINHEIROS_ESQ.map(([x, y, s]) => (
            <path key={`e${x}`} d={pinheiro(x, y, s)} fill="var(--arvore)" />
          ))}
          {PINHEIROS_DIR.map(([x, y, s]) => (
            <path key={`d${x}`} d={pinheiro(x, y, s)} fill="var(--arvore)" />
          ))}
        </g>
      </svg>
    </div>
  );
}
