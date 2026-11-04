import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { gerarTrilha, MATERIAS } from "./lms-data";

type State = {
  concluidas: string[];
  concluidasEm: Record<string, string>;
  horasSemana: number;
  segundosPorMateria: Record<string, number>;
  simulados: number;
  trilha: ReturnType<typeof gerarTrilha> | null;
  sincronizadoEm: string | null;
  dark: boolean;
};
const initial: State = {
  concluidas: [],
  concluidasEm: {},
  horasSemana: 20,
  segundosPorMateria: {},
  simulados: 0,
  trilha: gerarTrilha(MATERIAS),
  sincronizadoEm: null,
  dark: false,
};
const KEY = "prf-lms-v3";

type Ctx = State & {
  toggleAula: (id: string) => void;
  addTempo: (materiaId: string, s: number) => void;
  setTrilha: (t: State["trilha"]) => void;
  sincronizar: () => void;
  toggleDark: () => void;
  setHorasSemana: (h: number) => void;
};
const C = createContext<Ctx | null>(null);

export function LmsProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try { const r = localStorage.getItem(KEY); if (r) setS({ ...initial, ...JSON.parse(r) }); } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(s));
    document.documentElement.classList.toggle("dark", s.dark);
  }, [s, loaded]);

  const v: Ctx = {
    ...s,
    toggleAula: (id) => setS((p) => {
      const em = { ...p.concluidasEm };
      if (p.concluidas.includes(id)) { delete em[id]; return { ...p, concluidas: p.concluidas.filter((x) => x !== id), concluidasEm: em }; }
      em[id] = new Date().toISOString();
      return { ...p, concluidas: [...p.concluidas, id], concluidasEm: em };
    }),
    setHorasSemana: (h) => setS((p) => ({ ...p, horasSemana: h })),
    addTempo: (m, sec) => setS((p) => ({ ...p, segundosPorMateria: { ...p.segundosPorMateria, [m]: (p.segundosPorMateria[m] ?? 0) + sec } })),
    setTrilha: (t) => setS((p) => ({ ...p, trilha: t })),
    sincronizar: () => setS((p) => ({ ...p, sincronizadoEm: new Date().toISOString() })),
    toggleDark: () => setS((p) => ({ ...p, dark: !p.dark })),
  };
  return <C.Provider value={v}>{children}</C.Provider>;
}
export const useLms = () => {
  const c = useContext(C);
  if (!c) throw new Error("LmsProvider ausente");
  return c;
};
export const fmtHoras = (s: number) => `${Math.floor(s / 3600)}h${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}`;
