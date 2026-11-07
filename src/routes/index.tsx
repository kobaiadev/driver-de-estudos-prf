import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Calculator, Car, Clock, FileCheck2, GraduationCap, Languages, Scale, Target } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FRENTES, MATERIAS, todasAulas, type Frente } from "@/lib/lms-data";
import { fmtHoras, useLms } from "@/lib/lms-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Seja bem-vindo — CT Lago Concursos" },
      { name: "description", content: "Acesse os materiais e acompanhe seus estudos para concursos policiais no CT Lago Concursos." },
      { property: "og:title", content: "CT Lago Concursos" },
      { property: "og:description", content: "Preparação para carreiras policiais com ética, disciplina e excelência." },
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
      <div className="mx-auto max-w-7xl space-y-6 px-3 py-5 sm:space-y-9 sm:px-6 sm:py-8 lg:px-8">
        <section className="relative overflow-hidden rounded-2xl bg-hero text-primary-foreground shadow-xl">
          <div className="absolute -right-10 -top-20 h-72 w-72 rounded-full border border-accent/25" />
          <div className="absolute -right-2 -top-12 h-56 w-56 rounded-full border border-accent/20" />
          <div className="relative flex items-center justify-between gap-4 px-4 py-6 sm:gap-6 sm:px-10 sm:py-12">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent sm:text-xs sm:tracking-[0.22em]">Ética · Disciplina · Excelência</p>
              <h1 className="mt-2 text-2xl font-black leading-tight sm:mt-3 sm:text-4xl lg:text-5xl">Seja bem-vindo ao CT Lago Concursos</h1>
              <p className="mt-2 max-w-xl text-sm leading-5 text-primary-foreground/80 sm:mt-3 sm:text-base sm:leading-6">Seu espaço de preparação para carreiras policiais. Escolha um concurso, organize sua rotina e avance um dia de cada vez.</p>
            </div>
            <img src="/ct-lago-logo.jpg" alt="" className="hidden h-28 w-28 shrink-0 rounded-full border-4 border-accent/80 object-cover shadow-2xl md:block lg:h-40 lg:w-40" />
          </div>
        </section>

        <section aria-labelledby="concursos-heading">
          <div className="mb-3 sm:mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Comece por aqui</p>
            <h2 id="concursos-heading" className="mt-1 text-xl font-black sm:text-2xl">Escolha seu concurso</h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <Link to="/concursos/$concursoId" params={{ concursoId: "rf" }} className="group rounded-xl border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md sm:p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">PRF</span>
              <h3 className="mt-2 font-display text-base font-bold sm:text-lg">PRF - Polícia Rodoviária Federal</h3>
              <p className="mt-1 text-sm text-muted-foreground">Acesse as matérias, a trilha e os materiais da PRF.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">Acessar materiais <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </Link>
            <Link to="/concursos/$concursoId" params={{ concursoId: "camara" }} className="group rounded-xl border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md sm:p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">CÂMARA</span>
              <h3 className="mt-2 font-display text-base font-bold sm:text-lg">Polícia Legislativa — Câmara dos Deputados</h3>
              <p className="mt-1 text-sm text-muted-foreground">Explore as matérias e os materiais da pasta do concurso.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">Acessar materiais <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </Link>
            <Link to="/concursos/$concursoId" params={{ concursoId: "trt" }} className="group rounded-xl border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md sm:p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">TRT</span>
              <h3 className="mt-2 font-display text-base font-bold sm:text-lg">Polícia Legislativa — TRT</h3>
              <p className="mt-1 text-sm text-muted-foreground">Acesse as matérias e os materiais do Google Drive.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">Acessar materiais <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </Link>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-4 sm:p-6">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Orientações</p>
            <h2 className="mt-1 text-lg font-black sm:text-xl">Como aproveitar sua área de estudos</h2>
          </div>
          <ol className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span><span><strong>Escolha o concurso</strong><br /><span className="text-muted-foreground">Use o menu lateral para abrir RF, Câmara ou TRT.</span></span></li>
            <li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span><span><strong>Encontre as matérias</strong><br /><span className="text-muted-foreground">Abra as pastas para navegar por cursos, aulas e arquivos.</span></span></li>
            <li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span><span><strong>Organize sua rotina</strong><br /><span className="text-muted-foreground">Consulte a trilha e o plano de estudos da PRF.</span></span></li>
            <li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span><span><strong>Acompanhe seu progresso</strong><br /><span className="text-muted-foreground">Marque aulas concluídas e registre seu tempo de estudo.</span></span></li>
          </ol>
          <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">Os materiais do Drive podem exigir login em uma conta Google com permissão de acesso à pasta.</p>
        </section>

        <section>
          <div className="mb-3 sm:mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Painel PRF</p>
            <h2 className="mt-1 text-xl font-black sm:text-2xl">Seu progresso nos estudos</h2>
          </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <div key={s.l} className="min-w-0 rounded-xl border bg-card p-3 sm:p-5">
              <s.i className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
              <div className="mt-2 break-words font-display text-2xl font-black sm:mt-3 sm:text-3xl">{s.v}</div>
              <div className="text-xs text-muted-foreground sm:text-sm">{s.l}</div>
            </div>
          ))}
        </div>
        {(Object.keys(FRENTES) as Frente[]).map((f) => {
          const Icon = ICONES[f];
          return (
            <section key={f}>
              <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                <Icon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold sm:text-xl">{FRENTES[f].nome}</h2>
                <span className="text-xs text-muted-foreground sm:text-sm">· {FRENTES[f].descricao}</span>
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
        </section>
      </div>
    </AppShell>
  );
}
