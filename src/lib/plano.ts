/** Prioridade estimada de cada matéria (1 a 4). Matérias de apoio (mentorias, bizus, simulados) ficam fora do ciclo de teoria. */
export const PESOS: Record<string, number> = {
  transito: 4, portugues: 3, constitucional: 2, administrativo: 2, penal: 2, processual: 2, legislacao: 2, dh: 2,
  rlm: 2, informatica: 2, fisica: 2, etica: 1, geopolitica: 1, ingles: 1, espanhol: 1,
};
export const APOIO = ["mentoria", "bizu", "simulados"];

/** Divide as horas semanais: 70% teoria (por peso), 20% questões/simulados, 10% revisão. */
export function distribuirHoras(horas: number) {
  const teoria = horas * 0.7;
  const soma = Object.values(PESOS).reduce((a, b) => a + b, 0);
  const porMateria = Object.fromEntries(Object.entries(PESOS).map(([id, p]) => [id, Math.round((teoria * p) / soma * 2) / 2]));
  return { porMateria, questoes: Math.round(horas * 0.2 * 2) / 2, revisao: Math.round(horas * 0.1 * 2) / 2 };
}

