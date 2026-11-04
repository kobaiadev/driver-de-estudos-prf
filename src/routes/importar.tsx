import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, FileText, Folder, HardDrive, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DRIVE_TREE, gerarTrilha, MATERIAS, type DriveNode } from "@/lib/lms-data";
import { useLms } from "@/lib/lms-store";

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

function Node({ n, depth = 0 }: { n: DriveNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const isFolder = !!n.filhos;
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-sm hover:bg-secondary" style={{ paddingLeft: depth * 16 + 8 }}>
        {isFolder ? <ChevronRight className={`h-3.5 w-3.5 transition ${open ? "rotate-90" : ""}`} /> : <span className="w-3.5" />}
        {isFolder ? <Folder className="h-4 w-4 text-accent" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
        {n.nome}
      </button>
      {open && n.filhos?.map((c) => <Node key={c.nome} n={c} depth={depth + 1} />)}
    </div>
  );
}

function Importar() {
  const { trilha, setTrilha, sincronizadoEm, sincronizar } = useLms();
  const [loading, setLoading] = useState<"sync" | "gen" | null>(null);
  const run = (k: "sync" | "gen", fn: () => void) => { setLoading(k); setTimeout(() => { fn(); setLoading(null); }, 900); };
  const btn = "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60";
  return (
    <AppShell>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[380px_1fr]">
        <section className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2"><HardDrive className="h-5 w-5 text-primary" /><h2 className="font-bold">Repositório do Google Drive</h2></div>
          <p className="mt-1 text-xs text-muted-foreground">
            Simulação · {sincronizadoEm ? `sincronizado em ${new Date(sincronizadoEm).toLocaleString("pt-BR")}` : "não sincronizado"}
          </p>
          <button disabled={!!loading} onClick={() => run("sync", sincronizar)} className={`${btn} mt-4 border hover:bg-secondary`}>
            <RefreshCw className={`h-4 w-4 ${loading === "sync" ? "animate-spin" : ""}`} /> Sincronizar pastas
          </button>
          <div className="mt-4 max-h-[60vh] overflow-auto rounded border p-2">
            {DRIVE_TREE.map((n) => <Node key={n.nome} n={n} />)}
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
