import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { FolderOpen } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DriveBrowser } from "@/components/DriveBrowser";
import { CONCURSOS } from "@/lib/concursos";
import { FRENTES, MATERIAS, todasAulas, type Frente } from "@/lib/lms-data";
import { useLms } from "@/lib/lms-store";

export const Route = createFileRoute("/concursos/$concursoId")({
  loader: ({ params }) => {
    const concurso = Object.values(CONCURSOS).find((item) => item.id === params.concursoId);
    if (!concurso) throw notFound();
    return concurso;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.sigla ?? "Concurso"} — CT Lago Concursos` },
      { name: "description", content: loaderData?.descricao ?? "Matérias e materiais de estudo." },
    ],
  }),
  component: ConcursoPage,
});

const ICONES_FRENTE: Record<Frente, string> = {
  direito: "Direito",
  transito: "Trânsito, Direitos Humanos e Ética",
  exatas: "Exatas e Informática",
  linguagens: "Linguagens e Atualidades",
  mentorias: "Mentorias, Bizus e Simulados",
};

function ConcursoPage() {
  const concurso = Route.useLoaderData();
  const { concluidas, segundosPorMateria } = useLms();
  const isRf = concurso.id === "rf";

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6 px-3 py-5 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        <section className="rounded-2xl bg-hero px-4 py-6 text-primary-foreground shadow-lg sm:px-9 sm:py-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Materiais do concurso
          </p>
          <h1 className="mt-2 max-w-3xl text-xl font-black leading-tight sm:text-3xl">
            {concurso.id === "rf" ? "PRF - Polícia Rodoviária Federal" : concurso.nome}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-5 text-primary-foreground/80 sm:leading-6">
            Selecione uma matéria para acessar os cursos, aulas e materiais.
          </p>
        </section>

        <section aria-labelledby="materias-concurso">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Catálogo de estudos
            </p>
            <h2 id="materias-concurso" className="mt-1 text-lg font-black sm:text-xl">
              {isRf ? "Matérias da PRF" : `Matérias — ${concurso.nome}`}
            </h2>
          </div>
          {isRf ? (
            <>
              <div className="space-y-6">
                {(Object.keys(FRENTES) as Frente[]).map((frente) => {
                  const materias = MATERIAS.filter((materia) => materia.frente === frente);
                  if (!materias.length) return null;
                  return (
                    <div key={frente}>
                      <h3 className="mb-2 text-sm font-bold text-muted-foreground">
                        {ICONES_FRENTE[frente]}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {materias.map((materia) => {
                          const aulas = todasAulas(materia);
                          const feitas = aulas.filter((aula) =>
                            concluidas.includes(aula.id),
                          ).length;
                          const progresso = Math.round((feitas / Math.max(aulas.length, 1)) * 100);
                          return (
                            <Link
                              key={materia.id}
                              to="/estudo/$materiaId"
                              params={{ materiaId: materia.id }}
                              className="rounded-xl border bg-card p-4 transition hover:border-primary hover:shadow-sm"
                            >
                              <h4 className="font-bold">{materia.nome}</h4>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {materia.modulos.length} cursos · {feitas}/{aulas.length} aulas ·{" "}
                                {Math.floor((segundosPorMateria[materia.id] ?? 0) / 3600)}h
                                estudadas
                              </p>
                              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${progresso}%` }}
                                />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                to="/importar"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                <FolderOpen className="h-4 w-4" />
                Abrir trilha semanal e progresso PRF
              </Link>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                As matérias e os cursos são organizados nas pastas deste concurso.
              </p>
              <DriveBrowser pastaId={concurso.pastaId} />
              <p className="text-xs text-muted-foreground">
                O acesso aos materiais depende das permissões da sua conta Google.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
