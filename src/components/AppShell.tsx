import { Link } from "@tanstack/react-router";
import { LogOut, Moon, Shield, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useLms } from "@/lib/lms-store";
import { useAuth } from "@/components/AuthGate";

export function AppShell({ children }: { children: ReactNode }) {
  const { dark, toggleDark } = useLms();
  const { sair } = useAuth();
  const link = "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground";
  const active = { className: "rounded-md px-3 py-2 text-sm font-medium bg-secondary text-foreground" };
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 sm:px-4 md:h-14 md:flex-nowrap md:py-0">
          <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-lg font-black">
            <span className="grid h-8 w-8 place-items-center rounded bg-primary text-primary-foreground"><Shield className="h-4 w-4" /></span>
            Rumo<span className="text-accent dark:text-primary">PRF</span>
          </Link>
          <nav className="order-last -mx-1 flex w-full gap-1 overflow-x-auto whitespace-nowrap md:order-none md:ml-4 md:w-auto">
            <Link to="/" className={link} activeOptions={{ exact: true }} activeProps={active}>Painel</Link>
            <Link to="/importar" className={link} activeProps={active}>Drive & Trilha</Link>
            <Link to="/plano" className={link} activeProps={active}>Plano</Link>
            <Link to="/estudo/$materiaId" params={{ materiaId: "penal" }} className={link} activeProps={active}>Estudar</Link>
          </nav>
          <button onClick={toggleDark} aria-label="Alternar tema" className="ml-auto shrink-0 rounded-md border p-2 hover:bg-secondary">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={sair} aria-label="Sair" className="flex items-center gap-1 rounded-md border px-3 py-2 text-sm hover:bg-secondary">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
