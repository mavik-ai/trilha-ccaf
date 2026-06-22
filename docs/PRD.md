# PRD — Trilha v1.0
### Planejador de estudos para a certificação Claude Certified Architect (CCA-F)

> **Codinome:** Trilha *(provisório)* · **Owner:** Rafael (MAVIK) · **Status:** Draft 1.0 · **Data:** 18 jun 2026
> **Stack-alvo:** Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · Vercel · Neon · Neon Auth

---

## 1. TL;DR

Trilha é uma ferramenta pública e gratuita que transforma a certificação CCA-F da Anthropic num plano de estudos pessoal e datado. O usuário responde um quiz de 4 perguntas (disponibilidade semanal, nível atual, data de início, data-alvo) e recebe na hora um cronograma semana-a-semana com as aulas reais dos cursos oficiais. Pode acompanhar o progresso marcando cada aula. O cadastro é **opcional e tardio** (lazy registration): a pessoa vê o plano inteiro sem login, e só cria conta quando quer salvar e sincronizar entre dispositivos.

**Decisão-chave de produto:** sem validação de identidade no caminho crítico. Captura de lead (email/WhatsApp/segmento) só no momento de salvar, quando o valor percebido é máximo.

---

## 2. Problema

A Anthropic lançou a CCA-F (primeira certificação técnica oficial) e 17+ cursos gratuitos, mas **não existe um plano de estudos datado e pessoal**: o aprendiz precisa garimpar 9 cursos espalhados, estimar carga horária por conta, e organizar manualmente em quanto tempo consegue terminar. O resultado é abandono — sem um "começa aqui e termina dia X", a maioria nunca passa da intenção.

**Quem sente:** desenvolvedores e profissionais de IA querendo a credencial, que têm tempo fragmentado e nenhuma referência de quanto vão levar.
**Custo de não resolver:** a pessoa nunca começa, ou começa sem sequência e desiste no meio.

---

## 3. Goals

1. **Ativação:** ≥60% de quem inicia o quiz recebe um plano gerado (completa as 4 perguntas).
2. **Valor imediato:** plano datado e completo entregue em <1 segundo após o quiz, sem login.
3. **Captura de lead qualificada:** ≥25% dos que veem o plano criam conta para salvar.
4. **Engajamento real:** ≥40% dos cadastrados marcam ao menos 1 aula concluída na primeira semana.
5. **Lead utilizável:** cada cadastro entrega email + (opcional) WhatsApp + segmento para nutrição futura.

---

## 4. Non-Goals (v1.0)

1. **Validação de identidade (OTP, OAuth Instagram).** Fricção alta, valor baixo para um planejador gratuito. Reavaliar se virar pago ou com vaga limitada.
2. **Validação de posse de Instagram.** A API oficial exige conta Business + app review da Meta (4–6 semanas). Fora de escopo; @ será campo declarativo opcional.
3. **Conteúdo próprio / hospedar aulas.** Trilha organiza e linka para os cursos oficiais no Skilljar; não reproduz conteúdo.
4. **Pagamento / planos pagos.** v1 é 100% gratuito. Monetização é decisão posterior.
5. **App nativo (iOS/Android).** Web responsivo resolve. PWA é P2.
6. **Granularidade de tempo por aula individual.** A Anthropic não publica duração por aula; o motor planeja por horas de curso e aloca por módulo (ver §8).

---

## 5. Personas

**P1 — O Construtor (primário).** Dev com experiência prática (meses a anos), tempo fragmentado, quer a credencial mas não sabe em quanto tempo consegue. Provavelmente pula a base e foca no técnico.

**P2 — O Iniciante Estruturado.** Conhece Claude pelo chat, quer entrar no mundo de build/agentes de forma guiada. Precisa da Fase 0 e de um ritmo gentil.

**P3 — O Lead (visão de negócio MAVIK).** Toda pessoa cadastrada é um contato qualificado interessado em IA aplicada — público-alvo de serviços/produtos MAVIK.

---

## 6. User Stories

Ordenadas por prioridade.

1. Como **visitante**, quero responder um quiz curto e ver meu plano completo **sem precisar de cadastro**, para avaliar o valor antes de me comprometer.
2. Como **visitante**, quero informar quanto tempo tenho por semana e quando começo, para receber um cronograma com **datas reais** em vez de uma lista solta.
3. Como **visitante com data-alvo**, quero que a ferramenta me diga se meu ritmo é suficiente, para ajustar expectativa antes de começar.
4. Como **visitante que já domina o básico**, quero pular a fase introdutória, para não perder tempo com o que já sei.
5. Como **usuário cadastrado**, quero salvar meu plano e marcar aulas concluídas, para acompanhar progresso entre sessões e dispositivos.
6. Como **usuário cadastrado**, quero ver meu % de progresso e quanto falta, para manter a motivação.
7. Como **usuário**, quero recalcular meu plano se minha disponibilidade mudar, sem perder o progresso já feito.
8. Como **operador MAVIK**, quero exportar/consultar os leads cadastrados (email, WhatsApp opcional, segmento), para nutrição e contato.

**Edge cases a cobrir:**
- Quiz abandonado no meio (estado parcial não quebra).
- Data-alvo no passado ou impossível (ritmo exigido absurdo) → aviso claro, não erro.
- Disponibilidade mínima (3h) com base incluída → plano longo, mostrar honestamente as semanas.
- Usuário recalcula plano → progresso por aula preservado (ancorado em lesson_id, não em data).

---

## 7. Requisitos

### Must-Have (P0) — sem isto, não lança

**P0.1 — Quiz de planejamento (4 perguntas)**
- [ ] Disponibilidade semanal: 3h / 5h / 8h / 10h+
- [ ] Nível: "já domino o básico do Claude" (sim → pula Fase 0 / não → inclui)
- [ ] Início: Hoje / Amanhã / Escolher data (date picker)
- [ ] Data-alvo do exame: Não tenho / Escolher data
- [ ] Funciona em mobile, sem login, estado mantido entre as perguntas
- Acceptance: *Dado que respondi as 4 perguntas, quando finalizo, então vejo um plano datado em <1s sem tela de cadastro.*

**P0.2 — Motor de planejamento** (ver §8 para a lógica)
- [ ] Calcula carga total em horas conforme nível (com/sem Fase 0)
- [ ] Divide por disponibilidade semanal → nº de semanas
- [ ] Aloca cursos/módulos em ordem de fase respeitando a cota semanal
- [ ] Carimba datas reais (Semana N = início + (N-1)·7 dias)
- [ ] Se há data-alvo: calcula ritmo necessário e emite veredito (folgado / no limite / inviável)
- Acceptance: *Dado 5h/sem, nível avançado, início hoje, então recebo ~4 semanas com cursos técnicos alocados e datas a partir de hoje.*

**P0.3 — Cronograma visual datado**
- [ ] Semanas como blocos, cada uma com cursos/módulos e intervalo de datas
- [ ] Cada aula com checkbox (reaproveita estrutura do tracker atual — 179 aulas reais)
- [ ] Barra de progresso geral e por semana
- [ ] Link "↗ abrir curso" para o Skilljar em cada curso
- [ ] Visual MAVIK (dark, Urbanist, lime)

**P0.4 — Lazy registration**
- [ ] Plano visível 100% sem conta
- [ ] CTA "salvar meu plano" dispara cadastro leve (Neon Auth: email magic link ou Google)
- [ ] No cadastro coleta: email (obrigatório), segmento de negócio (dropdown, obrigatório), WhatsApp (opcional), Instagram @ (opcional)
- [ ] Após cadastro, plano + progresso persistem no Neon vinculados ao user_id
- Acceptance: *Dado que vejo meu plano, quando clico em salvar e completo o cadastro, então o plano e qualquer check já feito ficam salvos na minha conta.*

**P0.5 — Persistência de progresso por usuário**
- [ ] Marcar/desmarcar aula grava no Neon (`progress`)
- [ ] Login em outro dispositivo carrega o mesmo progresso
- [ ] Anti-bot: Cloudflare Turnstile no form de cadastro

### Nice-to-Have (P1) — fast-follow

- **P1.1** Recalcular plano sem perder progresso (mudar disponibilidade/data).
- **P1.2** Lembrete por email/WhatsApp ("Semana 2 começa amanhã") via Brevo/Evolution.
- **P1.3** Tela de admin/exportação de leads (CSV ou view no Neon).
- **P1.4** "Compartilhar meu plano" (link público read-only do cronograma).
- **P1.5** Exportar cronograma para .ics (Google Calendar).

### Future Considerations (P2) — projetar sem construir

- **P2.1** Simulados/quizzes de prática por domínio do exame.
- **P2.2** PWA com notificação push.
- **P2.3** Validação forte (OTP WhatsApp) se houver vaga limitada ou versão paga.
- **P2.4** Multi-certificação (quando a Anthropic lançar trilhas além da CCA-F).
- **P2.5** Integração com o registro do exame / Partner Network.

---

## 8. Spec do Motor de Planejamento (o cérebro)

### 8.1 Dataset base (fixo, já levantado das páginas oficiais do Skilljar)

| Curso | Fase | Horas | Aulas | Inclui só se… |
|---|---|---|---|---|
| Claude 101 | 0 | 2.5 | 14 | nível = iniciante |
| AI Fluency | 0 | 3.5 | 15 | nível = iniciante |
| Building with the Claude API | 1 | 8.0 | 85 | sempre |
| Claude Platform 101 | 1 | 1.5 | 14 | sempre |
| Claude Code in Action | 2 | 3.0 | 21 | sempre |
| Agent Skills | 2 | 1.0 | ~8* | sempre |
| Introduction to MCP | 3 | 2.5 | 14 | sempre |
| MCP: Advanced Topics | 3 | 2.0 | ~4* | sempre |
| Introduction to Subagents | 4 | 1.0 | 4 | sempre |

\* Grade aula-a-aula não confirmada (tópicos oficiais). Núcleo técnico ≈ **19h**; com Fase 0 ≈ **25h**.

### 8.2 Algoritmo (pseudocódigo)

```
entrada: horasSemana, incluiBase(bool), dataInicio, dataAlvo|null

cursos = dataset.filtrar(c => c.fase>0 OU incluiBase)
horasTotais = soma(cursos.horas)

# 1. Quantas semanas no ritmo escolhido
semanasNecessarias = ceil(horasTotais / horasSemana)

# 2. Alocação: percorre cursos em ordem de fase, enchendo cada semana
#    até a cota (horasSemana). Um curso pode atravessar semanas;
#    a quebra acontece em fronteira de MÓDULO (nunca no meio de um módulo),
#    porque não temos duração por aula.
semanas = alocar(cursos, horasSemana)  # lista de {datas, itens[]}

# 3. Datas reais
para cada semana[i]:
    semana[i].inicio = dataInicio + (i)*7 dias
    semana[i].fim    = semana[i].inicio + 6 dias

# 4. Veredito de data-alvo (se houver)
se dataAlvo:
    semanasDisponiveis = floor((dataAlvo - dataInicio) / 7)
    ritmoNecessario = horasTotais / semanasDisponiveis
    se ritmoNecessario <= horasSemana:        => "FOLGADO" (termina antes)
    senão se ritmoNecessario <= horasSemana*1.2 => "NO LIMITE" (apertado)
    senão                                        => "INVIÁVEL" (sugere nova data OU +Xh/sem)

saída: { semanas[], veredito, terminaEm: semanas.ultima.fim }
```

### 8.3 Regras de honestidade do motor
- Nunca inventa duração de aula. Aloca por hora de curso, quebra por módulo.
- Sempre mostra a data real de término calculada.
- Para data-alvo inviável, **não** "espreme" o plano em silêncio — diz o ritmo que seria preciso e oferece as duas saídas (estender data ou subir horas).
- Fase 3 e 4 (MCP + agêntica) marcadas como "alto peso no exame" no cronograma, mesmo sendo curtas.

---

## 9. Arquitetura técnica

```
[ Browser ]
   │  quiz (client) → motor roda no client p/ preview instantâneo sem login
   ▼
[ Next.js App Router @ Vercel ]
   ├─ /            landing + quiz
   ├─ /plano       cronograma (server component, hidrata progresso se logado)
   ├─ /api/*       Route Handlers (salvar plano, toggle progresso)
   └─ Server Actions p/ mutações autenticadas
   │
   ├── Neon Auth (Better Auth) ── email magic link + Google OAuth
   ▼
[ Neon Postgres ]  schema app + schema neon_auth
   └─ Drizzle ORM

Cloudflare: DNS + Turnstile (anti-bot). R2 reservado p/ assets futuros.
```

**Por que Vercel e não Cloudflare Pages:** o produto deixou de ser estático. Neon Auth roda em região AWS e integra nativamente com Next.js/Vercel sem TCP workarounds; CF Workers exigiria o driver HTTP do Neon e auth construído à mão. CF segue como DNS + Turnstile.

---

## 10. Modelo de dados (Neon)

```sql
-- usuários: gerido pelo Neon Auth em schema neon_auth (users_sync)
-- abaixo, schema da aplicação:

-- perfil/lead (1:1 com auth user)
create table profile (
  user_id      uuid primary key references neon_auth.users_sync(id),
  segment      text not null,            -- segmento de negócio (obrigatório)
  whatsapp     text,                     -- opcional
  instagram    text,                     -- opcional, declarativo
  created_at   timestamptz default now()
);

-- plano salvo (1:1 — v1 guarda só o plano ativo)
create table plan (
  user_id        uuid primary key references neon_auth.users_sync(id),
  hours_week     int not null,
  include_base   boolean not null,
  start_date     date not null,
  target_date    date,
  generated_at   timestamptz default now()
);

-- progresso por aula (N por usuário)
create table progress (
  user_id    uuid references neon_auth.users_sync(id),
  lesson_id  text not null,              -- ex: "api_5_3" (curso_modulo_aula)
  done_at    timestamptz default now(),
  primary key (user_id, lesson_id)
);
```

Progresso ancorado em `lesson_id` (estável), não em data — por isso recalcular o plano (P1.1) não perde checks.

---

## 11. Métricas de sucesso

**Leading (dias–semanas):**
- Taxa de conclusão do quiz: alvo 60% / stretch 75%.
- Taxa de cadastro pós-plano: alvo 25% / stretch 40%.
- Ativação (≥1 aula marcada em 7 dias): alvo 40%.
- Tempo quiz→plano: <1s (técnico).

**Lagging (semanas–meses):**
- Retenção D30 (volta a marcar aula): alvo 20%.
- Leads qualificados/mês (com segmento + contato): meta a definir pós-lançamento.
- Conclusão de trilha completa (todos os cursos do plano): observacional.

Medição: eventos no client + queries SQL no Neon (sem ferramenta paga no v1).

---

## 12. Roadmap

**Milestone 0 — Motor (cérebro, isolado)** · *primeiro entregável*
Função pura `gerarPlano(input) → cronograma`. Testável sem UI. Inclui dataset, alocação por módulo, datas, veredito de data-alvo. **Aprovar isto antes de qualquer tela.**

**Milestone 1 — Quiz + Plano sem login**
Landing, quiz de 4 perguntas, cronograma datado renderizado no client. Reaproveita o visual e as 179 aulas do tracker atual. Deploy na Vercel. *Já é útil e demonstrável publicamente.*

**Milestone 2 — Auth + persistência**
Neon Auth (email + Google), schema no Neon, salvar plano, progresso por usuário, Turnstile. Lazy registration completo.

**Milestone 3 — Lead & retenção (P1)**
Coleta de segmento/WhatsApp/Instagram no cadastro, exportação de leads, recalcular plano, lembretes via Brevo/Evolution.

**Milestone 4 — Polimento & P2 seletivos**
.ics, compartilhar plano, PWA — conforme tração.

---

## 13. Open Questions

- **[Produto]** Nome definitivo do produto e domínio? (codinome "Trilha" é provisório)
- **[Produto]** Segmento de negócio: lista fechada de opções? Quais?
- **[Eng]** Confirmar grade aula-a-aula de Agent Skills e MCP Advanced, ou manter por tópico? (não-bloqueante)
- **[Dados]** Onde fica o "admin" de leads no v1 — query direta no Neon ou tela mínima? (P1)
- **[Negócio]** Captura de WhatsApp opcional é suficiente, ou MAVIK quer WhatsApp obrigatório (com o custo de conversão)? — *trade-off lead vs. fricção*
- **[Eng]** Região do Neon (AWS) e proximidade com Vercel para latência.

---

## 14. Timeline

Sem deadline contratual. Sequência sugerida, sem datas rígidas:
1. Motor (M0) — base de tudo, validar lógica primeiro.
2. Quiz + plano público (M1) — primeiro deploy demonstrável.
3. Auth + persistência (M2) — vira produto de verdade.
4. M3/M4 conforme tração.

Dependência única externa: conta Neon (com Neon Auth habilitado, região AWS) + projeto Vercel. Ambas grátis no tier inicial.

---

*Trilha v1.0 · MAVIK · 18JUN26*
