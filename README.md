# SquadIA

Uma plataforma SaaS que permite empresas montarem times de agentes de IA sem conhecimento técnico.

## Stack Tecnológica

- **Frontend:** React + Vite + TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Backend/DB:** Supabase (Auth, Postgres, Realtime, Storage)
- **Estado:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Roteamento:** React Router

## Funcionalidades

- ✅ Autenticação com Magic Link e Google OAuth
- ✅ Onboarding em 3 etapas (Empresa → Agente → Canal)
- ✅ Dashboard com visão geral de agentes e atividades
- ✅ Gestão completa de agentes de IA
- ✅ Quadro Kanban para gerenciar tarefas
- ✅ Feed de atividades em tempo real
- ✅ Integrações com canais (WhatsApp, Telegram, Email, Instagram)
- ✅ Configurações de empresa e canais

## Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)

## Setup do Projeto

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd squadia
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Copie a URL do projeto e a chave anônima (anon key)
3. Execute o SQL do arquivo `supabase/schema.sql` no SQL Editor do Supabase

### 4. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 5. Execute o projeto

```bash
npm run dev
```

O projeto estará rodando em `http://localhost:5173`

## Estrutura do Projeto

```
src/
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   ├── layout/          # Sidebar, Header, Layout
│   ├── agents/          # AgentCard, AgentList, AgentModal
│   ├── tasks/           # KanbanBoard, TaskCard, TaskModal
│   └── activity/        # ActivityFeed, ActivityItem
├── pages/
│   ├── Login.tsx
│   ├── Onboarding.tsx
│   ├── Dashboard.tsx
│   ├── Agents.tsx
│   ├── AgentDetail.tsx
│   ├── Tasks.tsx
│   └── Settings.tsx
├── lib/
│   ├── supabase.ts      # Cliente Supabase
│   └── utils.ts         # Funções utilitárias
├── hooks/
│   ├── useAgents.ts
│   ├── useTasks.ts
│   ├── useActivity.ts
│   └── useAuth.ts
├── stores/
│   ├── authStore.ts
│   └── agentStore.ts
├── types/
│   └── index.ts         # Tipos TypeScript
├── App.tsx
└── main.tsx
```

## Schema do Banco de Dados

O projeto utiliza as seguintes tabelas no Supabase:

- `companies` - Dados das empresas
- `agents` - Agentes de IA
- `tasks` - Tarefas do sistema
- `messages` - Mensagens dos agentes
- `activity_feed` - Feed de atividades
- `channels` - Canais de comunicação
- `documents` - Documentos dos agentes
- `user_profiles` - Perfis de usuários

Todas as tabelas possuem Row Level Security (RLS) habilitado para garantir que usuários só acessem dados de sua própria empresa.

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run preview` - Preview da build de produção
- `npm run lint` - Executa o linter

## Fluxo de Uso

1. **Login:** Usuário faz login com email (magic link) ou Google
2. **Onboarding:** Novo usuário configura empresa, primeiro agente e canal
3. **Dashboard:** Visão geral com agentes ativos e feed de atividades
4. **Agentes:** Criação e gestão de agentes de IA com personalidades customizadas
5. **Tarefas:** Quadro Kanban para organizar tarefas (Inbox → Em Andamento → Concluído)
6. **Configurações:** Gerenciar empresa, canais e plano

## Próximos Passos

- [ ] Implementar chat em tempo real com os agentes
- [ ] Conectar integrações reais com WhatsApp, Telegram, etc.
- [ ] Sistema de webhooks para automações
- [ ] Dashboard com métricas e analytics
- [ ] Sistema de billing e planos
- [ ] Upload de documentos para knowledge base dos agentes

## Licença

MIT
