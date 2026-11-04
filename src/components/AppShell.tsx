import { Link } from "@tanstack/react-router";
import { Moon, Shield, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useLms } from "@/lib/lms-store";

export function AppShell({ children }: { children: ReactNode }) {
  const { dark, toggleDark } = useLms();
  const link = "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground";
  const active = { className: "rounded-md px-3 py-2 text-sm font-medium bg-secondary text-foreground" };
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-black">
            <span className="grid h-8 w-8 place-items-center rounded bg-primary text-primary-foreground"><Shield className="h-4 w-4" /></span>
            Rumo<span className="text-accent dark:text-primary">PRF</span>
          </Link>
          <nav className="ml-4 flex gap-1">
            <Link to="/" className={link} activeOptions={{ exact: true }} activeProps={active}>Painel</Link>
            <Link to="/importar" className={link} activeProps={active}>Drive & Trilha</Link>
            <Link to="/plano" className={link} activeProps={active}>Plano</Link>
            <Link to="/estudo/$materiaId" params={{ materiaId: "penal" }} className={link} activeProps={active}>Estudar</Link>
          </nav>
          <button onClick={toggleDark} aria-label="Alternar tema" className="ml-auto rounded-md border p-2 hover:bg-secondary">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
