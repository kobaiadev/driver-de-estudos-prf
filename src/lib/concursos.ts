import { PASTA_RAIZ } from "./drive.functions";

export const CONCURSOS = {
  rf: {
    id: "rf",
    nome: "Polícia Rodoviária Federal",
    sigla: "PRF",
    pastaId: PASTA_RAIZ,
    pastaUrl: `https://drive.google.com/drive/u/0/folders/${PASTA_RAIZ}`,
    descricao: "Acesse as matérias, cursos e materiais de preparação para a PRF.",
  },
  camara: {
    id: "camara",
    nome: "Polícia Legislativa — Câmara dos Deputados",
    sigla: "Câmara",
    pastaId: "1YYq9seDraWB7W-w99GxZQ7Mbl-Vg48AG",
    pastaUrl: "https://drive.google.com/drive/u/0/folders/1YYq9seDraWB7W-w99GxZQ7Mbl-Vg48AG",
    descricao: "Matérias e materiais de preparação para a Polícia Legislativa da Câmara dos Deputados.",
  },
  trt: {
    id: "trt",
    nome: "Polícia Legislativa — TRT",
    sigla: "TRT",
    pastaId: "1KgqMDy5jCdTkXLpL98IRcoYnIKJiaWgk",
    pastaUrl: "https://drive.google.com/drive/u/0/folders/1KgqMDy5jCdTkXLpL98IRcoYnIKJiaWgk",
    descricao: "Matérias e materiais de preparação para a Polícia Legislativa do TRT.",
  },
} as const;

export type ConcursoId = keyof typeof CONCURSOS;
