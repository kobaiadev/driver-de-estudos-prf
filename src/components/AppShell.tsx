import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, ClipboardList, Home, LogOut, Menu, Moon, Route as RouteIcon, Sun, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useLms } from "@/lib/lms-store";
import { useAuth } from "@/components/AuthGate";

export function AppShell({ children }: { children: ReactNode }) {
  const { dark, toggleDark } = useLms();
  const { sair } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => setMobileMenuOpen(false), [pathname]);
  const link = "flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold leading-5 text-sidebar-foreground/75 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
  const active = { className: "flex items-start gap-3 rounded-lg bg-sidebar-primary px-3 py-2.5 text-sm font-semibold leading-5 text-sidebar-primary-foreground shadow-sm" };
  const mobileLink = "flex min-h-11 w-full min-w-0 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium leading-5 text-foreground transition hover:border-primary";
  const mobileActive = { className: "flex min-h-11 w-full min-w-0 items-center gap-2 rounded-lg border border-primary bg-secondary px-3 py-2 text-sm font-semibold leading-5 text-foreground" };
  const currentPage = pathname === "/"
    ? "Seja bem-vindo"
    : pathname.startsWith("/concursos/rf")
      ? "PRF - Polícia Rodoviária Federal"
      : pathname.startsWith("/concursos/camara")
        ? "Polícia Legislativa — Câmara dos Deputados"
        : pathname.startsWith("/concursos/trt")
          ? "Polícia Legislativa — TRT"
          : pathname === "/importar"
            ? "Trilha PRF"
            : pathname === "/plano"
              ? "Plano de estudos"
              : "Estudar";
  const links = (
    <>
      <Link to="/" activeOptions={{ exact: true }} className={link} activeProps={active}><Home className="h-4 w-4" />Seja bem-vindo</Link>
      <Link to="/concursos/$concursoId" params={{ concursoId: "rf" }} className={link} activeProps={active}><BookOpen className="h-4 w-4 shrink-0" /><span>PRF - Polícia Rodoviária Federal</span></Link>
      <Link to="/concursos/$concursoId" params={{ concursoId: "camara" }} className={link} activeProps={active}><BookOpen className="h-4 w-4" />Polícia Legislativa — Câmara dos Deputados</Link>
      <Link to="/concursos/$concursoId" params={{ concursoId: "trt" }} className={link} activeProps={active}><BookOpen className="h-4 w-4" />Polícia Legislativa — TRT</Link>
      <div className="my-2 border-t border-sidebar-border" />
      <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-sidebar-foreground/50">Ferramentas de estudo</p>
      <Link to="/importar" className={link} activeProps={active}><RouteIcon className="h-4 w-4" />Trilha PRF</Link>
      <Link to="/plano" className={link} activeProps={active}><ClipboardList className="h-4 w-4" />Plano de estudos</Link>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-card/95 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <img src="/ct-lago-logo.jpg" alt="CT Lago Concursos" className="h-9 w-9 shrink-0 rounded-full border-2 border-accent object-cover sm:h-11 sm:w-11" />
            <span className="min-w-0">
              <span className="block truncate font-display text-xs font-black uppercase tracking-wide sm:text-base">CT Lago Concursos</span>
              <span className="hidden text-[11px] font-medium text-muted-foreground sm:block">Preparação para carreiras policiais</span>
            </span>
          </Link>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button onClick={toggleDark} aria-label="Alternar tema" className="rounded-lg border border-border p-2 transition hover:bg-secondary sm:p-2.5">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={sair} aria-label="Sair" className="flex items-center gap-1.5 rounded-lg border border-border p-2 transition hover:bg-secondary sm:px-3 sm:py-2.5 sm:text-sm sm:font-semibold">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
       </div>
      </header>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1680px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 md:flex">
          <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/50">Área do aluno</p>
          <nav className="flex flex-col gap-1">{links}</nav>
          <div className="mt-auto rounded-xl border border-sidebar-border bg-card/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Ética · Disciplina · Excelência</p>
            <p className="mt-1 text-xs text-muted-foreground">Um passo de cada vez rumo à aprovação.</p>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <nav aria-label="Navegação principal" className="sticky top-14 z-20 border-b border-border bg-background/95 p-2 backdrop-blur md:hidden">
            <button
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-links"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-sm font-semibold hover:bg-secondary"
            >
              {mobileMenuOpen ? <X className="h-4 w-4 shrink-0" /> : <Menu className="h-4 w-4 shrink-0" />}
              <span className="shrink-0">{mobileMenuOpen ? "Fechar menu" : "Área do aluno"}</span>
              <span className="truncate text-xs font-medium text-muted-foreground">{currentPage}</span>
            </button>
            {mobileMenuOpen && (
              <div id="mobile-navigation-links" className="flex flex-col gap-1.5 px-1 pb-1 pt-2">
                <Link to="/" activeOptions={{ exact: true }} className={mobileLink} activeProps={mobileActive} onClick={() => setMobileMenuOpen(false)}><Home className="h-4 w-4 shrink-0" /><span>Seja bem-vindo</span></Link>
                <Link to="/concursos/$concursoId" params={{ concursoId: "rf" }} className={mobileLink} activeProps={mobileActive} onClick={() => setMobileMenuOpen(false)}><BookOpen className="h-4 w-4 shrink-0" /><span>PRF - Polícia Rodoviária Federal</span></Link>
                <Link to="/concursos/$concursoId" params={{ concursoId: "camara" }} className={mobileLink} activeProps={mobileActive} onClick={() => setMobileMenuOpen(false)}><BookOpen className="h-4 w-4 shrink-0" /><span>Polícia Legislativa — Câmara dos Deputados</span></Link>
                <Link to="/concursos/$concursoId" params={{ concursoId: "trt" }} className={mobileLink} activeProps={mobileActive} onClick={() => setMobileMenuOpen(false)}><BookOpen className="h-4 w-4 shrink-0" /><span>Polícia Legislativa — TRT</span></Link>
                <Link to="/importar" className={mobileLink} activeProps={mobileActive} onClick={() => setMobileMenuOpen(false)}><RouteIcon className="h-4 w-4 shrink-0" /><span>Trilha PRF</span></Link>
                <Link to="/plano" className={mobileLink} activeProps={mobileActive} onClick={() => setMobileMenuOpen(false)}><ClipboardList className="h-4 w-4 shrink-0" /><span>Plano de estudos</span></Link>
              </div>
            )}
          </nav>
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
