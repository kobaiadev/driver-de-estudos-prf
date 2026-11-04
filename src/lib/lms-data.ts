export type Material = { id: string; titulo: string; tipo: "pdf" | "passo" };
export type Aula = {
  id: string;
  titulo: string;
  duracao: number; // minutos
  videoUrl: string;
  materiais: Material[];
};
export type Modulo = { id: string; titulo: string; aulas: Aula[] };
export type Materia = {
  id: string;
  nome: string;
  frente: Frente;
  pasta: string;
  modulos: Modulo[];
};
export type Frente = "direito" | "exatas" | "transito" | "mentorias";

export const FRENTES: Record<Frente, { nome: string; descricao: string }> = {
  direito: { nome: "Direito", descricao: "Administrativo, Constitucional, Penal, Processual Penal, Legislação Especial" },
  exatas: { nome: "Exatas e Informática", descricao: "Raciocínio Lógico, Informática, Física" },
  transito: { nome: "Trânsito e Direitos Humanos", descricao: "CTB, Resoluções CONTRAN e DH" },
  mentorias: { nome: "Mentorias e Passo Estratégico", descricao: "Encontros, planejamento e simulados" },
};

const VIDEO = "https://www.youtube.com/embed/jNQXAC9IVRw";

function mk(materiaId: string, modulos: [string, string[]][]): Modulo[] {
  return modulos.map(([titulo, aulas], mi) => ({
    id: `${materiaId}-m${mi + 1}`,
    titulo,
    aulas: aulas.map((a, ai) => ({
      id: `${materiaId}-m${mi + 1}-a${ai + 1}`,
      titulo: a,
      duracao: 35 + ((mi * 7 + ai * 11) % 40),
      videoUrl: VIDEO,
      materiais: [
        { id: `${materiaId}-${mi}-${ai}-pdf`, titulo: `${a} — Material em PDF`, tipo: "pdf" },
        { id: `${materiaId}-${mi}-${ai}-passo`, titulo: `Passo Estratégico: ${a}`, tipo: "passo" },
      ],
    })),
  }));
}

export const MATERIAS: Materia[] = [
  { id: "penal", nome: "Direito Penal", frente: "direito", pasta: "03 - Disciplinas Específicas/Direito Penal",
    modulos: mk("penal", [["Teoria do Crime", ["Conceito de crime", "Fato típico", "Ilicitude e culpabilidade"]], ["Crimes em Espécie", ["Crimes contra a pessoa", "Crimes contra o patrimônio", "Crimes contra a Adm. Pública"]]]) },
  { id: "processual", nome: "Processual Penal", frente: "direito", pasta: "03 - Disciplinas Específicas/Processo Penal",
    modulos: mk("processual", [["Inquérito e Ação Penal", ["Inquérito policial", "Ação penal"]], ["Prisões", ["Prisão em flagrante", "Prisão preventiva e temporária"]]]) },
  { id: "constitucional", nome: "Direito Constitucional", frente: "direito", pasta: "03 - Disciplinas Específicas/Constitucional",
    modulos: mk("constitucional", [["Direitos Fundamentais", ["Art. 5º parte 1", "Art. 5º parte 2", "Remédios constitucionais"]], ["Segurança Pública", ["Art. 144 e PRF"]]]) },
  { id: "administrativo", nome: "Direito Administrativo", frente: "direito", pasta: "03 - Disciplinas Específicas/Administrativo",
    modulos: mk("administrativo", [["Fundamentos", ["Princípios", "Poderes administrativos", "Atos administrativos"]], ["Agentes Públicos", ["Lei 8.112/90"]]]) },
  { id: "legislacao", nome: "Legislação Especial", frente: "direito", pasta: "03 - Disciplinas Específicas/Legislação Especial",
    modulos: mk("legislacao", [["Leis Penais", ["Lei de Drogas", "Estatuto do Desarmamento", "Abuso de Autoridade"]]]) },
  { id: "transito", nome: "Legislação de Trânsito", frente: "transito", pasta: "03 - Disciplinas Específicas/Legislação de Trânsito",
    modulos: mk("transito", [["CTB — Parte Geral", ["Sistema Nacional de Trânsito", "Normas gerais de circulação", "Sinalização"]], ["Infrações e Penalidades", ["Infrações", "Medidas administrativas", "Crimes de trânsito"]], ["Resoluções CONTRAN", ["Principais resoluções"]]]) },
  { id: "dh", nome: "Direitos Humanos", frente: "transito", pasta: "03 - Disciplinas Específicas/Direitos Humanos",
    modulos: mk("dh", [["Fundamentos", ["Teoria geral dos DH", "Declaração Universal", "Pacto de San José"]]]) },
  { id: "rlm", nome: "Raciocínio Lógico", frente: "exatas", pasta: "03 - Disciplinas Específicas/Raciocínio Lógico",
    modulos: mk("rlm", [["Lógica Proposicional", ["Proposições", "Tabela-verdade", "Equivalências"]], ["Matemática", ["Porcentagem", "Análise combinatória"]]]) },
  { id: "informatica", nome: "Informática", frente: "exatas", pasta: "03 - Disciplinas Específicas/Informática",
    modulos: mk("informatica", [["Fundamentos", ["Redes e Internet", "Segurança da informação"]], ["Ferramentas", ["Pacote Office", "Linux e Windows"]]]) },
  { id: "fisica", nome: "Física", frente: "exatas", pasta: "03 - Disciplinas Específicas/Física",
    modulos: mk("fisica", [["Cinemática", ["MRU e MRUV", "Lançamentos"]], ["Dinâmica", ["Leis de Newton", "Energia e colisões"]]]) },
  { id: "mentoria", nome: "Mentorias", frente: "mentorias", pasta: "01 - Mentorias",
    modulos: mk("mentoria", [["Mentoria PRF 2025/2026", ["Aula inaugural", "Como montar seu ciclo", "Revisões e simulados"]]]) },
  { id: "passo", nome: "Passo Estratégico", frente: "mentorias", pasta: "04 - Passo Estratégico",
    modulos: mk("passo", [["Simulados", ["Simulado 01 — Comentado", "Simulado 02 — Comentado", "Simulado 03 — Comentado"]]]) },
];

export type DriveNode = { nome: string; filhos?: DriveNode[] };
export const DRIVE_TREE: DriveNode[] = [
  { nome: "Trilha PRF 2025-2026", filhos: [
    { nome: "01 - Mentorias", filhos: [{ nome: "Mentoria PRF 2025/2026" }] },
    { nome: "02 - E-Books Estratégicos", filhos: [{ nome: "Guia do Edital PRF.pdf" }, { nome: "Mapa de Revisões.pdf" }] },
    { nome: "03 - Disciplinas Específicas", filhos: MATERIAS.filter((m) => m.pasta.startsWith("03")).map((m) => ({
      nome: m.pasta.split("/")[1] ?? m.nome, filhos: m.modulos.map((mo) => ({ nome: mo.titulo })),
    })) },
    { nome: "04 - Passo Estratégico", filhos: [{ nome: "Simulados" }] },
  ] },
];

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
