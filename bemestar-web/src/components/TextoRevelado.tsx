import { Fragment, type CSSProperties } from "react";

// Título que "sobe" palavra por palavra, cada uma saindo de trás de uma máscara.
// O texto continua inteiro para leitores de tela (aria-label no pai, palavras aria-hidden).
export default function TextoRevelado({ texto, atraso = 0 }: { texto: string; atraso?: number }) {
  const palavras = texto.split(/\s+/).filter(Boolean);
  return (
    <span className="texto-revelado" aria-label={texto} role="text">
      {palavras.map((p, i) => (
        // o espaço fica FORA do inline-block (dentro dele o navegador o descarta)
        <Fragment key={`${p}-${i}`}>
          <span className="palavra" aria-hidden="true">
            <span style={{ "--i": i, "--atraso": `${atraso}ms` } as CSSProperties}>{p}</span>
          </span>
          {i < palavras.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
