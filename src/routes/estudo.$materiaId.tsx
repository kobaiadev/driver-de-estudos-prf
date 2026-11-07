import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, ChevronDown, Circle, ExternalLink, FileText, Maximize2, Minimize2, PlayCircle, Pause, Play, RotateCcw, Target, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MATERIAS, todasAulas } from "@/lib/lms-data";
import { fmtHoras, useLms } from "@/lib/lms-store";

export const Route = createFileRoute("/estudo/$materiaId")({
  validateSearch: (s: Record<string, unknown>): { aula?: string } => (typeof s["aula"] === "string" ? { aula: s["aula"] } : {}),
  loader: ({ params }) => {
    const m = MATERIAS.find((x) => x.id === params.materiaId);
    if (!m) throw notFound();
    return { nome: m.nome };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.nome ?? "Estudo"} — CT Lago Concursos` },
      { name: "description", content: `Aulas, PDFs e Passo Estratégico de ${loaderData?.nome ?? "estudo"} para a PRF.` },
      { property: "og:title", content: `${loaderData?.nome ?? "Estudo"} — CT Lago Concursos` },
      { property: "og:description", content: "Estude com vídeo, materiais e Pomodoro integrado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Estudo,
});

function Estudo() {
  const { materiaId } = Route.useParams();
  const materia = MATERIAS.find((m) => m.id === materiaId)!;
  const { concluidas, toggleAula } = useLms();
  const aulas = todasAulas(materia);
  const { aula: aulaBusca } = Route.useSearch();
  const inicial = aulas.some((a) => a.id === aulaBusca) ? aulaBusca! : aulas[0]!.id;
  const [aulaId, setAulaId] = useState(inicial);
  useEffect(() => setAulaId(inicial), [materiaId, aulaBusca]);
  const aula = aulas.find((a) => a.id === aulaId) ?? aulas[0]!;
  const [abertos, setAbertos] = useState<string[]>([(materia.modulos.find((mo) => mo.aulas.some((x) => x.id === inicial)) ?? materia.modulos[0]!).id]);
  const [vidIdx, setVidIdx] = useState(0);
  const [videoEmTelaCheia, setVideoEmTelaCheia] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setVidIdx(0);
    setVideoEmTelaCheia(false);
  }, [aulaId]);
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setVideoEmTelaCheia(false);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);
  useEffect(() => {
    if (!videoEmTelaCheia) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.fullscreenElement) setVideoEmTelaCheia(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [videoEmTelaCheia]);
  const selecionarVideo = (index: number) => {
    setVidIdx(index);
    setVideoEmTelaCheia(true);
    const player = playerRef.current;
    if (player?.requestFullscreen && document.fullscreenElement !== player) {
      void player.requestFullscreen().catch(() => setVideoEmTelaCheia(true));
    }
  };
  const fecharVideo = () => {
    setVideoEmTelaCheia(false);
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch((error: unknown) => console.error("Não foi possível fechar a tela cheia.", error));
    }
  };
  const video = aula.videos[vidIdx] ?? aula.videos[0];
  const feita = concluidas.includes(aula.id);

  return (
    <AppShell>
      <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)] gap-3 px-3 py-4 sm:gap-4 sm:px-4 sm:py-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_280px]">
        <aside className="order-2 max-h-[55vh] overflow-auto rounded-lg border bg-sidebar p-3 lg:order-1 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)]">
          <select value={materiaId} onChange={(e) => (window.location.href = `/estudo/${e.target.value}`)}
            className="mb-3 w-full rounded-md border bg-card px-2 py-1.5 text-sm font-semibold">
            {MATERIAS.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
          {materia.modulos.map((mo) => {
            const open = abertos.includes(mo.id);
            return (
              <div key={mo.id} className="mb-1">
                <button onClick={() => setAbertos(open ? abertos.filter((x) => x !== mo.id) : [...abertos, mo.id])}
                  className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm font-bold hover:bg-sidebar-accent">
                  {mo.titulo}<ChevronDown className={`h-4 w-4 transition ${open ? "" : "-rotate-90"}`} />
                </button>
                {open && mo.aulas.map((a) => (
                  <div key={a.id} className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm ${a.id === aula.id ? "bg-sidebar-accent" : ""}`}>
                    <input type="checkbox" checked={concluidas.includes(a.id)} onChange={() => toggleAula(a.id)} className="accent-[var(--primary)]" aria-label={`Concluir ${a.titulo}`} />
                    <button onClick={() => setAulaId(a.id)} className="flex-1 text-left hover:text-primary">{a.titulo}</button>
                    <span className="text-xs text-muted-foreground">{a.duracao}m</span>
                  </div>
                ))}
              </div>
            );
          })}
        </aside>

        <section className="order-1 space-y-4 lg:order-2">
          <div
            ref={playerRef}
            className={videoEmTelaCheia
              ? "fixed inset-0 z-[100] flex flex-col gap-3 overflow-y-auto bg-background p-3 sm:p-5"
              : "space-y-4"}
          >
            {videoEmTelaCheia && (
              <div className="flex min-h-11 items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">Reproduzindo vídeo</p>
                  <p className="truncate text-sm font-semibold sm:text-base">{video?.titulo ?? aula.titulo}</p>
                </div>
                <button type="button" onClick={fecharVideo} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-semibold hover:bg-secondary" aria-label="Fechar tela cheia">
                  <X className="h-4 w-4 sm:hidden" /><Minimize2 className="hidden h-4 w-4 sm:block" />
                  <span className="hidden sm:inline">Sair da tela cheia</span>
                </button>
              </div>
            )}
            <div className={videoEmTelaCheia
              ? "min-h-0 flex-1 overflow-hidden rounded-lg border bg-muted"
              : "-mx-3 aspect-video overflow-hidden border-y bg-muted sm:mx-0 sm:rounded-lg sm:border"}
            >
              {video ? (
                <iframe key={video.id} src={video.url} title={video.titulo} className="block h-full w-full border-0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
              ) : (
                <div className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
                  Esta aula não tem vídeo — estude pelos PDFs abaixo.
                </div>
              )}
            </div>
            {aula.videos.length > 0 && (
              <div className={`flex flex-wrap gap-2 ${videoEmTelaCheia ? "max-h-24 shrink-0 overflow-y-auto" : ""}`}>
                {aula.videos.map((v, i) => (
                  <button key={v.id} onClick={() => selecionarVideo(i)}
                    className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs ${i === vidIdx ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"}`}>
                    <PlayCircle className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{v.titulo}</span>
                  </button>
                ))}
                {video && <a href={video.abrir} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-primary">Abrir no Drive <ExternalLink className="h-3 w-3" /></a>}
              </div>
            )}
            {!videoEmTelaCheia && video && (
              <button type="button" onClick={() => selecionarVideo(vidIdx)} className="inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold hover:bg-secondary">
                <Maximize2 className="h-4 w-4" />Abrir vídeo em tela cheia
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{materia.modulos.find((mo) => mo.aulas.some((x) => x.id === aula.id))?.titulo}</p>
              <h1 className="break-words text-xl font-black leading-tight sm:text-2xl">{aula.titulo}</h1>
            </div>
            <button onClick={() => toggleAula(aula.id)}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2.5 text-center text-xs font-semibold sm:w-auto sm:px-4 sm:text-sm ${feita ? "bg-success text-primary-foreground" : "bg-primary text-primary-foreground"}`}>
              {feita ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              {feita ? "Aula concluída" : "Marcar Aula como Concluída"}
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {aula.materiais.map((m) => (
              <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="block rounded-lg border bg-card p-4 transition hover:border-primary">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {m.tipo === "passo" ? <Target className="h-4 w-4 text-accent" /> : <FileText className="h-4 w-4 text-primary" />}
                  {m.titulo}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {m.tipo === "passo"
                    ? "Pontos mais cobrados pela banca, revisão e questões-chave para esta aula."
                    : "Material em PDF da sua pasta do Drive — clique para abrir."}
                </p>
              </a>
            ))}
          </div>
          <Link to="/" className="inline-block text-sm text-muted-foreground hover:text-foreground">← Voltar ao painel</Link>
        </section>

        <aside className="order-3 lg:col-span-2 xl:col-span-1 xl:sticky xl:top-20 xl:self-start"><Pomodoro materiaId={materia.id} nome={materia.nome} /></aside>
      </div>
    </AppShell>
  );
}

function Pomodoro({ materiaId, nome }: { materiaId: string; nome: string }) {
  const { addTempo, segundosPorMateria } = useLms();
  const [modo, setModo] = useState<"foco" | "pausa">("foco");
  const dur = modo === "foco" ? 25 * 60 : 5 * 60;
  const [resta, setResta] = useState(dur);
  const [rodando, setRodando] = useState(false);
  const ref = useRef({ modo, materiaId });
  ref.current = { modo, materiaId };

  useEffect(() => {
    if (!rodando) return;
    const t = setInterval(() => {
      if (ref.current.modo === "foco") addTempo(ref.current.materiaId, 1);
      setResta((r) => {
        if (r > 1) return r - 1;
        const prox = ref.current.modo === "foco" ? "pausa" : "foco";
        setModo(prox);
        return prox === "foco" ? 25 * 60 : 5 * 60;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [rodando]);

  const mm = String(Math.floor(resta / 60)).padStart(2, "0");
  const ss = String(resta % 60).padStart(2, "0");
  const pct = 1 - resta / dur;
  const btn = "grid h-11 w-11 place-items-center rounded-full border hover:bg-secondary";
  return (
    <div className="rounded-lg border bg-card p-5 text-center">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pomodoro · {modo === "foco" ? "Foco" : "Pausa"}</div>
      <div className="relative mx-auto my-4 grid h-44 w-44 place-items-center rounded-full"
        style={{ background: `conic-gradient(var(--${modo === "foco" ? "primary" : "success"}) ${pct * 360}deg, var(--muted) 0)` }}>
        <div className="grid h-36 w-36 place-items-center rounded-full bg-card font-display text-4xl font-black tabular-nums">{mm}:{ss}</div>
      </div>
      <div className="flex justify-center gap-3">
        <button className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground hover:opacity-90" onClick={() => setRodando(!rodando)} aria-label={rodando ? "Pausar" : "Iniciar"}>
          {rodando ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button className={btn} onClick={() => { setRodando(false); setResta(dur); }} aria-label="Reiniciar"><RotateCcw className="h-5 w-5" /></button>
      </div>
      <div className="mt-4 flex justify-center gap-2 text-xs">
        {(["foco", "pausa"] as const).map((m) => (
          <button key={m} onClick={() => { setRodando(false); setModo(m); setResta(m === "foco" ? 1500 : 300); }}
            className={`rounded-full px-3 py-1 ${modo === m ? "bg-secondary font-semibold" : "text-muted-foreground"}`}>
            {m === "foco" ? "25 min foco" : "5 min pausa"}
          </button>
        ))}
      </div>
      <div className="mt-5 border-t pt-4 text-sm">
        <div className="text-muted-foreground">Tempo em {nome}</div>
        <div className="font-display text-2xl font-black">{fmtHoras(segundosPorMateria[materiaId] ?? 0)}</div>
      </div>
    </div>
  );
}
