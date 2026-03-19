# SquadIA

Plataforma SaaS para montar e gerenciar times de agentes de IA sem conhecimento técnico. Cada agente é uma sessão do [OpenClaw](https://openclaw.ai), com personalidade, especialidades e memória próprias.

## Stack

- **Frontend:** React + Vite + TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Backend/DB:** Supabase (Auth, Postgres, Realtime, Storage)
- **Engine de IA:** OpenClaw Gateway
- **Estado:** Zustand
- **Data Fetching:** TanStack Query
- **Roteamento:** React Router

## Funcionalidades

### Core
- ✅ Autenticação com Magic Link e Google OAuth
- ✅ Onboarding em 3 etapas (Empresa → Agente → Canal)
- ✅ Dashboard com visão geral de agentes e atividades
- ✅ Chat em tempo real com agentes (via OpenClaw)
- ✅ Kanban de tarefas com 6 colunas: `pending → assigned → in_progress → review → done → rejected`
- ✅ Feed de atividades em tempo real

### Agentes
- ✅ Criação com nome automático por locale (pt-BR, en, es...)
- ✅ Avatar com DiceBear automático + upload de imagem + picker de cor
- ✅ Especialidades, cargo e flag `is_senior`
- ✅ Conexão LLM configurável por agente
- ✅ Status automático via OpenClaw health check
- ✅ Sub-agentes: agente pode spawnar especialista temporário durante execução de task
- ✅ Memória persistente: extração automática pós-task, injeção no system prompt

### Roteamento inteligente de tasks
- ✅ Classificador analisa mensagens no Chat → simples responde on-the-fly, complexas viram tasks
- ✅ Orquestrador faz match de tags/especialidades e atribui tasks automaticamente
- ✅ Revisor valida resultado → `done` ou `rejected` com feedback
- ✅ Analista detecta gaps no time e cria novos agentes automaticamente
- ✅ Resultado retorna ao Chat via Supabase Realtime

### Planos e Billing
- ✅ Planos Free / Pro / Enterprise
- ✅ Limites reais do banco (`companies.plan`)
- ✅ Feature locks na UI (criação automática de agentes, análise do time)

## Setup

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- [OpenClaw](https://openclaw.ai) instalado localmente (para dev)

### 1. Clone e instale

```bash
git clone https://github.com/daniellessa/squadia.git
cd squadia
npm install
```

### 2. Configure o Supabase

1. Crie um projeto no Supabase
2. Execute as migrations em ordem: `supabase/migrations/001_*.sql` → `012_*.sql`

### 3. Variáveis de ambiente

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=sua-url
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
VITE_OPENCLAW_GATEWAY_TOKEN=seu-token
VITE_OPENCLAW_GATEWAY_HTTP_URL=http://127.0.0.1:19789
```

### 4. Suba o OpenClaw Gateway

```bash
OPENCLAW_CONFIG_PATH=~/.openclaw-squadia/openclaw.json \
OPENCLAW_STATE_DIR=~/.openclaw-squadia \
openclaw gateway run --port 19789
```

### 5. Rode o projeto

```bash
# Frontend
npm run dev

# Orquestrador (em outro terminal)
npm run orchestrator
```

Frontend: http://localhost:5173

## Estrutura

```
src/
├── components/
│   ├── agents/          # AgentCard, AgentModal, AgentEditModal
│   ├── tasks/           # KanbanBoard, TaskCard, TaskModal
│   ├── layout/          # Sidebar, Layout
│   └── ui/              # Componentes base
├── hooks/
│   ├── useAgents.ts
│   ├── useTasks.ts
│   ├── useChat.ts       # Integrado com OpenClaw
│   ├── useOpenClaw.ts   # Health check + sessions
│   └── usePlanLimits.ts
├── lib/
│   ├── openclaw.ts      # Client HTTP do Gateway
│   ├── classifier.ts    # Classificador de mensagens
│   └── agent-names.ts   # Nomes por locale
├── pages/
│   ├── Chat.tsx
│   ├── Tasks.tsx
│   ├── AgentDetail.tsx
│   ├── Billing.tsx
│   └── Settings.tsx
scripts/
└── orchestrator.mjs     # Orquestrador multi-agente
supabase/
└── migrations/          # 012 migrations aplicadas
```

## Scripts

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run orchestrator # Orquestrador de tasks
```

## Banco de Dados

Tabelas principais:
- `companies` — empresas e plano (`free` / `pro` / `enterprise`)
- `agents` — agentes com especialidades, sessão OpenClaw, LLM connection, memórias
- `tasks` — tarefas com Kanban, tags, assigned_to, review_feedback
- `agent_memories` — memória persistente por agente
- `llm_connections` — conexões LLM reutilizáveis por empresa
- `messages` / `activity_feed` / `channels`

RLS habilitado em todas as tabelas. Orquestrador usa service_role key.

## Próximos Passos

- [ ] Bug: cards Kanban não atualizam automaticamente (Realtime subscription)
- [ ] Conectar integrações reais (WhatsApp, Telegram, Email, Instagram)
- [ ] Dashboard com métricas e analytics
- [ ] Upload de documentos (knowledge base dos agentes)
- [ ] Deploy em VPS para produção

## Licença

MIT
