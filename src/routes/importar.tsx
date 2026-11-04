import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight, FileText, Folder, HardDrive, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { gerarTrilha, MATERIAS } from "@/lib/lms-data";
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
  const { trilha, setTrilha, sincronizadoEm, sincronizar } = useLms();
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
              <p className="text-sm text-muted-foreground">{MATERIAS.length} matérias detectadas, aulas intercaladas por disciplina.</p>
            </div>
            <button disabled={!!loading} onClick={() => run("gen", () => setTrilha(gerarTrilha(MATERIAS)))} className={`${btn} bg-accent text-accent-foreground hover:opacity-90`}>
              <Sparkles className="h-4 w-4" /> {loading === "gen" ? "Gerando..." : "Gerar Trilha de Estudos Automatizada"}
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {trilha?.map((sem, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <div className="mb-2 font-display font-bold">Semana {i + 1}</div>
                <ul className="space-y-1">
                  {sem.map((x, j) => (
                    <li key={j} className="text-sm">
                      <Link to="/estudo/$materiaId" params={{ materiaId: x.materiaId }} className="hover:text-primary">
                        <span className="font-semibold">{x.materia}:</span> <span className="text-muted-foreground">{x.aula}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
