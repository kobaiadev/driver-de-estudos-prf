import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, HardDrive, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DriveBrowser } from "@/components/DriveBrowser";
import { gerarTrilha, MATERIAS, todasAulas } from "@/lib/lms-data";
import { useLms } from "@/lib/lms-store";
import { PASTA_RAIZ } from "@/lib/drive.functions";

export const Route = createFileRoute("/importar")({
  head: () => ({
    meta: [
      { title: "Trilha PRF — CT Lago Concursos" },
      { name: "description", content: "Sincronize as pastas do Drive e gere sua trilha semanal de estudos." },
      { property: "og:title", content: "Trilha PRF — CT Lago Concursos" },
      { property: "og:description", content: "Gere uma trilha de estudos automática a partir das suas pastas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Importar,
});

function Importar() {
  const { trilha, setTrilha, sincronizadoEm, sincronizar, concluidas, toggleAula } = useLms();
  const qc = useQueryClient();
  const [loading, setLoading] = useState<"sync" | "gen" | null>(null);
  const run = (k: "sync" | "gen", fn: () => void) => { setLoading(k); setTimeout(() => { fn(); setLoading(null); }, 900); };
  const btn = "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60";
  return (
    <AppShell>
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-4 px-3 py-5 sm:gap-6 sm:px-4 sm:py-8 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="min-w-0 rounded-lg border bg-card p-3 sm:p-5">
          <div className="flex items-center gap-2"><HardDrive className="h-5 w-5 text-primary" /><h2 className="font-bold">Repositório do Google Drive</h2></div>
          <p className="mt-1 text-xs text-muted-foreground">
            Google Drive conectado · {sincronizadoEm ? `sincronizado em ${new Date(sincronizadoEm).toLocaleString("pt-BR")}` : "não sincronizado"}
          </p>
          <button disabled={!!loading} onClick={() => run("sync", () => { sincronizar(); qc.invalidateQueries({ queryKey: ["drive"] }); })} className={`${btn} mt-4 w-full justify-center border text-center hover:bg-secondary sm:w-auto`}>
            <RefreshCw className={`h-4 w-4 ${loading === "sync" ? "animate-spin" : ""}`} /> Sincronizar pastas
          </button>
          <div className="mt-4 max-h-[60vh] overflow-auto rounded border p-2">
            <DriveBrowser pastaId={PASTA_RAIZ} />
          </div>
        </section>
        <section className="min-w-0">
          <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-xl font-black sm:text-2xl">Trilha de estudos semanal</h1>
              <p className="text-sm text-muted-foreground">{MATERIAS.length} matérias · {trilha?.reduce((n, s) => n + s.length, 0) ?? 0} aulas (todas as pastas do Drive, incluindo mentorias, Passo Estratégico, bizus e simulados) · {trilha?.length ?? 0} semanas</p>
            </div>
            <button disabled={!!loading} onClick={() => run("gen", () => setTrilha(gerarTrilha(MATERIAS)))} className={`${btn} w-full justify-center bg-accent text-center text-xs text-accent-foreground hover:opacity-90 sm:w-auto sm:text-sm`}>
              <Sparkles className="h-4 w-4 shrink-0" /> {loading === "gen" ? "Gerando..." : "Gerar trilha de estudos"}
            </button>
          </div>
          <ProgressoTrilha />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {trilha?.map((sem, i) => {
              const feitas = sem.filter((x) => concluidas.includes(x.aulaId)).length;
              const pct = Math.round((feitas / sem.length) * 100);
              return (
                <div key={i} className={`rounded-lg border bg-card p-4 ${pct === 100 ? "border-success" : ""}`}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-display font-bold">Semana {i + 1}</span>
                    <span className="text-xs font-semibold text-muted-foreground">{feitas}/{sem.length} · {pct}%</span>
                  </div>
                  <Barra pct={pct} />
                  <ul className="mt-3 space-y-1.5">
                    {sem.map((x) => {
                      const ok = concluidas.includes(x.aulaId);
                      return (
                        <li key={x.aulaId} className="flex min-w-0 items-start gap-2 break-words text-sm">
                          <input type="checkbox" checked={ok} onChange={() => toggleAula(x.aulaId)} className="mt-1 accent-[var(--primary)]" aria-label={`Concluir ${x.aula}`} />
                          <Link to="/estudo/$materiaId" params={{ materiaId: x.materiaId }} search={{ aula: x.aulaId }} className={`hover:text-primary ${ok ? "line-through opacity-60" : ""}`}>
                            <span className="font-semibold">{x.materia}:</span> <span className="text-muted-foreground">{x.aula}</span>
                            <span className="block text-xs text-muted-foreground/70">{x.modulo}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Barra({ pct, fina }: { pct: number; fina?: boolean }) {
  return (
    <div className={`${fina ? "h-1" : "h-1.5"} overflow-hidden rounded-full bg-muted`}>
      <div className={`h-full ${pct === 100 ? "bg-success" : "bg-primary"}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function ProgressoTrilha() {
  const { concluidas } = useLms();
  const [aberta, setAberta] = useState<string | null>(null);
  const pc = (ids: string[]) => (ids.length ? Math.round((ids.filter((x) => concluidas.includes(x)).length / ids.length) * 100) : 0);
  const total = MATERIAS.flatMap((m) => todasAulas(m).map((a) => a.id));
  return (
    <div className="mt-6 rounded-lg border bg-card p-4">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-bold">Progresso por matéria e curso</h2>
        <span className="text-sm font-semibold">{total.filter((x) => concluidas.includes(x)).length}/{total.length} aulas · {pc(total)}%</span>
      </div>
      <Barra pct={pc(total)} />
      <div className="mt-4 grid gap-x-6 gap-y-2 md:grid-cols-2">
        {MATERIAS.map((m) => {
          const ids = todasAulas(m).map((a) => a.id);
          const p = pc(ids);
          const open = aberta === m.id;
          return (
            <div key={m.id}>
              <button onClick={() => setAberta(open ? null : m.id)} className="flex w-full items-center gap-2 text-left text-sm">
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition ${open ? "" : "-rotate-90"}`} />
                <span className="flex-1 truncate font-semibold">{m.nome}</span>
                <span className="text-xs text-muted-foreground">{ids.filter((x) => concluidas.includes(x)).length}/{ids.length} · {p}%</span>
              </button>
              <div className="ml-5 mt-1"><Barra pct={p} fina /></div>
              {open && (
                <ul className="ml-5 mt-2 space-y-1.5 border-l pl-3">
                  {m.modulos.map((mo) => {
                    const mids = mo.aulas.map((a) => a.id);
                    return (
                      <li key={mo.id} className="text-xs">
                        <div className="flex justify-between gap-2"><span className="truncate">{mo.titulo}</span><span className="shrink-0 text-muted-foreground">{mids.filter((x) => concluidas.includes(x)).length}/{mids.length}</span></div>
                        <Barra pct={pc(mids)} fina />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
