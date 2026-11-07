import { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Lock, User } from "lucide-react";
import { entrar } from "@/lib/auth.functions";

const KEY = "prf-auth";
const AuthCtx = createContext<{ sair: () => void }>({ sair: () => {} });
export const useAuth = () => useContext(AuthCtx);

export function AuthGate({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<"carregando" | "fora" | "dentro">("carregando");
  useEffect(() => {
    setEstado(localStorage.getItem(KEY) === "ok" ? "dentro" : "fora");
  }, []);
  const sair = () => { localStorage.removeItem(KEY); setEstado("fora"); };

  if (estado === "carregando") return <div className="min-h-screen bg-background" />;
  if (estado === "fora") return <Login onOk={() => { localStorage.setItem(KEY, "ok"); setEstado("dentro"); }} />;
  return <AuthCtx.Provider value={{ sair }}>{children}</AuthCtx.Provider>;
}

function Login({ onOk }: { onOk: () => void }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErro(""); setEnviando(true);
    try {
      const r = await entrar({ data: { usuario, senha } });
      if (r.ok) onOk(); else setErro("Usuário ou senha incorretos.");
    } catch {
      setErro("Não foi possível entrar. Tente novamente.");
    } finally { setEnviando(false); }
  }

  const campo = "w-full rounded-md border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";
  return (
    <div className="grid min-h-screen place-items-center bg-hero px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src="/ct-lago-logo.jpg" alt="CT Lago Concursos" className="h-20 w-20 rounded-full border-2 border-accent object-cover" />
          <h1 className="font-display text-2xl font-black">CT Lago <span className="text-primary">Concursos</span></h1>
          <p className="text-sm text-muted-foreground">Acesso restrito. Entre com seu usuário e senha.</p>
        </div>
        <label className="mb-1 block text-sm font-medium" htmlFor="usuario">Usuário</label>
        <div className="relative mb-4">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input id="usuario" autoComplete="username" className={campo} value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
        </div>
        <label className="mb-1 block text-sm font-medium" htmlFor="senha">Senha</label>
        <div className="relative mb-4">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input id="senha" type="password" autoComplete="current-password" className={campo} value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </div>
        {erro && <p role="alert" className="mb-4 text-sm font-medium text-destructive">{erro}</p>}
        <button disabled={enviando} className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
