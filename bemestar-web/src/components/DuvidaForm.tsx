import { useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, ImageIcon, Paperclip, X } from "lucide-react";
import { duvidaSchema, type DuvidaFormData } from "../schemas/duvidaSchemas";
import { useEnviarAnexos, useExcluirAnexo, useSalvarDuvida } from "../hooks/useDuvidas";
import { getErrorMessage } from "../services/apiError";
import { formatarTamanho, MAX_ANEXOS, TIPOS_ACEITOS, validarArquivo } from "../services/anexoService";
import type { Anexo, Duvida } from "../types/duvida";
import AnexosLista from "./AnexosLista";

interface Props {
  editando: Duvida | null; // null = nova dúvida
  onConcluir: () => void; // sai do modo de edição
}

const LIMITE = 1000;

// A página usa `key` neste componente: ao trocar de dúvida em edição ele é recriado
// já com o texto certo, sem precisar sincronizar estado.
export default function DuvidaForm({ editando, onConcluir }: Props) {
  const { mutateAsync, isPending, error } = useSalvarDuvida();
  const enviarAnexos = useEnviarAnexos();
  const excluirAnexo = useExcluirAnexo();
  const [enviada, setEnviada] = useState(false);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [avisoArquivo, setAvisoArquivo] = useState<string | null>(null);
  // anexos que já estão salvos (edição); removidos aqui somem na hora
  const [existentes, setExistentes] = useState<Anexo[]>(editando?.anexos ?? []);
  const seletor = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DuvidaFormData>({
    resolver: zodResolver(duvidaSchema),
    defaultValues: { mensagem: editando?.mensagem ?? "" },
  });

  const contador = (watch("mensagem") ?? "").length;
  const vagas = MAX_ANEXOS - existentes.length - arquivos.length;
  const enviando = isPending || enviarAnexos.isPending;

  function aoEscolher(e: ChangeEvent<HTMLInputElement>) {
    const escolhidos = Array.from(e.target.files ?? []);
    e.target.value = ""; // permite escolher o mesmo arquivo de novo
    const problemas: string[] = [];
    const validos: File[] = [];
    for (const arquivo of escolhidos) {
      const problema = validarArquivo(arquivo);
      if (problema) problemas.push(problema);
      else validos.push(arquivo);
    }
    if (validos.length > vagas) problemas.push(`Cada dúvida aceita no máximo ${MAX_ANEXOS} anexos.`);
    setArquivos((atual) => [...atual, ...validos.slice(0, Math.max(0, vagas))]);
    setAvisoArquivo(problemas.length > 0 ? problemas.join(" ") : null);
  }

  async function removerExistente(anexo: Anexo) {
    try {
      await excluirAnexo.mutateAsync({ duvidaId: anexo.duvidaId, anexoId: anexo.id });
      setExistentes((atual) => atual.filter((a) => a.id !== anexo.id));
    } catch (erro) {
      setAvisoArquivo(getErrorMessage(erro));
    }
  }

  async function aoEnviar(dados: DuvidaFormData) {
    setEnviada(false);
    setAvisoArquivo(null);
    let duvida: Duvida;
    try {
      duvida = await mutateAsync({ id: editando?.id, dados });
    } catch {
      return; // a mensagem do back aparece abaixo, em `error`
    }

    if (arquivos.length > 0) {
      const falhas = await enviarAnexos.mutateAsync({ duvidaId: duvida.id, arquivos });
      if (falhas.length > 0) {
        const detalhe = falhas.map((f) => `${f.arquivo.name} (${getErrorMessage(f.erro)})`).join("; ");
        const inicio = `Sua dúvida foi salva, mas ${falhas.length === 1 ? "um arquivo não foi anexado" : "alguns arquivos não foram anexados"}: ${detalhe}.`;
        if (editando) {
          // continua editando: só os arquivos com problema ficam para tentar de novo
          setArquivos(falhas.map((f) => f.arquivo));
          setAvisoArquivo(inicio);
        } else {
          // a dúvida já existe: limpar o formulário evita criar outra igual ao tentar de novo
          reset({ mensagem: "" });
          setArquivos([]);
          setAvisoArquivo(`${inicio} Use "Editar" na dúvida para anexar de novo.`);
        }
        return;
      }
    }

    setArquivos([]);
    if (editando) {
      onConcluir();
    } else {
      reset({ mensagem: "" });
      setEnviada(true);
    }
  }

  return (
    <form className="duv-caixa" onSubmit={handleSubmit(aoEnviar)} noValidate>
      <label htmlFor="duv-mensagem" className="duv-rotulo">
        {editando ? "Editar dúvida" : "Sua dúvida para o enfermeiro"}
      </label>

      <textarea
        id="duv-mensagem"
        rows={4}
        placeholder="Escreva aqui, sem pressa."
        aria-invalid={errors.mensagem ? true : undefined}
        {...register("mensagem")}
      />

      <div className="duv-linha">
        <span className={contador > LIMITE ? "duv-contador excedido" : "duv-contador"}>
          {contador}/{LIMITE}
        </span>
      </div>

      {errors.mensagem && (
        <p className="duv-erro" role="alert">
          {errors.mensagem.message}
        </p>
      )}

      {/* ---------- Anexos ---------- */}
      <div className="duv-anexos">
        <AnexosLista anexos={existentes} onRemover={removerExistente} removendo={excluirAnexo.isPending ? (excluirAnexo.variables?.anexoId ?? null) : null} />

        {arquivos.length > 0 && (
          <ul className="anexos" aria-label="Arquivos para enviar">
            {arquivos.map((arquivo, i) => (
              <li key={`${arquivo.name}-${i}`} className="anexo novo">
                <span className="anexo-abrir">
                  <span className="anexo-icone" aria-hidden="true">
                    {arquivo.type.startsWith("image/") ? <ImageIcon size={20} /> : <FileText size={20} />}
                  </span>
                  <span className="anexo-texto">
                    <span className="anexo-nome">{arquivo.name}</span>
                    <span className="anexo-tamanho">{formatarTamanho(arquivo.size)} · será enviado</span>
                  </span>
                </span>
                <button
                  type="button"
                  className="anexo-remover"
                  onClick={() => setArquivos((atual) => atual.filter((_, j) => j !== i))}
                  aria-label={`Tirar ${arquivo.name}`}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={seletor}
          id="duv-arquivo"
          type="file"
          className="sr-only"
          accept={TIPOS_ACEITOS.join(",")}
          multiple
          onChange={aoEscolher}
          tabIndex={-1}
        />
        <button
          type="button"
          className="duv-anexar"
          onClick={() => seletor.current?.click()}
          disabled={vagas <= 0 || enviando}
        >
          <Paperclip size={16} aria-hidden="true" />
          Anexar foto ou documento
        </button>
        <p className="duv-anexos-ajuda">
          JPG, PNG, WEBP ou PDF · até 5 MB cada · no máximo {MAX_ANEXOS} por dúvida
        </p>

        {avisoArquivo && (
          <p className="duv-erro" role="alert">
            {avisoArquivo}
          </p>
        )}
      </div>

      {error && (
        <p className="duv-erro-api" role="alert">
          {getErrorMessage(error)}
        </p>
      )}

      {enviada && (
        <p className="duv-ok" role="status">
          Dúvida enviada ao enfermeiro.
        </p>
      )}

      <p className="duv-aviso">
        Este espaço não é para emergências. Se precisar de ajuda agora, ligue 188 (CVV) ou 192
        (SAMU).
      </p>

      <div className="duv-acoes">
        {editando && (
          <button type="button" className="btn-contorno" onClick={onConcluir}>
            Cancelar edição
          </button>
        )}
        <button type="submit" className="btn-principal" disabled={enviando}>
          {enviarAnexos.isPending
            ? "Enviando arquivos..."
            : isPending
              ? editando
                ? "Salvando..."
                : "Enviando..."
              : editando
                ? "Salvar alterações"
                : "Enviar dúvida"}
        </button>
      </div>
    </form>
  );
}
