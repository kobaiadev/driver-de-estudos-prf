import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Folder,
  Maximize2,
  RotateCw,
} from "lucide-react";
import { useRef, useState } from "react";
import { listarDrive, type DriveItem } from "@/lib/drive.functions";

type Pasta = { id: string; nome: string };

export function DriveBrowser({ pastaId }: { pastaId: string }) {
  const [caminho, setCaminho] = useState<Pasta[]>([]);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<DriveItem | null>(null);
  const pastaAtual = caminho.at(-1)?.id ?? pastaId;
  const listar = useServerFn(listarDrive);
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["drive", pastaAtual],
    queryFn: () => listar({ data: { pastaId: pastaAtual } }),
  });
  const voltarPara = (indice: number) => {
    setArquivoSelecionado(null);
    setCaminho((atual) => atual.slice(0, indice));
  };
  const abrirPasta = (pasta: DriveItem) => {
    setArquivoSelecionado(null);
    setCaminho((atual) => [...atual, { id: pasta.id, nome: pasta.nome }]);
  };
  const naRaiz = caminho.length === 0;

  if (arquivoSelecionado) {
    return (
      <ArquivoDrive arquivo={arquivoSelecionado} aoVoltar={() => setArquivoSelecionado(null)} />
    );
  }

  if (isLoading) {
    return (
      <p className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">
        Carregando matérias e materiais…
      </p>
    );
  }

  if (error || data?.erro) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          role="status"
          className="flex min-h-28 min-w-0 items-center gap-3 rounded-xl border bg-card p-4"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
            {data?.erro === "Google Drive não configurado" ? (
              <Folder className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">
              {data?.erro === "Google Drive não configurado"
                ? "Matérias e cursos"
                : "Não foi possível carregar as matérias"}
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              {data?.erro === "Google Drive não configurado"
                ? "Acesse a pasta do concurso no Google Drive com a conta que tem permissão para visualizar os materiais."
                : "Não foi possível carregar as matérias agora. Tente novamente."}
            </span>
            <a
              href={`https://drive.google.com/drive/folders/${encodeURIComponent(pastaAtual)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir pasta de materiais
            </a>
            {data?.erro !== "Google Drive não configurado" && (
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 ml-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <RotateCw className="h-4 w-4" />
                Tentar novamente
              </button>
            )}
          </span>
        </div>
      </div>
    );
  }

  const itens = data?.itens ?? [];

  return (
    <div className="space-y-4">
      {caminho.length > 0 && (
        <nav
          aria-label="Caminho das matérias"
          className="flex flex-wrap items-center gap-1 text-sm"
        >
          <button
            type="button"
            onClick={() => voltarPara(0)}
            className="inline-flex min-h-10 items-center rounded-md px-2 font-semibold text-primary hover:bg-secondary"
          >
            Matérias
          </button>
          {caminho.map((pasta, indice) => (
            <span key={pasta.id} className="inline-flex min-w-0 items-center gap-1">
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              <button
                type="button"
                onClick={() => voltarPara(indice + 1)}
                className={`min-h-10 max-w-48 truncate rounded-md px-2 hover:bg-secondary ${indice === caminho.length - 1 ? "font-semibold text-foreground" : "text-primary"}`}
              >
                {pasta.nome}
              </button>
            </span>
          ))}
        </nav>
      )}

      {itens.length === 0 ? (
        <p className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">
          Esta pasta ainda não tem matérias ou materiais.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {itens
            .filter((item) => item.pasta)
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => abrirPasta(item)}
                className="group flex min-h-24 min-w-0 items-center gap-3 rounded-xl border bg-card p-4 text-left transition hover:border-primary hover:shadow-sm"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  <Folder className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{item.nome}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {naRaiz ? "Matéria · cursos e aulas" : "Curso · aulas e materiais"}
                  </span>
                  <span className="mt-3 block text-xs font-semibold text-primary">
                    {naRaiz ? "Acessar matéria" : "Acessar curso"} →
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            ))}
          {itens
            .filter((item) => !item.pasta)
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setArquivoSelecionado(item)}
                className="group flex min-h-20 min-w-0 items-center gap-3 rounded-xl border bg-card p-4 text-left transition hover:border-primary hover:shadow-sm"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  <FileText className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{item.nome}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Material de estudo
                  </span>
                </span>
                <Maximize2 className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function ArquivoDrive({ arquivo, aoVoltar }: { arquivo: DriveItem; aoVoltar: () => void }) {
  const visualizadorRef = useRef<HTMLDivElement>(null);
  const url = `https://drive.google.com/file/d/${arquivo.id}/preview`;

  async function abrirTelaCheia() {
    const visualizador = visualizadorRef.current;
    if (!visualizador?.requestFullscreen) {
      console.error("Este navegador não permite abrir o material em tela cheia.");
      return;
    }

    try {
      await visualizador.requestFullscreen();
    } catch (error) {
      console.error("Não foi possível abrir o material em tela cheia.", error);
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={aoVoltar}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border bg-card px-3 text-sm font-semibold hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar às matérias
        </button>
        <a
          href={arquivo.link ?? `https://drive.google.com/file/d/${arquivo.id}/view`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-secondary"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir no Google Drive
        </a>
      </div>
      <h3 className="break-words text-base font-bold sm:text-lg">{arquivo.nome}</h3>
      <div
        ref={visualizadorRef}
        className="aspect-video overflow-hidden rounded-xl border bg-muted"
      >
        <iframe
          title={arquivo.nome}
          src={url}
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
      <button
        type="button"
        onClick={abrirTelaCheia}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border bg-card px-3 text-sm font-semibold hover:bg-secondary"
      >
        <Maximize2 className="h-4 w-4" />
        Assistir em tela cheia
      </button>
    </section>
  );
}
