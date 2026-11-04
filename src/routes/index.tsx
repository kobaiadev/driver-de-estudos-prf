import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Calculator, Car, Clock, FileCheck2, GraduationCap, Languages, Scale, Target } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FRENTES, MATERIAS, todasAulas, type Frente } from "@/lib/lms-data";
import { fmtHoras, useLms } from "@/lib/lms-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel do Aluno — RumoPRF" },
      { name: "description", content: "Acompanhe horas estudadas, simulados e progresso no edital da PRF." },
      { property: "og:title", content: "Painel do Aluno — RumoPRF" },
      { property: "og:description", content: "Sua plataforma de estudos focada na PRF." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const ICONES: Record<Frente, typeof Scale> = { direito: Scale, exatas: Calculator, transito: Car, linguagens: Languages, mentorias: GraduationCap };

function Dashboard() {
  const { concluidas, segundosPorMateria, simulados } = useLms();
  const total = MATERIAS.reduce((n, m) => n + todasAulas(m).length, 0);
  const pct = Math.round((concluidas.length / total) * 100);
  const arquivos = MATERIAS.reduce((n, m) => n + todasAulas(m).reduce((k, a) => k + a.videos.length + a.materiais.length, 0), 0);
  const horas = Object.values(segundosPorMateria).reduce((a, b) => a + b, 0);
  const stats = [
    { l: "Horas líquidas", v: fmtHoras(horas), i: Clock },
    { l: "Simulados feitos", v: String(simulados), i: FileCheck2 },
    { l: "Vídeos e PDFs no Drive", v: String(arquivos), i: FileCheck2 },
    { l: "Edital concluído", v: `${pct}%`, i: Target },
    { l: "Aulas concluídas", v: `${concluidas.length}/${total}`, i: BookOpen },
  ];
  return (
    <AppShell>
      <section className="bg-hero text-primary-foreground dark:text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">Trilha PRF 2025/2026 · materiais do seu Google Drive</p>
          <h1 className="mt-2 text-4xl font-black">Bom estudo, policial.</h1>
          <div className="mt-6 h-2 max-w-xl overflow-hidden rounded-full bg-background/20">
            <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-sm opacity-80">{pct}% do edital concluído</p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {stats.map((s) => (
            <div key={s.l} className="rounded-lg border bg-card p-5">
              <s.i className="h-5 w-5 text-muted-foreground" />
              <div className="mt-3 font-display text-3xl font-black">{s.v}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
        {(Object.keys(FRENTES) as Frente[]).map((f) => {
          const Icon = ICONES[f];
          return (
            <section key={f}>
              <div className="mb-3 flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">{FRENTES[f].nome}</h2>
                <span className="text-sm text-muted-foreground">· {FRENTES[f].descricao}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {MATERIAS.filter((m) => m.frente === f).map((m) => {
                  const a = todasAulas(m);
                  const d = a.filter((x) => concluidas.includes(x.id)).length;
                  return (
                    <Link key={m.id} to="/estudo/$materiaId" params={{ materiaId: m.id }}
                      className="group rounded-lg border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary">
                      <div className="font-semibold group-hover:text-primary">{m.nome}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{m.modulos.length} cursos · {d}/{a.length} aulas · {fmtHoras(segundosPorMateria[m.id] ?? 0)} estudadas</div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${(d / a.length) * 100}%` }} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
