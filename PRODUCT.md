# SquadIA — Documento de Produto

> Última atualização: 15/03/2026

---

## 1. O Produto

### Proposta de Valor
Plataforma SaaS que permite empresas montarem times de agentes de IA sem conhecimento técnico — em minutos, sem código, sem DevOps.

### O Problema
Empresas querem usar IA para automatizar processos, mas não têm equipe técnica para configurar, hospedar ou orquestrar agentes. As soluções existentes exigem código, DevOps ou conhecimento avançado de prompts.

### A Solução
Dashboard visual onde o cliente cria agentes em linguagem natural, faz upload de documentos de contexto (FAQs, processos, políticas) e conecta canais de comunicação. Os agentes operam de forma autônoma, se comunicam entre si e escalam para humano quando necessário.

### Diferencial
Não é chatbot. É um time de agentes com:
- Memória persistente
- Contexto compartilhado entre agentes
- Capacidade de executar tarefas — não apenas responder perguntas
- Interface em português, feita para o mercado brasileiro

---

## 2. Mercado-Alvo

### Público Principal
PMEs brasileiras que precisam escalar operações sem contratar mais pessoas.

### Setores prioritários (MVP)
- Clínicas e consultórios
- E-commerce
- Imobiliárias
- Escritórios de contabilidade

### Por que agora
- Apps de IA B2C geraram US$4,5B em 2024, projetam US$156B até 2030
- Soluções multi-agente existentes (AutoGPT, CrewAI) são muito técnicas
- Mercado brasileiro sem concorrência com essa abordagem
- Janela de 18–24 meses antes dos grandes players se moverem

---

## 3. Modelo de Negócio

| Plano | Preço | Limites |
|-------|-------|---------|
| Starter | R$499/mês | 3 agentes, 1 canal |
| Pro | R$999/mês | 8 agentes, 3 canais |
| Enterprise | R$2.499/mês | Ilimitado, SLA, onboarding dedicado |

**Meta 12 meses:** 100 clientes no plano Pro → R$100k MRR

---

## 4. Arquitetura do Produto

```
Frontend (React + Vite)
    ↕ SDK direto
Supabase (DB + Auth + Realtime)
    ↕ eventos / triggers
Orchestrator (Node.js — processo persistente)
    ↕ gerencia sessões
OpenClaw (instância por cliente)
    ↕ conecta
Canais (WhatsApp, Telegram, Slack)
```

### Por que essa separação
- Frontend fala direto com Supabase — sem API REST tradicional
- Orchestrator Node.js é o elo entre Supabase e OpenClaw
- RLS (Row Level Security) do Supabase garante isolamento de dados por cliente

---

## 5. Stack Técnica

### Frontend
- **React + Vite + TypeScript** — SPA, sem SSR (overkill para dashboard autenticado)
- **Tailwind CSS** — layout e customizações
- **shadcn/ui** — componentes base
- **Zustand** — estado global
- **TanStack Query** — data fetching e cache
- **i18next** — internacionalização (pt-BR, en, es)

### Backend / Dados
- **Supabase** — Postgres gerenciado, Auth, Realtime, Storage
- **Node.js** — Orchestrator (processo persistente)

### Integrações
- **WhatsApp Business API** via Evolution API (open source, self-hosted)
- **Telegram Bot API** nativo
- **OpenClaw** — motor dos agentes

### Infra
- **Railway** — deploy do orchestrator e OpenClaw por cliente

---

## 6. Banco de Dados

### Tabelas principais
| Tabela | Descrição |
|--------|-----------|
| `companies` | Workspace por cliente |
| `agents` | Agentes com personalidade e contexto |
| `tasks` | Tarefas atribuídas a agentes |
| `messages` | Histórico de conversas por agente |
| `activity_feed` | Log de eventos em tempo real |
| `channels` | Canais conectados por empresa |
| `documents` | Arquivos de contexto dos agentes |
| `user_profiles` | Perfil do usuário + vínculo com empresa |

---

## 7. Telas do MVP

1. **Login** — Magic link + Google OAuth
2. **Onboarding** (wizard 3 passos)
   - Dados da empresa
   - Criação do primeiro agente
   - Conexão de canal
3. **Dashboard** — Cards de agentes + feed de atividade em tempo real
4. **Agentes** — Lista/grid + criação + edição
5. **Detalhe do Agente** — Conversas, Tarefas, Documentos
6. **Tarefas** — Kanban (Inbox → Em andamento → Concluído)
7. **Configurações** — Canais, plano, dados da empresa

---

## 8. Design System

### Estilo
Tech/moderno sem deixar de ser clean e minimalista. Inspirado em Supabase, Linear, Vercel e Resend.

### Fonte
**Geist Sans** (open source, Vercel) + **Geist Mono** para código e IDs

### Cor primária
`#6366F1` — indigo vibrante (transmite tecnologia, inteligência, confiança)

### Modo padrão
Dark mode como padrão, com suporte a light mode

### Mobile-first
- Sidebar como Sheet drawer em mobile
- Bottom navigation bar em mobile (4 tabs)
- Cards em coluna única em mobile
- Touch targets mínimo 44×44px

### Animações e micro-interações
- Cards: hover com elevação sutil (border + shadow)
- Status badge "processando": dot com animação pulse
- Page transitions: fade-in 150ms
- Modais: scale-in
- Loading: skeleton shimmer
- Botões: scale 0.98 no active

---

## 9. i18n

Idiomas suportados:
- 🇧🇷 Português (pt-BR) — padrão
- 🇺🇸 Inglês (en)
- 🇪🇸 Espanhol (es)

Seletor de idioma no header. Detecção automática pelo browser.

---

## 10. Roadmap

### MVP (agora)
- [x] Estrutura do projeto (React + Vite + Supabase)
- [x] Auth com magic link
- [x] Onboarding
- [x] CRUD de agentes, tarefas, canais
- [x] Schema SQL completo com RLS
- [ ] Redesign com design system (em andamento)
- [ ] i18n pt-BR / en / es (em andamento)
- [ ] Animações e micro-interações (em andamento)

### Pós-MVP
- [ ] Orchestrator Node.js (liga Supabase ↔ OpenClaw)
- [ ] Integração WhatsApp Business real
- [ ] Integração Telegram
- [ ] Agentes executando de verdade
- [ ] Realtime dashboard (status ao vivo dos agentes)
- [ ] Analytics e métricas
- [ ] Billing via Stripe

### Futuro
- [ ] Marketplace de templates de agentes
- [ ] Multi-canal simultâneo por agente
- [ ] White-label
- [ ] Integrações CRM/ERP

---

## 11. Repositório

- **Local:** `~/Projects/squadia`
- **Dev:** `http://localhost:5300`
- **Supabase:** `https://ytmkaujhzrfxkvzufppo.supabase.co`

---

## 12. Inspirações e Referências

- **Bhanu Teja P** — ["The Complete Guide to Building Mission Control"](https://x.com/pbteja1998/status/2017662163540971756) — prova de conceito do multi-agente com OpenClaw
- **Supabase, Linear, Vercel, Resend** — referências visuais e de UX (documentadas em `DESIGN_SYSTEM.md`)
- **Pesquisa de mercado** — `Documents/Cara/market-research-ia-b2c.pdf`

---

*Documento mantido por Cara 🦀 via OpenClaw*
