import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, ChevronRight, FileText, Folder, HardDrive, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { gerarTrilha, MATERIAS, todasAulas } from "@/lib/lms-data";
import { useLms } from "@/lib/lms-store";
import { listarDrive, type DriveItem, PASTA_RAIZ } from "@/lib/drive.functions";

export const Route = createFileRoute("/importar")({
  head: () => ({
    meta: [
      { title: "Importar do Google Drive — RumoPRF" },
      { name: "description", content: "Sincronize as pastas do Drive e gere sua trilha semanal de estudos." },
      { property: "og:title", content: "Importar do Google Drive — RumoPRF" },
      { property: "og:description", content: "Gere uma trilha de estudos automática a partir das suas pastas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Importar,
});

function DriveFolder({ pastaId, depth = 0 }: { pastaId: string; depth?: number }) {
  const listar = useServerFn(listarDrive);
  const { data, isLoading } = useQuery({ queryKey: ["drive", pastaId], queryFn: () => listar({ data: { pastaId } }) });
  const pad = depth * 16 + 8;
  if (isLoading) return <div className="px-2 py-1 text-xs text-muted-foreground" style={{ paddingLeft: pad }}>Carregando…</div>;
  if (data?.erro) return <div className="px-2 py-1 text-xs text-destructive" style={{ paddingLeft: pad }}>{data.erro}</div>;
  if (!data?.itens.length) return <div className="px-2 py-1 text-xs text-muted-foreground" style={{ paddingLeft: pad }}>Pasta vazia</div>;
  return <>{data.itens.map((it) => <DriveRow key={it.id} it={it} depth={depth} />)}</>;
}

function DriveRow({ it, depth }: { it: DriveItem; depth: number }) {
  const [open, setOpen] = useState(false);
  const cls = "flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-sm hover:bg-secondary";
  const style = { paddingLeft: depth * 16 + 8 };
  if (!it.pasta) {
    return (
      <a href={it.link} target="_blank" rel="noreferrer" className={cls} style={style}>
        <span className="w-3.5" /><FileText className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="truncate">{it.nome}</span>
      </a>
    );
  }
  return (
    <div>
      <button onClick={() => setOpen(!open)} className={cls} style={style}>
        <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition ${open ? "rotate-90" : ""}`} />
        <Folder className="h-4 w-4 shrink-0 text-accent" /><span className="truncate">{it.nome}</span>
      </button>
      {open && <DriveFolder pastaId={it.id} depth={depth + 1} />}
    </div>
  );
}

function Importar() {
  const { trilha, setTrilha, sincronizadoEm, sincronizar, concluidas, toggleAula } = useLms();
  const qc = useQueryClient();
  const [loading, setLoading] = useState<"sync" | "gen" | null>(null);
  const run = (k: "sync" | "gen", fn: () => void) => { setLoading(k); setTimeout(() => { fn(); setLoading(null); }, 900); };
  const btn = "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60";
  return (
    <AppShell>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[380px_1fr]">
        <section className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2"><HardDrive className="h-5 w-5 text-primary" /><h2 className="font-bold">Repositório do Google Drive</h2></div>
          <p className="mt-1 text-xs text-muted-foreground">
            Google Drive conectado · {sincronizadoEm ? `sincronizado em ${new Date(sincronizadoEm).toLocaleString("pt-BR")}` : "não sincronizado"}
          </p>
          <button disabled={!!loading} onClick={() => run("sync", () => { sincronizar(); qc.invalidateQueries({ queryKey: ["drive"] }); })} className={`${btn} mt-4 border hover:bg-secondary`}>
            <RefreshCw className={`h-4 w-4 ${loading === "sync" ? "animate-spin" : ""}`} /> Sincronizar pastas
          </button>
          <div className="mt-4 max-h-[60vh] overflow-auto rounded border p-2">
            <DriveFolder pastaId={PASTA_RAIZ} />
          </div>
        </section>
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black">Trilha de estudos semanal</h1>
              <p className="text-sm text-muted-foreground">{MATERIAS.length} matérias · {trilha?.reduce((n, s) => n + s.length, 0) ?? 0} aulas (todas as pastas do Drive, incluindo mentorias, Passo Estratégico, bizus e simulados) · {trilha?.length ?? 0} semanas</p>
            </div>
            <button disabled={!!loading} onClick={() => run("gen", () => setTrilha(gerarTrilha(MATERIAS)))} className={`${btn} bg-accent text-accent-foreground hover:opacity-90`}>
              <Sparkles className="h-4 w-4" /> {loading === "gen" ? "Gerando..." : "Gerar Trilha de Estudos Automatizada"}
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
                        <li key={x.aulaId} className="flex items-start gap-2 text-sm">
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
