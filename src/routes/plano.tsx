import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, CalendarClock, Repeat, Shuffle, Target, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MATERIAS, todasAulas } from "@/lib/lms-data";
import { useLms } from "@/lib/lms-store";
import { APOIO, distribuirHoras, PESOS } from "@/lib/plano";

export const Route = createFileRoute("/plano")({
  head: () => ({
    meta: [
      { title: "Plano de Estudos PRF — RumoPRF" },
      { name: "description", content: "Plano semanal por matéria com ciclo de estudos, revisões espaçadas e técnicas comprovadas." },
      { property: "og:title", content: "Plano de Estudos PRF — RumoPRF" },
      { property: "og:description", content: "Ciclo de estudos, revisões 24h/7d/30d e prática de questões." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Plano,
});

const TECNICAS = [
  { i: Brain, t: "Prática de recuperação", d: "Depois de cada aula, feche o material e resolva questões ou tente lembrar os pontos principais. É a técnica com melhor resultado nas pesquisas." },
  { i: Repeat, t: "Revisão espaçada", d: "Revise cada aula 1 dia, 7 dias e 30 dias depois. O app lista abaixo as revisões que estão vencendo." },
  { i: Shuffle, t: "Intercalação", d: "Alterne matérias no mesmo dia (o ciclo abaixo já faz isso) em vez de passar semanas numa só." },
  { i: Timer, t: "Pomodoro", d: "Blocos de 25 min de foco com 5 min de pausa. Use o cronômetro da tela Estudar." },
  { i: Target, t: "Questões no estilo Cebraspe", d: "Reserve parte da semana para questões e simulados com correção, anotando os erros." },
  { i: CalendarClock, t: "Evite reler e grifar", d: "Reler e grifar dão sensação de domínio, mas rendem pouco. Prefira testar a si mesmo." },
];

function Plano() {
  const { horasSemana, setHorasSemana, concluidas, concluidasEm } = useLms();
  const { porMateria, questoes, revisao } = distribuirHoras(horasSemana);
  const nome = (id: string) => MATERIAS.find((m) => m.id === id)?.nome ?? id;
  const ordem = Object.entries(PESOS).sort((a, b) => b[1] - a[1]);

  // ciclo: blocos de 1h intercalando matérias conforme o peso
  const ciclo: string[] = [];
  const resta = { ...porMateria };
  while (Object.values(resta).some((h) => (h ?? 0) > 0) && ciclo.length < 200) {
    for (const [id] of ordem) if ((resta[id] ?? 0) > 0) { ciclo.push(id); resta[id] = (resta[id] ?? 0) - 1; }
  }

  const [agora, setAgora] = useState<number | null>(null);
  useEffect(() => setAgora(Date.now()), []);
  const aulasPorId = new Map(MATERIAS.flatMap((m) => todasAulas(m).map((a) => [a.id, { a, m }] as const)));
  const revisoes = agora == null ? [] : Object.entries(concluidasEm).flatMap(([id, em]) => {
    const dias = Math.floor((agora - new Date(em).getTime()) / 86400000);
    const etapa = dias >= 30 ? "30 dias" : dias >= 7 ? "7 dias" : dias >= 1 ? "24 horas" : null;
    const x = aulasPorId.get(id);
    return etapa && x ? [{ id, etapa, ...x }] : [];
  });

  return (
    <AppShell>
      <section className="bg-hero text-primary-foreground dark:text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">Plano de estudos PRF</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Seu ciclo semanal</h1>
          <label className="mt-6 flex max-w-md flex-col gap-2 text-sm">
            Horas de estudo por semana: <span className="font-display text-2xl font-black">{horasSemana}h</span>
            <input type="range" min={6} max={60} step={1} value={horasSemana} onChange={(e) => setHorasSemana(Number(e.target.value))} className="accent-[var(--accent)]" />
          </label>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <section>
          <h2 className="mb-3 text-xl font-bold">Técnicas que funcionam</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TECNICAS.map((t) => (
              <div key={t.t} className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 font-semibold"><t.i className="h-4 w-4 text-primary" />{t.t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{t.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-bold">Divisão da semana</h2>
            <p className="mb-3 text-xs text-muted-foreground">70% teoria · {questoes}h de questões e simulados · {revisao}h de revisão</p>
            <ul className="space-y-2">
              {ordem.map(([id, peso]) => {
                const ids = todasAulas(MATERIAS.find((m) => m.id === id)!).map((a) => a.id);
                const feitas = ids.filter((x) => concluidas.includes(x)).length;
                return (
                  <li key={id} className="text-sm">
                    <Link to="/estudo/$materiaId" params={{ materiaId: id }} className="flex justify-between gap-2 hover:text-primary">
                      <span className="font-semibold">{nome(id)} <span className="text-xs font-normal text-muted-foreground">{"★".repeat(peso)}</span></span>
                      <span className="text-muted-foreground">{porMateria[id]}h/sem · {feitas}/{ids.length} aulas</span>
                    </Link>
                  </li>
                );
              })}
              {APOIO.map((id) => (
                <li key={id} className="text-sm">
                  <Link to="/estudo/$materiaId" params={{ materiaId: id }} className="flex justify-between hover:text-primary">
                    <span className="font-semibold">{nome(id)}</span><span className="text-muted-foreground">nas horas de questões/revisão</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-4">
              <h2 className="font-bold">Ciclo de estudos (blocos de ~1h)</h2>
              <p className="mb-3 text-xs text-muted-foreground">Siga na ordem; quando terminar, recomece do início. Não importa o dia da semana.</p>
              <ol className="flex flex-wrap gap-2">
                {ciclo.map((id, i) => (
                  <li key={i} className="rounded-md border bg-secondary px-2 py-1 text-xs"><span className="text-muted-foreground">{i + 1}.</span> {nome(id)}</li>
                ))}
              </ol>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h2 className="font-bold">Revisões pendentes</h2>
              <p className="mb-3 text-xs text-muted-foreground">Aulas concluídas há 24 horas, 7 dias ou 30 dias.</p>
              {revisoes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma revisão por enquanto. Conclua aulas e elas aparecem aqui no dia seguinte.</p>
              ) : (
                <ul className="space-y-1.5">
                  {revisoes.slice(0, 30).map((r) => (
                    <li key={r.id} className="text-sm">
                      <Link to="/estudo/$materiaId" params={{ materiaId: r.m.id }} search={{ aula: r.id }} className="hover:text-primary">
                        <span className="mr-2 rounded bg-accent px-1.5 py-0.5 text-xs font-semibold text-accent-foreground">{r.etapa}</span>
                        <span className="font-semibold">{r.m.nome}:</span> <span className="text-muted-foreground">{r.a.titulo}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
