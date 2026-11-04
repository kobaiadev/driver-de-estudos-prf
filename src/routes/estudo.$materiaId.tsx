import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, ChevronDown, Circle, FileText, Pause, Play, RotateCcw, Target } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MATERIAS, todasAulas } from "@/lib/lms-data";
import { fmtHoras, useLms } from "@/lib/lms-store";

export const Route = createFileRoute("/estudo/$materiaId")({
  loader: ({ params }) => {
    const m = MATERIAS.find((x) => x.id === params.materiaId);
    if (!m) throw notFound();
    return { nome: m.nome };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.nome ?? "Estudo"} — RumoPRF` },
      { name: "description", content: `Aulas, PDFs e Passo Estratégico de ${loaderData?.nome ?? "estudo"} para a PRF.` },
      { property: "og:title", content: `${loaderData?.nome ?? "Estudo"} — RumoPRF` },
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
  const [aulaId, setAulaId] = useState(aulas[0]!.id);
  useEffect(() => setAulaId(aulas[0]!.id), [materiaId]);
  const aula = aulas.find((a) => a.id === aulaId) ?? aulas[0]!;
  const [abertos, setAbertos] = useState<string[]>(materia.modulos.map((m) => m.id));
  const feita = concluidas.includes(aula.id);

  return (
    <AppShell>
      <div className="mx-auto grid max-w-[1400px] gap-4 px-4 py-6 lg:grid-cols-[280px_1fr_280px]">
        <aside className="rounded-lg border bg-sidebar p-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
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

        <section className="space-y-4">
          <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
            <iframe key={aula.id} src={aula.videoUrl} title={aula.titulo} className="h-full w-full" allowFullScreen />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{materia.pasta}</p>
              <h1 className="text-2xl font-black">{aula.titulo}</h1>
            </div>
            <button onClick={() => toggleAula(aula.id)}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${feita ? "bg-success text-primary-foreground" : "bg-primary text-primary-foreground"}`}>
              {feita ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              {feita ? "Aula concluída" : "Marcar Aula como Concluída"}
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {aula.materiais.map((m) => (
              <div key={m.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {m.tipo === "passo" ? <Target className="h-4 w-4 text-accent" /> : <FileText className="h-4 w-4 text-primary" />}
                  {m.titulo}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {m.tipo === "passo"
                    ? "Pontos mais cobrados pela banca, revisão e questões-chave para esta aula."
                    : "Material teórico completo em PDF, vinculado à pasta do Drive."}
                </p>
              </div>
            ))}
          </div>
          <Link to="/" className="inline-block text-sm text-muted-foreground hover:text-foreground">← Voltar ao painel</Link>
        </section>

        <aside className="lg:sticky lg:top-20 lg:self-start"><Pomodoro materiaId={materia.id} nome={materia.nome} /></aside>
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
