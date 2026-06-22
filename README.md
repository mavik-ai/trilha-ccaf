# Trilha CCA-F — Planejador de Estudos

Um planejador de estudos público, pessoal e datado para a certificação oficial **Claude Certified Architect - Associate (CCA-F)** da Anthropic.

O projeto transforma o catálogo de 9 cursos gratuitos da Anthropic em um cronograma semana-a-semana adaptado à sua disponibilidade de tempo e à sua data-alvo de exame, oferecendo acompanhamento de progresso interativo e registro tardio e opcional (*lazy registration*).

---

## 🎯 Proposta de Valor e Recursos

*   **Quiz em 4 Passos**: O usuário informa sua disponibilidade semanal, nível atual (iniciante ou avançado), data de início e (opcionalmente) a data-alvo do exame.
*   **Cronograma Datado Sem Login**: Geração instantânea (<1s) de um plano de estudos com datas reais para cada semana, sem exigir login prévio.
*   **Alocação Inteligente por Módulos**: O motor de planejamento aloca a carga horária em blocos de módulos inteiros, garantindo que você nunca precise interromper um módulo pela metade no final de uma semana.
*   **Veredito de Prazo**: Se uma data-alvo for definida, o motor calcula se a cota de horas atual é suficiente, emitindo um veredito real (*FOLGADO*, *NO LIMITE* ou *INVIÁVEL*) e sugerindo o ritmo necessário de estudo.
*   **Persistência e Sincronização (Lazy Registration)**: Crie conta de forma rápida (Magic Link ou Google) apenas no momento de salvar o progresso, integrando os dados locais salvos no `localStorage` ao banco de dados Neon.

---

## 🛠️ Stack Tecnológica

*   **Framework**: Next.js 15 (App Router)
*   **Linguagem**: TypeScript
*   **Estilização**: Tailwind CSS v4 + shadcn/ui
*   **Design System**: Identidade visual MAVIK (Tema escuro padrão com fontes Urbanist e JetBrains Mono, com detalhes e destaques na cor Lime `#F1FD44`)
*   **Banco de Dados & ORM**: Neon Serverless (Postgres) + Drizzle ORM
*   **Autenticação**: Neon Auth / Better Auth (Magic Link via E-mail + Google OAuth)
*   **Segurança**: Cloudflare Turnstile (anti-bot)
*   **Notificações**: Brevo (e-mail) e Evolution API (WhatsApp)

---

## 📂 Estrutura do Projeto

```text
├── docs/               # Documentos fundamentais do projeto (PRD, ROADMAP, SPECS)
├── public/             # Assets estáticos públicos do Next.js
├── src/
│   ├── app/            # Páginas, layouts, server actions e rotas da aplicação
│   │   ├── actions/    # Server Actions (plano, progresso, etc.)
│   │   └── globals.css # Estilos globais e tokens MAVIK (Tailwind v4 theme inline)
│   ├── components/     # Componentes React (Quiz, Cronograma, ui-shadcn)
│   ├── data/           # Dataset estático dos cursos (courses.ts)
│   └── lib/            # Lógica pura do sistema (types, planner.ts)
├── .env.example        # Arquivo de exemplo para variáveis de ambiente
├── components.json     # Configuração do shadcn/ui
└── package.json        # Dependências e scripts do projeto
```

---

## 🚀 Como Executar

### 1. Clonar o projeto e instalar dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o template do arquivo de variáveis:
```bash
cp .env.example .env
```
Preencha as credenciais no arquivo `.env` gerado.

### 3. Rodar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` para visualizar a página de "Em Construção".

### 4. Executar Verificações Estáticas (Typecheck e Linter)
Garantir a integridade do código sem erros:
```bash
# Executa a validação de tipos TypeScript
npx tsc --noEmit

# Executa o linter ESLint
npm run lint
```

---

## 📈 Fases de Entrega (ROADMAP)

O projeto está dividido em 15 unidades de trabalho sequenciais (SPECs) e 5 fases principais:
*   **Fase 0 — Fundação**: Repositório configurado, design system MAVIK e dataset tipado dos 9 cursos (SPECs 001 e 002) - **[CONCLUÍDO]**
*   **Fase 1 — Motor (Cérebro)**: Lógica pura do motor `gerarPlano` e suíte de testes de edge cases (SPECs 003 e 004) - **[EM ANDAMENTO]**
*   **Fase 2 — Produto Público**: Landing page, quiz de captação e cronograma visual interativo sem login (SPECs 005 a 007).
*   **Fase 3 — Auth & Persistência**: Banco de dados Neon, Better Auth, lazy registration e sincronização de progresso (SPECs 008 a 011).
*   **Fase 4 — Lead & Retenção**: Coleta de perfil empresarial, recalcular plano, admin de exportação de leads e lembretes semanais (SPECs 012 a 015).

---

MAVIK © 2026
