# SPECS — Trilha v1.0

> Unidades de implementação derivadas do [ROADMAP.md](./ROADMAP.md). Um SPEC = um PR.
> Formato de cada SPEC: **Objetivo · Depende de · Tasks · Arquivos · Acceptance · Fora de escopo.**

---

## SPEC-001 — Scaffold do projeto
**Fase 0 · Bloco A** · Depende de: —

**Objetivo:** repositório Next.js rodando local e na Vercel, vazio mas com fundação correta.

**Tasks:**
- [ ] `create-next-app` com App Router, TypeScript, Tailwind, ESLint, src dir.
- [ ] Instalar e inicializar shadcn/ui; adicionar Urbanist + JetBrains Mono.
- [ ] Definir tokens MAVIK no Tailwind (preto, surface, border, lime #F1FD44).
- [ ] Estrutura: `src/app`, `src/components`, `src/lib`, `src/data`, `docs/`.
- [ ] `.env.example` com placeholders (DATABASE_URL, NEON_AUTH_*, TURNSTILE_*).
- [ ] Deploy inicial na Vercel (página "em construção").

**Arquivos:** `package.json`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `.env.example`.

**Acceptance:**
- Dado o repo clonado, quando rodo `dev`, então abre sem erro com fonte/tema MAVIK.
- Deploy na Vercel acessível por URL pública.

**Fora de escopo:** qualquer lógica de negócio.

---

## SPEC-002 — Dataset de cursos (fonte de verdade)
**Fase 0 · Bloco B** · Depende de: 001

**Objetivo:** os 9 cursos como dado tipado e único, consumido pelo motor e pela UI.

**Tasks:**
- [ ] Tipos `Course`, `Module`, `Lesson` (id estável `curso_modulo_aula`).
- [ ] Campos por curso: `id, name, url, phase(0-4), hours, domainTag, optionalBase(bool), modules[]`.
- [ ] Popular com a grade real já levantada (Claude 101 14 · AI Fluency 15 · API 85 · Platform 101 14 · Code in Action 21 · MCP 14 · Subagents 4; Agent Skills e MCP Advanced por tópico, flag `approx`).
- [ ] Função `totalHours(includeBase)` e `coursesFor(includeBase)`.

**Arquivos:** `src/data/courses.ts`, `src/lib/types.ts`.

**Acceptance:**
- `coursesFor(false)` retorna só fases 1–4; soma ≈ 19h.
- `coursesFor(true)` inclui fase 0; soma ≈ 25h.
- Todo `lessonId` é único no dataset.

**Fora de escopo:** persistência; UI.

---

## SPEC-003 — Motor `gerarPlano()`
**Fase 1 · Bloco C** · Depende de: 002

**Objetivo:** função pura que transforma input do quiz em cronograma datado. Sem React, sem I/O.

**Tasks:**
- [ ] Tipos `PlanInput { hoursWeek, includeBase, startDate, targetDate? }` e `Cronograma { weeks[], verdict, endDate }`.
- [ ] Calcular `totalHours` via dataset.
- [ ] `weeksNeeded = ceil(total / hoursWeek)`.
- [ ] Alocação: percorre cursos em ordem de fase, enche cada semana até a cota; **quebra só em fronteira de módulo** (nunca no meio de módulo).
- [ ] Carimbar datas: `week[i].start = startDate + i*7`, `end = start + 6`.
- [ ] Veredito de data-alvo: folgado / no limite (≤1.2×) / inviável + ritmo necessário sugerido.
- [ ] Marcar semanas de Fase 3/4 como "alto peso no exame".

**Arquivos:** `src/lib/planner.ts`, `src/lib/types.ts`.

**Acceptance (Given/When/Then):**
- Dado 5h/sem, avançado, início hoje, sem alvo → ~4 semanas, cursos técnicos alocados, datas a partir de hoje.
- Dado data-alvo que exige 8h mas usuário marcou 5 → veredito `inviável` com "precisaria de ~8h/sem".
- Nunca parte um módulo entre duas semanas.

**Fora de escopo:** renderização; salvar.

---

## SPEC-004 — Testes do motor
**Fase 1 · Bloco C** · Depende de: 003

**Objetivo:** blindar a lógica do cérebro com testes dos edge cases do PRD §6.

**Tasks:**
- [ ] Setup Vitest.
- [ ] Caso: 3h/sem com base incluída → plano longo, sem erro.
- [ ] Caso: data-alvo no passado → veredito inviável, sem throw.
- [ ] Caso: 10h+/sem avançado → poucas semanas.
- [ ] Caso: integridade — soma de horas alocadas = total; nenhuma aula duplicada/perdida.
- [ ] Caso: fronteira de módulo respeitada.

**Arquivos:** `src/lib/planner.test.ts`, `vitest.config.ts`.

**Acceptance:** `npm test` verde; cobertura dos 5 casos acima.

---

## SPEC-005 — Landing + Quiz
**Fase 2 · Bloco D** · Depende de: 004

**Objetivo:** captar os 4 inputs e disparar a geração, mobile-first, sem login.

**Tasks:**
- [ ] Landing curta com proposta de valor + CTA "Montar meu plano".
- [ ] Quiz 4 passos: horas/semana (3/5/8/10+), nível (base sim/não), início (hoje/amanhã/data), data-alvo (não/data).
- [ ] Estado em client (sem persistência ainda); validação de datas.
- [ ] Ao concluir → chama `gerarPlano` e navega para `/plano` com o resultado.

**Arquivos:** `src/app/page.tsx`, `src/components/quiz/*`.

**Acceptance:** completar 4 perguntas gera plano em <1s, sem tela de cadastro; funciona em viewport mobile.

**Fora de escopo:** salvar plano.

---

## SPEC-006 — Tela de cronograma
**Fase 2 · Bloco E** · Depende de: 005, 002

**Objetivo:** renderizar o `Cronograma` no visual MAVIK.

**Tasks:**
- [ ] Bloco por semana com intervalo de datas e cursos/módulos.
- [ ] Banner de veredito de data-alvo (folgado/limite/inviável) com a recomendação.
- [ ] Badge "alto peso no exame" nas Fases 3/4.
- [ ] Link "↗ abrir curso" por curso (Skilljar).
- [ ] Botão "exportar PDF" (print CSS).

**Arquivos:** `src/app/plano/page.tsx`, `src/components/plan/*`.

**Acceptance:** plano datado legível, veredito visível, sem login.

---

## SPEC-007 — Progresso local (pré-login)
**Fase 2 · Bloco E** · Depende de: 006

**Objetivo:** marcar aulas e ver progresso antes de existir conta.

**Tasks:**
- [ ] Checkbox por aula (estrutura do tracker atual, 179 aulas).
- [ ] Barra geral + por semana.
- [ ] Persistir em `localStorage` (chave versionada) com try/catch.

**Arquivos:** `src/components/plan/lesson-checklist.tsx`, `src/lib/local-progress.ts`.

**Acceptance:** marcar aula persiste no reload; barra atualiza.

**Fora de escopo:** sync entre dispositivos.

---

## SPEC-008 — Neon + schema (Drizzle)
**Fase 3 · Bloco F** · Depende de: 007

**Objetivo:** banco pronto com as 3 tabelas do PRD §10.

**Tasks:**
- [ ] Projeto Neon (região AWS, p/ Neon Auth) + `DATABASE_URL`.
- [ ] Drizzle: tabelas `profile`, `plan`, `progress` (FK p/ `neon_auth.users_sync`).
- [ ] Migrations versionadas + script de migrate.
- [ ] Driver serverless (`@neondatabase/serverless`) no client.

**Arquivos:** `src/db/schema.ts`, `drizzle.config.ts`, `src/db/index.ts`.

**Acceptance:** migrate aplica sem erro; tabelas visíveis no console Neon.

---

## SPEC-009 — Neon Auth
**Fase 3 · Bloco G** · Depende de: 008

**Objetivo:** login por email (magic link) e Google.

**Tasks:**
- [ ] Habilitar Neon Auth no console (Better Auth) + env vars.
- [ ] `createNeonAuth()` server + `createAuthClient()` client.
- [ ] Páginas `/auth/sign-in` e `/auth/sign-up` (AuthView).
- [ ] Middleware protegendo `/conta` (não o `/plano`, que é público).

**Arquivos:** `src/lib/auth/*`, `src/app/auth/*`, `middleware.ts`.

**Acceptance:** consigo logar com Google e com magic link; sessão persiste.

**Fora de escopo:** OTP de WhatsApp (P2).

---

## SPEC-010 — Lazy registration + salvar plano
**Fase 3 · Bloco H** · Depende de: 009

**Objetivo:** transformar visitante em usuário no pico de valor, sem perder estado.

**Tasks:**
- [ ] CTA "salvar meu plano" no `/plano`.
- [ ] Fluxo: cadastro → grava `plan` + migra checks do `localStorage` p/ `progress`.
- [ ] Server Action `savePlan(input)` e `importLocalProgress(map)`.
- [ ] Pós-login, `/plano` hidrata do Neon.

**Arquivos:** `src/app/actions/plan.ts`, `src/components/plan/save-cta.tsx`.

**Acceptance:** dado plano com checks locais, ao cadastrar, plano e checks aparecem na conta; em outro dispositivo idem.

---

## SPEC-011 — Progresso server-side + anti-bot
**Fase 3 · Bloco H** · Depende de: 010

**Objetivo:** progresso autenticado confiável e form protegido.

**Tasks:**
- [ ] Server Action `toggleLesson(lessonId)` grava/remove em `progress`.
- [ ] Optimistic UI no checklist.
- [ ] Cloudflare Turnstile no cadastro + verificação server-side.
- [ ] Rate limit básico nas actions.

**Arquivos:** `src/app/actions/progress.ts`, `src/components/auth/turnstile.tsx`.

**Acceptance:** toggle reflete no Neon; cadastro sem token Turnstile válido é rejeitado.

---

## SPEC-012 — Captura de lead
**Fase 4 · Bloco I** · Depende de: 011

**Objetivo:** coletar dados de negócio no cadastro/perfil.

**Tasks:**
- [ ] Campo segmento (dropdown, obrigatório) na criação de conta.
- [ ] WhatsApp e Instagram (opcionais) no perfil.
- [ ] Gravar em `profile`; validação leve de formato.
- [ ] *(Decisão pendente: WhatsApp opcional vs obrigatório — ver PRD §13.)*

**Arquivos:** `src/app/conta/perfil/*`, `src/app/actions/profile.ts`.

**Acceptance:** segmento obrigatório bloqueia salvar vazio; opcionais aceitam vazio.

---

## SPEC-013 — Recalcular plano
**Fase 4 · Bloco J** · Depende de: 011

**Objetivo:** mudar disponibilidade/data sem perder progresso.

**Tasks:**
- [ ] UI "recalcular" reusando o quiz com valores atuais.
- [ ] Regerar `Cronograma`; atualizar `plan`.
- [ ] Garantir que `progress` (ancorado em `lessonId`) é preservado.

**Arquivos:** `src/app/conta/recalcular/*`.

**Acceptance:** dado 30 aulas marcadas, ao recalcular de 5h→8h/sem, os 30 checks permanecem.

---

## SPEC-014 — Admin/export de leads
**Fase 4 · Bloco I** · Depende de: 012

**Objetivo:** MAVIK consultar/exportar leads.

**Tasks:**
- [ ] Rota protegida `/admin` (só role admin).
- [ ] Listagem de `profile` + join com auth (email, segmento, contato, data).
- [ ] Export CSV.

**Arquivos:** `src/app/admin/*`.

**Acceptance:** admin vê lista e baixa CSV; não-admin é bloqueado.

---

## SPEC-015 — Lembretes (opcional)
**Fase 4 · Bloco J** · Depende de: 011

**Objetivo:** reengajar por email/WhatsApp no início de cada semana.

**Tasks:**
- [ ] Cron (Vercel Cron) que detecta início de semana do plano por usuário.
- [ ] Disparo via Brevo (email) e/ou Evolution API (WhatsApp).
- [ ] Opt-out.

**Arquivos:** `src/app/api/cron/reminders/route.ts`, `src/lib/notify/*`.

**Acceptance:** usuário com semana iniciando hoje recebe 1 mensagem; opt-out interrompe.

**Fora de escopo:** v1 pode adiar; é fast-follow.

---

*Trilha v1.0 · MAVIK · 18JUN26 · 15 SPECs · 5 fases · 10 blocos*
