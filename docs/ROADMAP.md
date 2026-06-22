# ROADMAP — Trilha v1.0

> Companion do [PRD.md](./PRD.md). Divide o produto em **fases → blocos de construção → SPECs**.
> Cada SPEC é uma unidade implementável e verificável isolada. Specs detalhadas em [`/docs/specs`](./specs).

---

## Princípios de execução

1. **Spec-driven.** Nada é codado sem um SPEC aprovado. Um SPEC = um PR.
2. **Ordem por dependência, não por vontade.** Um SPEC só começa quando suas dependências estão `done`.
3. **Motor antes de UI.** A lógica pura (Fase 1) é validada com teste antes de qualquer tela.
4. **Cada fase entrega algo demonstrável.** Fim da Fase 2 = produto público usável sem login.

---

## Visão de fases

| Fase | Nome | Entrega demonstrável | SPECs |
|---|---|---|---|
| 0 | Fundação | Repo roda, dataset tipado | 001–002 |
| 1 | Motor (cérebro) | `gerarPlano()` testado | 003–004 |
| 2 | Produto público | Quiz → plano datado, sem login | 005–007 |
| 3 | Auth & persistência | Login, plano e progresso salvos | 008–011 |
| 4 | Lead & retenção | Captura de lead, recálculo, admin | 012–015 |

---

## Blocos de construção e SPECs

### Fase 0 — Fundação
**Bloco A · Esqueleto do projeto**
- [x] `SPEC-001` — Scaffold Next.js (App Router) + TS + Tailwind + shadcn + estrutura de pastas + deploy Vercel vazio.

**Bloco B · Dados de domínio**
- [x] `SPEC-002` — Dataset tipado dos 9 cursos (fase, horas, módulos, aulas reais) como fonte única de verdade.

### Fase 1 — Motor de planejamento *(o cérebro — isolado, sem UI)*
**Bloco C · Lógica pura**
- [x] `SPEC-003` — Função `gerarPlano(input) → Cronograma`: cálculo de carga, alocação por módulo, datas, veredito de data-alvo.
- [x] `SPEC-004` — Suíte de testes do motor cobrindo os edge cases do PRD §6.

### Fase 2 — Produto público (sem login)
**Bloco D · Captura de input**
- [x] `SPEC-005` — Landing + Quiz de 4 perguntas (estado client, mobile-first).

**Bloco E · Visualização do plano**
- [x] `SPEC-006` — Tela de cronograma datado (render do `Cronograma`, visual MAVIK).
- [x] `SPEC-007` — Progresso local pré-login (checkboxes por aula em `localStorage`).

### Fase 3 — Auth & persistência
**Bloco F · Infra de dados**
- [x] `SPEC-008` — Neon + Drizzle: schema (`profile`, `plan`, `progress`) + migrations.

**Bloco G · Identidade**
- [x] `SPEC-009` — Neon Auth (email magic link + Google OAuth) + middleware de rotas protegidas.

**Bloco H · Persistência do usuário**
- [x] `SPEC-010` — Lazy registration: "salvar meu plano" → cadastro → migra estado local p/ Neon.
- [x] `SPEC-011` — Toggle de progresso server-side + Cloudflare Turnstile no cadastro.

### Fase 4 — Lead & retenção (P1)
**Bloco I · Lead**
- [ ] `SPEC-012` — Coleta de segmento (obrigatório) + WhatsApp/Instagram (opcional) no perfil.
- [ ] `SPEC-014` — Admin/export de leads (view ou CSV).

**Bloco J · Engajamento**
- [ ] `SPEC-013` — Recalcular plano preservando progresso (ancorado em `lesson_id`).
- [ ] `SPEC-015` — Lembretes por email/WhatsApp (Brevo/Evolution) — *opcional, fast-follow.*

---

## Grafo de dependências

```
001 ─┬─> 002 ─> 003 ─> 004 ─┬─> 005 ─> 006 ─> 007 ─┬─> 008 ─> 009 ─> 010 ─> 011 ─┬─> 012 ─> 014
     │                      │                       │                            └─> 013
     └──────────────────────┘ (002 também alimenta 006)                          └─> 015 (após 011)
```

Caminho crítico: **001 → 002 → 003 → 004 → 005 → 006 → 008 → 009 → 010 → 011**.
007, 012–015 são paralelizáveis quando suas dependências fecham.

---

## Definition of Done (global, por SPEC)

- [ ] Acceptance criteria do SPEC atendidos.
- [ ] Type-check e lint limpos.
- [ ] Testes do bloco passando (quando o SPEC define testes).
- [ ] Commit em Conventional Commits, escopo = bloco/módulo.
- [ ] PR único, revisável, referenciando o número do SPEC.

---

*Trilha v1.0 · MAVIK · 18JUN26*
