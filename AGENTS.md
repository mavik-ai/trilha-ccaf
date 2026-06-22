# AGENTS.md — Trilha

> Contexto persistente do projeto para agentes (Antigravity, Claude Code, Cursor).
> Antigravity lê este arquivo a cada sessão. Mantém ≤ ~500 linhas.

## O que é
Trilha: planejador público e gratuito de estudos para a certificação CCA-F da Anthropic.
Quiz (4 perguntas) → motor gera cronograma datado → usuário acompanha progresso.
Cadastro é **tardio e opcional** (lazy registration). Sem validação de identidade no v1.

## Documentos de verdade (ler antes de codar)
- Produto/escopo: `@docs/PRD.md`
- Fases e blocos: `@docs/ROADMAP.md`
- Unidades de trabalho: `@docs/specs/SPECS.md` (SPEC-001…015)

**Regra de ouro:** nada é implementado sem um SPEC. Um SPEC = um PR. Specs em ordem de dependência (ver ROADMAP). Antes de iniciar um SPEC, releia o SPEC e suas dependências.

## Stack (não trocar sem decisão registrada)
- Next.js (App Router) · TypeScript · Tailwind · shadcn/ui
- Deploy: Vercel · DB: Neon (região AWS) · ORM: Drizzle
- Auth: Neon Auth (Better Auth) — email magic link + Google. **Não** usar Supabase.
- Anti-bot: Cloudflare Turnstile. Notificações (P1): Brevo (email), Evolution API (WhatsApp).

## Convenções
- Fonte: Urbanist (texto) + JetBrains Mono (código/números). Lime de marca: `#F1FD44`. Tema dark.
- Lime nunca como texto sobre fundo claro.
- Commits: Conventional Commits, subject em inglês imperativo ≤50 chars. Escopo = módulo (web, planner, db, auth, data…).
- Lógica de negócio é **pura e testável** (sem React/I/O) em `src/lib`. UI nunca recalcula o plano por conta própria — sempre chama o motor.
- `lessonId` é estável (`curso_modulo_aula`); progresso é ancorado nele, nunca em datas.

## Ordem de construção (resumo)
Fase 0 fundação (SPEC 001–002) → Fase 1 motor + testes (003–004) → Fase 2 quiz+plano público (005–007) → Fase 3 auth+persistência (008–011) → Fase 4 lead+retenção (012–015).
**Motor antes de UI.** Não construir telas antes de `gerarPlano()` ter testes verdes.

## Regras de segurança/dados
- Não logar segredos. Envs via `.env` (ver `.env.example`).
- Plano e progresso são por usuário; isolar por `user_id`.
- Coleta de WhatsApp/Instagram é opcional e declarativa (sem validar posse no v1).

## Definition of Done
Acceptance do SPEC + type-check + lint + testes do bloco + commit convencional + PR único referenciando o SPEC.
