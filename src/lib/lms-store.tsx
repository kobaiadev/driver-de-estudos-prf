import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { gerarTrilha, MATERIAS } from "./lms-data";

type State = {
  concluidas: string[];
  segundosPorMateria: Record<string, number>;
  simulados: number;
  trilha: ReturnType<typeof gerarTrilha> | null;
  sincronizadoEm: string | null;
  dark: boolean;
};
const initial: State = {
  concluidas: [],
  segundosPorMateria: {},
  simulados: 0,
  trilha: gerarTrilha(MATERIAS),
  sincronizadoEm: new Date().toISOString(),
  dark: false,
};
const KEY = "prf-lms-v2";

type Ctx = State & {
  toggleAula: (id: string) => void;
  addTempo: (materiaId: string, s: number) => void;
  setTrilha: (t: State["trilha"]) => void;
  sincronizar: () => void;
  toggleDark: () => void;
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
    toggleAula: (id) => setS((p) => ({ ...p, concluidas: p.concluidas.includes(id) ? p.concluidas.filter((x) => x !== id) : [...p.concluidas, id] })),
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
