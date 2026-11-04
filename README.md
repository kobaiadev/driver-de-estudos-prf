# RumoPRF — Plataforma de Estudos para o Concurso da PRF

Aplicação web completa para organizar os estudos do concurso da Polícia Rodoviária Federal, conectada ao Google Drive do usuário: as videoaulas e PDFs reais da pasta de estudos viram matérias, cursos e aulas navegáveis, com trilha semanal, plano de estudos baseado em técnicas comprovadas e registro de progresso.

## Funcionalidades

- **Painel** (`/`) — visão geral: horas de estudo, simulados, % do edital concluído, aulas concluídas e cartões por matéria agrupados em frentes (Direito, Trânsito, Exatas, Linguagens, Mentorias).
- **Drive & Trilha** (`/importar`) — navegação real pela pasta do Google Drive (pastas abrem ao clicar, arquivos abrem no Drive) e a **Trilha de Estudos**: todas as 700+ aulas do Drive distribuídas em semanas, intercalando cursos, mentorias, Passo Estratégico, bizus e simulados. Cada item da trilha abre a aula exata na tela Estudar.
- **Estudar** (`/estudo/:materiaId`) — tela de estudo com lista de módulos/aulas, vídeos reproduzidos direto do Drive (com abas quando a aula tem vários vídeos), links para PDFs e Passo Estratégico, botão "Marcar Aula como Concluída" e cronômetro Pomodoro (25/5) que soma tempo de foco à matéria.
- **Plano de Estudos** (`/plano`) — plano baseado em técnicas com evidência científica (prática de recuperação, revisão espaçada, intercalação, Pomodoro, questões estilo Cebraspe): divisor de horas semanais, distribuição por matéria conforme o peso no edital, ciclo de estudos e lista de **revisões pendentes** (24h, 7 dias e 30 dias após cada aula concluída).
- **Progresso** — registro de aulas concluídas com data, barras de progresso por semana, por matéria e por curso na trilha.
- **Tema claro/escuro** e layout em português (pt-BR).

## Tecnologias

- [TanStack Start](https://tanstack.com/start) (React 19 + Vite 7) com SSR
- [TanStack Router](https://tanstack.com/router) e [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Lovable Cloud](https://docs.lovable.dev/features/cloud) — conector do Google Drive via gateway
- Tipografia: Archivo (títulos) + Hind (texto)

## Estrutura do projeto

```text
src/
├── routes/
│   ├── __root.tsx            # Layout raiz (provedores, fontes, SEO)
│   ├── index.tsx             # Painel (dashboard)
│   ├── importar.tsx          # Drive real + Trilha de estudos
│   ├── estudo.$materiaId.tsx # Tela de estudo (vídeo, PDFs, Pomodoro)
│   └── plano.tsx             # Plano de estudos e revisões
├── components/
│   ├── AppShell.tsx          # Cabeçalho e navegação
│   └── ui/                   # Componentes shadcn
├── lib/
│   ├── lms-data.ts           # Matérias, frentes e geração da trilha
│   ├── drive-catalogo.json   # Catálogo gerado a partir do Drive (snapshot)
│   ├── drive.functions.ts    # Função de servidor que lista pastas do Drive
│   ├── lms-store.tsx         # Estado global + persistência (localStorage)
│   ├── plano.ts              # Pesos das matérias e distribuição de horas
│   └── plano.test.ts         # Testes do plano
└── styles.css                # Design tokens (tema claro/escuro)
```

## Como rodar localmente (VSCode)

Pré-requisitos: Node.js 20+ (recomendado instalar com [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
git clone <url-do-repositorio>
cd <nome-da-pasta>
npm install
npm run dev
```

O site abre em `http://localhost:5173`.

### Variáveis de ambiente

A listagem do Google Drive depende de duas chaves de servidor. Copie o arquivo de exemplo e preencha:

```sh
cp .env.example .env
```

| Variável              | Onde obter                                                        |
| --------------------- | ----------------------------------------------------------------- |
| `LOVABLE_API_KEY`     | Projeto → Configurações → Segredos (no Lovable)                    |
| `GOOGLE_DRIVE_API_KEY` | Criada ao vincular a conexão do Google Drive (Configurações → Segredos) |

> Sem essas chaves o app roda normalmente, mas a aba de navegação do Drive em "Drive & Trilha" não lista as pastas. As matérias, aulas, trilha e plano funcionam com o catálogo já incluído no repositório.

O arquivo `.env` está no `.gitignore` — as chaves nunca vão para o GitHub.

## Scripts

```sh
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm run preview  # pré-visualiza o build
npm run test     # testes (vitest)
```

## Observações importantes

- **Catálogo é um snapshot**: `src/lib/drive-catalogo.json` foi gerado a partir da pasta do Drive em um momento específico. Arquivos novos adicionados ao Drive não aparecem automaticamente nas matérias/aulas — é preciso regenerar o catálogo.
- **Vídeos do Drive exigem login Google**: o player embutido usa a pré-visualização do Drive; quem não estiver logado em uma conta Google com acesso à pasta não consegue assistir.
- **Progresso fica no navegador**: aulas concluídas, horas e simulados são salvos em `localStorage` (sem conta de usuário). Trocar de navegador ou limpar os dados zera o progresso.
- **Privacidade**: o app não tem login; publicado, qualquer pessoa com a URL pode navegar pela estrutura da pasta do Drive conectada.

## Documentação

Veja [docs/DOCUMENTACAO.md](docs/DOCUMENTACAO.md) para a documentação completa (arquitetura, fluxo de dados, modelo de dados e decisões técnicas).

---

Projeto construído com [Lovable](https://lovable.dev) — as alterações feitas no editor são commitadas diretamente neste repositório.
