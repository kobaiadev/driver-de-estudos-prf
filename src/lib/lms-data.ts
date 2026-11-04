import catalogo from "./drive-catalogo.json";

export type Material = { id: string; titulo: string; tipo: "pdf" | "passo"; url: string };
export type Video = { id: string; titulo: string; url: string; abrir: string };
export type Aula = {
  id: string;
  titulo: string;
  duracao: number; // minutos (estimado)
  videos: Video[];
  materiais: Material[];
};
export type Modulo = { id: string; titulo: string; aulas: Aula[] };
export type Materia = { id: string; nome: string; frente: Frente; pasta: string; modulos: Modulo[] };
export type Frente = "direito" | "transito" | "exatas" | "linguagens" | "mentorias";

export const FRENTES: Record<Frente, { nome: string; descricao: string }> = {
  direito: { nome: "Direito", descricao: "Administrativo, Constitucional, Penal, Processual Penal, Legislação Especial" },
  transito: { nome: "Trânsito, DH e Ética", descricao: "CTB, Resoluções CONTRAN, Direitos Humanos e Ética" },
  exatas: { nome: "Exatas e Informática", descricao: "Raciocínio Lógico, Informática, Física" },
  linguagens: { nome: "Linguagens e Atualidades", descricao: "Português, Inglês, Espanhol e Geopolítica" },
  mentorias: { nome: "Mentorias, Bizus e Simulados", descricao: "Encontros, e-books, bizus e rodadas de simulados" },
};

type Raw = { id: string; nome: string; frente: string; modulos: { id: string; titulo: string; aulas: { id: string; t: string; v: string[][]; p: string[][] }[] }[] };
const prev = (id: string) => `https://drive.google.com/file/d/${id}/preview`;
const view = (id: string) => `https://drive.google.com/file/d/${id}/view`;

export const MATERIAS: Materia[] = (catalogo as Raw[]).map((m) => ({
  id: m.id,
  nome: m.nome,
  frente: m.frente as Frente,
  pasta: "Google Drive · PRF",
  modulos: [...m.modulos].sort((a, b) => Number(b.aulas.some((x) => x.v.length)) - Number(a.aulas.some((x) => x.v.length))).map((mo) => {
    const passo = /passo|bizu/i.test(mo.titulo);
    return {
      id: mo.id,
      titulo: mo.titulo,
      aulas: mo.aulas.map((a) => ({
        id: a.id,
        titulo: a.t,
        duracao: a.v.length ? a.v.length * 25 : 20 * Math.max(1, a.p.length),
        videos: a.v.map(([id, t]) => ({ id: id!, titulo: t!, url: prev(id!), abrir: view(id!) })),
        materiais: a.p.map(([id, t]) => ({ id: id!, titulo: t!, tipo: passo ? "passo" : "pdf", url: view(id!) })),
      })),
    };
  }),
}));

export const todasAulas = (m: Materia) => m.modulos.flatMap((mo) => mo.aulas);

/** Distribui as matérias detectadas em semanas: cada semana recebe até `porSemana` aulas, intercalando disciplinas. */
export function gerarTrilha(materias: Materia[], porSemana = 8) {
  const filas = materias.map((m) => todasAulas(m).map((a) => ({ materia: m.nome, materiaId: m.id, aula: a.titulo })));
  const ordem: { materia: string; materiaId: string; aula: string }[] = [];
  let resta = true;
  while (resta) {
    resta = false;
    for (const f of filas) { const x = f.shift(); if (x) { ordem.push(x); resta = true; } }
  }
  const semanas: (typeof ordem)[] = [];
  for (let i = 0; i < ordem.length; i += porSemana) semanas.push(ordem.slice(i, i + porSemana));
  return semanas;
}
