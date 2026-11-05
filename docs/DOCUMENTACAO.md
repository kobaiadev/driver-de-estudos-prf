# Documentação Técnica — RumoPRF

Documentação completa da arquitetura, do fluxo de dados e das decisões técnicas da plataforma de estudos RumoPRF.

## Sumário

1. [Visão geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Modelo de dados](#modelo-de-dados)
4. [Integração com o Google Drive](#integração-com-o-google-drive)
5. [Estado e persistência](#estado-e-persistência)
6. [Trilha de estudos](#trilha-de-estudos)
7. [Plano de estudos](#plano-de-estudos)
8. [Design system](#design-system)
9. [Testes](#testes)
10. [Limitações conhecidas](#limitações-conhecidas)

---

## Visão geral

O RumoPRF transforma uma pasta real do Google Drive (com cursos, mentorias, videoaulas e PDFs para o concurso da PRF) em uma plataforma de estudos estruturada:

- A pasta do Drive é mapeada para **matérias → cursos (módulos) → aulas → vídeos e PDFs**.
- Todas as aulas entram em uma **trilha semanal** intercalada.
- O progresso (aulas concluídas, tempo de foco, simulados) fica salvo no navegador.
- Um **plano de estudos** distribui as horas semanais por matéria conforme o peso no edital e agenda revisões espaçadas.

## Arquitetura

```text
Navegador (React 19 + TanStack Router/Query)
   │
   ├── Rotas SSR (src/routes/*)
   │     ├── /             Painel
   │     ├── /importar     Drive real + Trilha
   │     ├── /estudo/:id   Tela de estudo
   │     └── /plano        Plano de estudos
   │
   ├── Estado global: LmsProvider (React Context + localStorage)
   │
   └── createServerFn "listarDrive"  (src/lib/drive.functions.ts)
          │
          ▼
   Connector Gateway (https://connector-gateway.lovable.dev/google_drive/...)
          │  headers: Authorization: Bearer LOVABLE_API_KEY
          │           X-Connection-Api-Key: GOOGLE_DRIVE_API_KEY
          ▼
   Google Drive API v3 (conta do usuário conectada)
```

- **Frontend**: TanStack Start (React 19, Vite 7), Tailwind CSS v4, shadcn/ui.
- **Backend**: função de servidor TanStack Start (`createServerFn`) — sem edge functions separadas.
- **Segredos**: `LOVABLE_API_KEY` e `GOOGLE_DRIVE_API_KEY` existem apenas no runtime do servidor (nunca no bundle do navegador).

## Modelo de dados

Definido em `src/lib/lms-data.ts`:

```ts
type Material = { tipo: "pdf" | "passo"; titulo: string; url: string };

type Video = { titulo: string; url: string; driveId?: string };

type Aula = {
  id: string;
  titulo: string;
  duracaoMin: number;        // estimativa: 25 min/vídeo, 20 min/PDF
  videos: Video[];           // um ou mais vídeos do Drive
  materiais: Material[];     // PDFs e Passo Estratégico
};

type Modulo = { id: string; titulo: string; aulas: Aula[] };   // = um curso/pasta do Drive

type Materia = {
  id: string;
  nome: string;
  frente: "direito" | "transito" | "exatas" | "linguagens" | "mentorias";
  modulos: Modulo[];
};
```

- O catálogo (`src/lib/drive-catalogo.json`, ~430 KB) é um **snapshot** gerado por varredura da pasta do Drive: 54 pastas de cursos mapeadas para 18 matérias em 5 frentes, totalizando ~724 aulas, ~3.210 vídeos e ~718 PDFs.
- Vídeos usam a URL de pré-visualização do Drive (`https://drive.google.com/file/d/<id>/preview`) em iframe; PDFs abrem em nova aba.
- Subpastas chamadas apenas "PDFs" ou "Vídeos" **não** viram aulas — seus arquivos entram na aula-pai.

## Integração com o Google Drive

Dois mecanismos distintos:

1. **Navegação ao vivo** (`/importar`): a função de servidor `listarDrive(pastaId?)` chama o connector gateway e lista o conteúdo de uma pasta em tempo real. A pasta raiz padrão é `1-QJd_YEOvsQMOB7OGRBMRzsd2XtNmnla` (constante `PASTA_RAIZ` em `drive.functions.ts`). O botão "Sincronizar pastas" invalida o cache do React Query e busca de novo.
2. **Catálogo estático** (matérias/aulas/trilha): gerado offline a partir do Drive e versionado no repositório. Garante que o app funcione mesmo sem as chaves de ambiente.

Variáveis de ambiente necessárias (ver `.env.example`):

| Variável               | Uso                                                    |
| ---------------------- | ------------------------------------------------------ |
| `LOVABLE_API_KEY`      | Autentica a chamada ao connector gateway                |
| `GOOGLE_DRIVE_API_KEY` | Identifica a conexão do Google Drive no gateway         |

## Estado e persistência

`src/lib/lms-store.tsx` expõe `LmsProvider` / `useLms()` com persistência em `localStorage` (chave atual: `prf-lms-v3` — o sufixo é incrementado quando o formato muda, zerando dados antigos incompatíveis):

```ts
{
  concluidas: string[];                 // ids de aulas concluídas
  concluidasEm: Record<string, string>; // aulaId → data ISO da conclusão (para revisões)
  segundosPorMateria: Record<string, number>; // tempo de foco (Pomodoro)
  simulados: number;
  horasSemana: number;                  // horas disponíveis por semana (plano)
  dark: boolean;
}
```

## Trilha de estudos

`gerarTrilha(porSemana = 12)` em `lms-data.ts`:

1. Achata **todas** as aulas de **todas** as matérias (incluindo mentorias, Passo Estratégico, bizus e simulados).
2. Intercala os cursos em esquema round-robin por módulo, para que cada semana misture matérias e tipos de conteúdo (técnica de intercalação).
3. Agrupa em semanas de `porSemana` aulas (padrão 12 → ~61 semanas).

Cada item da trilha linka para `/estudo/:materiaId?aula=<aulaId>`, que seleciona a aula exata e expande o módulo correspondente. A página `/importar` mostra progresso por semana (barra), por matéria e por curso (painel expansível).

## Plano de estudos

Página `/plano` + lógica em `src/lib/plano.ts`:

- **Pesos por matéria** (`PESOS`): estimativa de importância no edital (Trânsito 4, Português 3, demais 2, Ética/Geopolítica/Inglês/Espanhol 1). Ajustável conforme o edital oficial.
- **Divisão semanal** (`distribuirHoras`): 70% teoria (distribuída pelos pesos), 20% questões/simulados, 10% revisão.
- **Ciclo de estudos**: blocos de ~1h intercalando matérias conforme o peso.
- **Revisões pendentes**: usa `concluidasEm` para listar aulas que completaram 24h, 7 dias ou 30 dias — revisão espaçada baseada em evidências (Dunlosky et al.; testing effect).
- **Técnicas recomendadas** (cartões na página): prática de recuperação, revisão espaçada, intercalação, Pomodoro (25/5), questões estilo Cebraspe; com alerta contra reler/grifar (baixa eficácia comprovada).

## Design system

- Tokens semânticos em `src/styles.css` (tema claro/escuro via classe `.dark`), paleta azul-policial + dourado.
- Tipografia: **Archivo** (títulos) e **Hind** (texto), carregadas via `<link>` em `__root.tsx`.
- Componentes shadcn/ui em `src/components/ui/`; nunca usar cores hardcoded (`bg-white`, `text-black`) fora dos tokens.

## Testes

- `src/lib/plano.test.ts` (vitest): valida a distribuição de horas (soma = total semanal) e a ordenação por peso.
- Rodar com `npm run test`.

## Limitações conhecidas

1. **Catálogo estático**: arquivos novos no Drive não entram automaticamente nas matérias — é preciso regenerar `drive-catalogo.json`.
2. **Vídeos exigem conta Google** com acesso à pasta; o iframe de pré-visualização não funciona deslogado.
3. **Sem autenticação**: o progresso é local (localStorage) e, publicado, o app expõe a estrutura da pasta do Drive a quem tiver a URL.
4. **Durações estimadas**: 25 min por vídeo e 20 min por PDF (o Drive não informa duração de vídeo).
5. **Pesos do edital são estimados**: ajustar `PESOS` em `src/lib/plano.ts` quando o edital oficial sair.
