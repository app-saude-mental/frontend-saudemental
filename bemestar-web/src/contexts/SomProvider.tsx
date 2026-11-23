import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./useAuth";
import { SomContext, type EstadoSom, type SomContextData } from "./somContext";
import {
  DURACAO_PADRAO_MINUTOS,
  SOM_INICIAL,
  SONS_GRATUITOS,
  VOLUME_PADRAO,
  type SomId,
} from "../data/sonsNatureza";
import { usePaisagemSonora } from "../hooks/usePaisagemSonora";
import { useTemporizador } from "../hooks/useTemporizador";

const MS_POR_MINUTO = 60_000;

/**
 * Motor de som do app inteiro. Fica acima das rotas (main.tsx), então o som
 * continua tocando quando a pessoa sai da tela Meditar; o MiniPlayer do
 * AppLayout controla de qualquer tela. No logout, tudo para.
 */
export function SomProvider({ children }: { children: ReactNode }) {
  const { usuario, pode } = useAuth();
  const usuarioId = usuario?.id ?? null;

  const audio = usePaisagemSonora(VOLUME_PADRAO);
  const { encerrar, pausar: pausarAudio, tocar, trocar, definirVolume } = audio;

  const [somEscolhido, setSomEscolhido] = useState<SomId>(SOM_INICIAL);
  const [estado, setEstado] = useState<EstadoSom>("parado");
  const [iniciando, setIniciando] = useState(false);
  const [volume, setVolume] = useState(VOLUME_PADRAO);
  const [duracaoMin, setDuracaoMin] = useState<number | null>(DURACAO_PADRAO_MINUTOS);
  const [ciclo, setCiclo] = useState(0);

  // Gratuito: uma amostra por categoria. Limite de interface (os sons são gerados no navegador).
  const todosLiberados = pode("SONS_COMPLETOS");
  const somLiberado = useCallback(
    (id: SomId) => todosLiberados || SONS_GRATUITOS.includes(id),
    [todosLiberados],
  );
  // se o plano mudou e o som escolhido ficou bloqueado, volta ao som inicial
  const somId = somLiberado(somEscolhido) ? somEscolhido : SOM_INICIAL;

  const aoTerminar = useCallback(() => {
    encerrar();
    setEstado("concluido");
  }, [encerrar]);

  const timer = useTemporizador(DURACAO_PADRAO_MINUTOS * MS_POR_MINUTO, aoTerminar);
  const { iniciar, pausar: pausarTimer, redefinir } = timer;

  // Troca de conta (logout/login): o estado volta ao início, ajustado durante o render
  // (padrão do React para "resetar estado quando uma prop muda", sem effect).
  const [donoAtual, setDonoAtual] = useState(usuarioId);
  if (donoAtual !== usuarioId) {
    setDonoAtual(usuarioId);
    setEstado("parado");
    setSomEscolhido(SOM_INICIAL);
  }

  // ...e o áudio/timer (efeitos colaterais) param aqui
  useEffect(() => {
    encerrar();
    redefinir(DURACAO_PADRAO_MINUTOS * MS_POR_MINUTO);
  }, [usuarioId, encerrar, redefinir]);

  // o som bloqueado deixou de tocar (plano venceu/foi suspenso enquanto tocava)
  const somBloqueado = !somLiberado(somEscolhido);
  useEffect(() => {
    if (somBloqueado) {
      encerrar();
      pausarTimer();
    }
  }, [somBloqueado, encerrar, pausarTimer]);
  if (somBloqueado && estado === "tocando") setEstado("parado");

  const alternar = useCallback(async () => {
    if (iniciando) return;

    if (estado === "tocando") {
      pausarAudio();
      pausarTimer();
      setEstado("pausado");
      return;
    }

    const retomando = estado === "pausado";
    if (!retomando) redefinir((duracaoMin ?? DURACAO_PADRAO_MINUTOS) * MS_POR_MINUTO);

    setIniciando(true);
    const ok = await tocar(somId);
    setIniciando(false);
    if (!ok) return;

    if (duracaoMin !== null) iniciar(); // "sem limite": o timer não corre
    setCiclo((c) => c + 1);
    setEstado("tocando");
  }, [iniciando, estado, pausarAudio, pausarTimer, redefinir, duracaoMin, tocar, somId, iniciar]);

  const parar = useCallback(() => {
    encerrar();
    redefinir((duracaoMin ?? DURACAO_PADRAO_MINUTOS) * MS_POR_MINUTO);
    setEstado("parado");
  }, [encerrar, redefinir, duracaoMin]);

  const escolherSom = useCallback(
    (id: SomId) => {
      if (!somLiberado(id) || id === somId) return;
      setSomEscolhido(id);
      if (estado === "tocando") trocar(id);
    },
    [somLiberado, somId, estado, trocar],
  );

  const escolherDuracao = useCallback(
    (minutos: number | null) => {
      if (estado === "tocando") return;
      setDuracaoMin(minutos);
      redefinir((minutos ?? DURACAO_PADRAO_MINUTOS) * MS_POR_MINUTO);
      setEstado("parado");
    },
    [estado, redefinir],
  );

  const mudarVolume = useCallback(
    (valor: number) => {
      setVolume(valor);
      definirVolume(valor);
    },
    [definirVolume],
  );

  const valor = useMemo<SomContextData>(
    () => ({
      suportado: audio.suportado,
      erro: audio.erro,
      somId,
      estado,
      iniciando,
      volume,
      duracaoMin,
      restanteMs: timer.restanteMs,
      ciclo,
      somLiberado,
      alternar,
      parar,
      escolherSom,
      escolherDuracao,
      mudarVolume,
    }),
    [
      audio.suportado,
      audio.erro,
      somId,
      estado,
      iniciando,
      volume,
      duracaoMin,
      timer.restanteMs,
      ciclo,
      somLiberado,
      alternar,
      parar,
      escolherSom,
      escolherDuracao,
      mudarVolume,
    ],
  );

  return <SomContext.Provider value={valor}>{children}</SomContext.Provider>;
}
