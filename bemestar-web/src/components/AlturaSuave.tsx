import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

// Anima a ALTURA do conteúdo quando ela muda (ex.: trocar o formulário curto de Entrar
// pelo longo de Criar conta), em vez de a caixa "pular". Mede com ResizeObserver.
export default function AlturaSuave({ children, className = "" }: { children: ReactNode; className?: string }) {
  const dentro = useRef<HTMLDivElement>(null);
  const [altura, setAltura] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = dentro.current;
    if (!el) return;
    const medir = () => setAltura(el.offsetHeight);
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className={`altura-suave ${className}`} style={altura === null ? undefined : { height: altura }}>
      <div ref={dentro}>{children}</div>
    </div>
  );
}
