# SquadIA — Design System

> Plataforma que permite empresas criarem times de agentes de IA sem conhecimento técnico.
> Documento de referência visual e UX. Baseado em pesquisa das melhores interfaces B2B tech de 2024–2026.

---

## 1. Referências Analisadas

### 1.1 Supabase (supabase.com)
**Estilo:** Developer-first, dark-default, green accent vibrante

**Paleta de cores:**
- Brand green: `#3ECF8E` (Shamrock) — cor primária, muito reconhecível
- Background dark: `#1C1C1C` / `#171717`
- Sidebar background: `#1A1A1A`
- Card background: `#242424`
- Border sutil: `#2E2E2E` / `rgba(255,255,255,0.07)`
- Texto primário: `#EDEDED`
- Texto secundário: `#9A9A9A`
- Erro/destructive: `#F97583`

**Tipografia:**
- Fonte: **Custom UI font** + fallback `system-ui`, com variantes da família Inter
- Headers: 20–24px, `font-weight: 600`
- Body: 13–14px, `font-weight: 400`
- Labels/captions: 11–12px, uppercase com `letter-spacing: 0.08em`
- Código inline: `font-family: monospace`

**Componentes de destaque:**
- **Sidebar:** Largura ~240px, itens com ícone + label, hover com `background rgba(255,255,255,0.05)`, item ativo com fundo verde-sutil e borda esquerda verde
- **Cards:** Borda `1px solid #2E2E2E`, radius `8px`, padding `16–24px`, sombra quase imperceptível
- **Badges de status:** Pill pequeno, fundo colorido com baixa opacidade (verde/amarelo/vermelho/cinza), texto na mesma cor com maior luminosidade
- **Tabelas:** Header com background um tom mais escuro, `font-size: 12px uppercase`, linhas com `border-bottom: 1px solid #2E2E2E`
- **Botão primário:** Fundo `#3ECF8E`, texto escuro `#000`, radius `6px`

**UX Patterns:**
- Densidade média-alta — muita info sem parecer lotado
- Tabs horizontais para navegação dentro de recursos (Database, Auth, Storage, etc.)
- Empty states com CTAs claros e iconografia consistente
- Toasts no canto inferior direito para feedback de ações

---

### 1.2 Linear (linear.app)
**Estilo:** Minimalista tech premium, extremamente polido, "calmer, more cohesive UI"

**Paleta de cores (2024 redesign):**
- Tema dark: Background base `#0F0F0F` / `#111111`
- Sidebar: `#141414` — levemente mais claro que o main
- Superfície elevada (cards, modais): `#1A1A1A`
- Texto primário: `#FFFFFF` / `rgba(255,255,255,0.92)`
- Texto secundário: `rgba(255,255,255,0.50)`
- Texto terciário: `rgba(255,255,255,0.30)`
- Accent purple: `#5E6AD2` (violeta-índigo vibrante)
- Borda: `rgba(255,255,255,0.08)` a `rgba(255,255,255,0.12)`
- Sistema LCH: usa variáveis de base `--bg-color`, `--accent-color`, `--contrast` para gerar temas automaticamente

**Tipografia:**
- Fonte principal: **Inter UI** / **SF Pro Display** (fallback system-ui)
- `font-size: 15px` base no app
- Headings: 16–20px, weight 600–700
- Body/labels: 13–14px, weight 400–500
- Monospace: para código e IDs de issues
- Letter-spacing: `-0.01em` a `-0.02em` nos headings (aperto elegante)

**Componentes de destaque:**
- **Issue row:** Uma linha densa com ícone de status, ID, título truncado, assignee avatar, priority icon, labels — tudo em ~48px de altura
- **Sidebar:** Hierarquia clara em 3 níveis: workspace > equipes > seções. Ícones monocromáticos 16px. Item ativo com fundo sutil e texto mais brilhante
- **Badges de label/priority:** Pill muito pequeno (height ~20px), fundo `rgba(color, 0.15)`, border `rgba(color, 0.30)`, texto na cor
- **Kanban board:** Cards com sombra `box-shadow: 0 1px 2px rgba(0,0,0,0.5)`, título em 13px, meta (labels, assignee) em 11px
- **Command menu:** Fullscreen modal com busca + navegação por teclado

**UX Patterns:**
- **Speed-first:** Atalhos de teclado para tudo. `J/K` para navegar, `/` para buscar
- Transições ultra-suaves: `transition: all 0.1s ease` nos hovers
- Hierarquia visual por contraste de opacidade, não por cores
- Redução de "ruído visual" — bordas só onde necessário, sem sombras pesadas
- Sidebar colapsável até apenas ícones (modo compacto)

---

### 1.3 Vercel (Geist Design System)
**Estilo:** Swiss-inspired minimalismo, tipografia precisa, escala de cinzas dominante

**Paleta de cores (Geist Color System):**
- Background 1 (default): `#000000` (dark) / `#FFFFFF` (light)
- Background 2 (subtle): `#0A0A0A` (dark) / `#FAFAFA` (light)
- Color 1 (hover bg): `#111111` (dark) / `#F2F2F2` (light)
- Color 2 (active bg): `#1A1A1A` (dark) / `#E8E8E8` (light)
- Color 4 (default border): `rgba(255,255,255,0.10)` (dark) / `#E2E2E2` (light)
- Color 5 (hover border): `rgba(255,255,255,0.20)` (dark) / `#CDCDCD` (light)
- Color 9 (secondary text): `#888888` (dark) / `#666666` (light)
- Color 10 (primary text): `#EDEDED` (dark) / `#111111` (light)
- Accent azul: `#0070F3` (blue brand Vercel)
- Sucesso: `#50E3C2` / `#0DBC79`
- Erro: `#E00`
- Warning: `#F5A623`

**Tipografia (Geist Font System):**
- Fonte: **Geist Sans** (open source, Google Fonts) + **Geist Mono** para código
- Headings: 72 / 64 / 56 / 48 / 40 / 32 / 24 / 20 / 16 / 14px
- Buttons: 16 / 14 / 12px
- Labels (single line): 20 / 18 / 16 / 14 / 13 / 12px
- Copy (múltiplas linhas): 24 / 20 / 18 / 16 / 14 / 13px
- Label 14: **estilo mais comum** em menus e UI geral
- Copy 14: **mais comum** para texto em geral

**Componentes de destaque:**
- **Tabelas de deployments:** Zebra-striping sutil, cada linha tem status pill + URL + branch + tempo relativo
- **Status pills:** `height: 20px`, `font-size: 12px`, `border-radius: 999px`
- **Navegação:** Navbar clean, sem bordas, apenas linha inferior `border-bottom: 1px solid var(--border)`
- **Cards de projeto:** Hover levanta sombra sutil `box-shadow: 0 4px 16px rgba(0,0,0,0.12)`

**UX Patterns:**
- Grid responsivo: 1 col mobile → 2 col tablet → 3 col desktop
- Empty states consistentes com ícones + texto + CTA
- Loading states com shimmer placeholders
- Feedback inline (inline validation, não toasts para tudo)

---

### 1.4 Resend (resend.com)
**Estilo:** Ultra-clean, developer-centric, dark-default, forte em tipografia e espaçamento

**Paleta de cores:**
- Background principal: `#0A0A0A` (quase preto, levemente warm)
- Background cards: `#111111`
- Background hover: `#161616`
- Borda: `rgba(255,255,255,0.08)`
- Texto primário: `#FFFFFF`
- Texto secundário: `#888888`
- Accent brand: `#000000` + white (neutro puro) — sem accent colorido no UI principal
- Para CTAs: branco sobre preto
- Status verde: `#22C55E`
- Status vermelho: `#EF4444`
- Status amarelo: `#F59E0B`

**Tipografia:**
- Fonte: **Geist Sans** (igual Vercel — Resend foi fundada por ex-Vercel)
- Espaçamento generoso: `line-height: 1.6` no body
- `font-size: 14px` padrão
- Headers de página: 20–24px, weight 600
- Tabela headers: 12px, uppercase, `letter-spacing: 0.06em`, cor secundária
- Padding em cards: `20–32px` (mais generoso que concorrentes)

**Componentes de destaque:**
- **Tabela de emails:** Colunas para To, Subject, Status, Date — Status como pill colorido
- **Sidebar:** Muito minimalista, sem ícones na maioria dos links, apenas texto + indicador ativo
- **Code snippets:** Background `#0D0D0D`, borda `#1E1E1E`, monospace, syntax highlight sutil
- **Métricas dashboard:** Números grandes (32–40px, weight 700) com label pequeno abaixo

**UX Patterns:**
- **Menos é mais:** Nada de ícones desnecessários. Texto como UI.
- Padding interno generoso (respira mais que Linear/Supabase)
- Hierarquia por tamanho e peso, não por cor
- Feedback de status sempre via pill/badge, nunca texto solto

---

### 1.5 Shadcn/UI (ui.shadcn.com)
**Estilo:** Componentes modernos, altamente customizáveis, CSS Variables, base Zinc/Neutral

**Sistema de CSS Variables (base para customização):**

```css
/* Light */
--background: oklch(1 0 0);           /* #FFFFFF */
--foreground: oklch(0.145 0 0);       /* #171717 */
--card: oklch(1 0 0);                 /* #FFFFFF */
--primary: oklch(0.205 0 0);          /* #1A1A1A */
--secondary: oklch(0.97 0 0);         /* #F5F5F5 */
--muted: oklch(0.97 0 0);             /* #F5F5F5 */
--muted-foreground: oklch(0.556 0 0); /* #737373 */
--border: oklch(0.922 0 0);           /* #EBEBEB */
--radius: 0.625rem;                   /* 10px */

/* Dark */
--background: oklch(0.145 0 0);       /* #171717 */
--foreground: oklch(0.985 0 0);       /* #FAFAFA */
--card: oklch(0.205 0 0);             /* #222222 */
--popover: oklch(0.269 0 0);          /* #2C2C2C */
--muted: oklch(0.269 0 0);            /* #2C2C2C */
--muted-foreground: oklch(0.708 0 0); /* #A3A3A3 */
--border: oklch(1 0 0 / 10%);        /* rgba(255,255,255,0.10) */
--sidebar: oklch(0.205 0 0);          /* #222222 */
```

**Componentes de destaque:**
- **Card:** `border-radius: var(--radius)`, `border: 1px solid var(--border)`, `background: var(--card)`, `padding: 24px`
- **Badge:** `height: 22px`, `padding: 0 10px`, `border-radius: 999px`, variantes: default/secondary/destructive/outline
- **Table:** Header com `font-size: 12px`, uppercase, `font-weight: 500`, `color: var(--muted-foreground)`. Rows com `border-bottom: 1px solid var(--border)`
- **Sidebar component:** `width: 240–256px`, separação com `--sidebar-border`, item ativo com `--sidebar-primary`
- **Button:** Variantes primary/secondary/ghost/outline/destructive/link

**UX Patterns:**
- Mobile-first via Tailwind responsive prefixes: `sm:`, `md:`, `lg:`
- Sheet (drawer lateral) para mobile em vez de sidebar fixa
- Dialog/Drawer para formulários em mobile
- Tooltips e Popovers para metadados em hover

---

## 2. Design System SquadIA

### 2.1 Paleta de Cores

A paleta combina o profissionalismo dark do Linear com o accent vibrante do Supabase — adaptado para o contexto de IA/automação com tons de **violeta-azul** como cor primária (transmite tecnologia, inteligência, confiança).

#### Cores Primárias

| Token | Hex | Uso |
|-------|-----|-----|
| `--brand-primary` | `#6366F1` | CTA principal, links ativos, brand accent (indigo vibrante) |
| `--brand-primary-hover` | `#4F46E5` | Hover do botão primário |
| `--brand-primary-subtle` | `rgba(99,102,241,0.12)` | Background de item ativo na sidebar |
| `--brand-primary-border` | `rgba(99,102,241,0.30)` | Borda de elementos com brand accent |

#### Backgrounds (Dark Mode — Padrão)

| Token | Hex | Uso |
|-------|-----|-----|
| `--bg-base` | `#0A0A0A` | Background principal da app |
| `--bg-surface` | `#111111` | Cards, panels, sidebar |
| `--bg-elevated` | `#1A1A1A` | Dropdowns, modais, hover de card |
| `--bg-overlay` | `#222222` | Popovers, tooltips, menus |
| `--bg-muted` | `rgba(255,255,255,0.04)` | Background hover em rows de tabela |

#### Backgrounds (Light Mode)

| Token | Hex | Uso |
|-------|-----|-----|
| `--bg-base` | `#FAFAFA` | Background principal |
| `--bg-surface` | `#FFFFFF` | Cards, panels |
| `--bg-elevated` | `#F4F4F5` | Hover, backgrounds sutis |
| `--bg-overlay` | `#FFFFFF` | Modais com sombra |
| `--bg-muted` | `rgba(0,0,0,0.03)` | Hover em rows |

#### Tipografia

| Token | Hex Dark | Hex Light | Uso |
|-------|----------|-----------|-----|
| `--text-primary` | `#F4F4F5` | `#09090B` | Títulos, texto principal |
| `--text-secondary` | `#A1A1AA` | `#52525B` | Labels secundários, subtítulos |
| `--text-tertiary` | `#71717A` | `#A1A1AA` | Metadados, timestamps |
| `--text-disabled` | `#52525B` | `#D4D4D8` | Estados desabilitados |
| `--text-inverse` | `#09090B` | `#F4F4F5` | Texto sobre fundo primário |

#### Bordas

| Token | Valor | Uso |
|-------|-------|-----|
| `--border-default` | `rgba(255,255,255,0.08)` dark / `#E4E4E7` light | Bordas padrão de cards, inputs |
| `--border-subtle` | `rgba(255,255,255,0.05)` dark / `#F4F4F5` light | Separadores, linhas de tabela |
| `--border-strong` | `rgba(255,255,255,0.16)` dark / `#D4D4D8` light | Hover, focus states |

#### Status / Semânticas

| Token | Hex | Uso |
|-------|-----|-----|
| `--status-active` | `#22C55E` | Agente ativo/rodando |
| `--status-idle` | `#F59E0B` | Agente em espera/pausado |
| `--status-error` | `#EF4444` | Erro, falha |
| `--status-offline` | `#71717A` | Inativo, desconectado |
| `--status-processing` | `#6366F1` | Processando, aguardando resposta |
| `--success-subtle` | `rgba(34,197,94,0.12)` | Background de badge de sucesso |
| `--error-subtle` | `rgba(239,68,68,0.12)` | Background de badge de erro |
| `--warning-subtle` | `rgba(245,158,11,0.12)` | Background de badge de alerta |

---

### 2.2 Tipografia

**Fonte primária:** [**Geist Sans**](https://vercel.com/font) — open source, disponível no Google Fonts
- Escolha: mesma fonte do Vercel e Resend. Moderna, geométrica, limpa. Leitura excelente em telas.
- Alternativa equivalente: **Inter** (mais popular, igualmente adequada)

**Fonte monospace:** **Geist Mono** (para IDs de agentes, logs, código de integração)

#### Escala Tipográfica

| Estilo | Tamanho | Peso | Line Height | Uso |
|--------|---------|------|-------------|-----|
| `heading-xl` | 28px | 700 | 1.2 | Títulos de página principais |
| `heading-lg` | 22px | 600 | 1.3 | Subtítulos de seção |
| `heading-md` | 18px | 600 | 1.4 | Header de card, modal title |
| `heading-sm` | 15px | 600 | 1.4 | Header de painel lateral |
| `label-lg` | 14px | 500 | 1.5 | Mais comum no app — menus, labels |
| `label-md` | 13px | 500 | 1.5 | Metadados, badges, sidebar items |
| `label-sm` | 11px | 500 | 1.4 | Uppercase captions, table headers |
| `body-md` | 14px | 400 | 1.6 | Textos descritivos, empty states |
| `body-sm` | 13px | 400 | 1.6 | Descrições secundárias |
| `mono-md` | 13px | 400 | 1.5 | IDs, tokens, código |
| `mono-sm` | 12px | 400 | 1.4 | Timestamps, logs |

**Table headers:** 11px, `font-weight: 500`, `text-transform: uppercase`, `letter-spacing: 0.06em`, `color: var(--text-tertiary)`

---

### 2.3 Padrões de Componentes

#### Card de Agente

Inspiração: **estrutura densa do Linear** (issue row) + **visual de card do Supabase** (borda sutil, radius, hover com elevação).

```
┌─────────────────────────────────────────────────────┐
│  ● [Avatar/Ícone 32px]  Nome do Agente      [···]  │
│                          Função/Papel              │
│  ─────────────────────────────────────────────────  │
│  🟢 Ativo     Última execução: há 3 min            │
│  Modelo: GPT-4o  •  12 tarefas hoje               │
│                          [Editar] [Pausar]          │
└─────────────────────────────────────────────────────┘
```

**Especificações:**
- `background: var(--bg-surface)` → `var(--bg-elevated)` no hover
- `border: 1px solid var(--border-default)` → `var(--border-strong)` no hover
- `border-radius: 10px`
- `padding: 16px 20px`
- `transition: all 0.15s ease`
- Avatar/ícone: 32px, `border-radius: 8px`, background colorido por tipo de agente
- Status pill: `height: 20px`, `font-size: 11px`, `border-radius: 999px`, cor semântica
- Hover: leve `box-shadow: 0 4px 12px rgba(0,0,0,0.2)` (dark) / `0 4px 12px rgba(0,0,0,0.08)` (light)

#### Sidebar

Inspiração: **estrutura hierárquica do Linear** + **density do Supabase** + **variáveis do shadcn/ui**.

```
┌─────────────────────────┐
│ [Logo SquadIA]          │
│ ─────────────────────── │
│ 🏠 Dashboard            │
│ 🤖 Meus Agentes      3  │
│ 👥 Squads               │
│ 📊 Analytics            │
│ ─────────────────────── │
│ WORKSPACES              │
│   › Suporte ao Cliente  │
│   › Vendas              │
│   › Operações           │
│ ─────────────────────── │
│ ⚙️  Configurações       │
└─────────────────────────┘
```

**Especificações:**
- Largura: `240px` (desktop) / colapsável a `56px` em ícones / sheet overlay no mobile
- `background: var(--bg-surface)`
- `border-right: 1px solid var(--border-subtle)`
- Item de navegação: `height: 36px`, `padding: 0 12px`, `border-radius: 6px`, `gap: 10px`
- Item ativo: `background: var(--brand-primary-subtle)`, `color: var(--brand-primary)`, `font-weight: 500`
- Hover: `background: var(--bg-elevated)`
- Ícones: 16px, monocromáticos (Lucide Icons)
- Section label: 11px, uppercase, `letter-spacing: 0.08em`, `color: var(--text-tertiary)`, `padding: 8px 12px 4px`
- Badge de count: pill `18px height`, background `var(--bg-overlay)`, `font-size: 11px`

#### Badges de Status

Inspiração: **pills do Linear** (tamanho micro) + **semântica de cores do Vercel/Resend**.

| Status | Background | Border | Text | Dot |
|--------|-----------|--------|------|-----|
| Ativo | `rgba(34,197,94,0.12)` | `rgba(34,197,94,0.30)` | `#22C55E` | `#22C55E` |
| Processando | `rgba(99,102,241,0.12)` | `rgba(99,102,241,0.30)` | `#6366F1` | animado |
| Pausado | `rgba(245,158,11,0.12)` | `rgba(245,158,11,0.30)` | `#F59E0B` | `#F59E0B` |
| Erro | `rgba(239,68,68,0.12)` | `rgba(239,68,68,0.30)` | `#EF4444` | `#EF4444` |
| Offline | `rgba(113,113,122,0.12)` | `rgba(113,113,122,0.30)` | `#71717A` | `#71717A` |

**Especificações:**
- `height: 22px`, `padding: 0 8px`, `border-radius: 999px`
- `font-size: 11px`, `font-weight: 500`
- `border: 1px solid`
- Dot de status: círculo `6px`, inline antes do texto, `margin-right: 5px`
- "Processando": dot com animação `pulse` (`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`)

#### Tabela de Agentes/Squads

Inspiração: **tabelas do Vercel** (clean, bem espaçado) + **density do Linear**.

**Estrutura de colunas:**
```
[Agente]  [Status]  [Modelo]  [Squads]  [Tarefas hoje]  [Última atividade]  [···]
```

**Especificações:**
- `border-collapse: collapse`
- Header: `background: var(--bg-elevated)`, `height: 36px`, `font-size: 11px`, uppercase, `font-weight: 500`, `color: var(--text-tertiary)`
- Rows: `height: 52px`, `border-bottom: 1px solid var(--border-subtle)`
- Hover em row: `background: var(--bg-muted)`
- Primeira coluna: nome do agente em `font-weight: 500` + ícone 24px
- Coluna de ações: aparece apenas no hover (`opacity: 0` → `opacity: 1` on row hover)
- Paginação: `font-size: 13px`, botões Previous/Next com estilo ghost

#### Modais e Formulários

- `border-radius: 12px`
- `padding: 24px`
- `max-width: 480px` (formulários) / `560px` (confirmações)
- Overlay: `rgba(0,0,0,0.7)` dark / `rgba(0,0,0,0.4)` light
- Header do modal: título `18px 600` + X button no canto
- Footer: botões alinhados à direita, `gap: 8px`

#### Botões

| Variante | Background | Text | Border | Uso |
|---------|-----------|------|--------|-----|
| Primary | `#6366F1` | `#FFFFFF` | — | Ação principal |
| Secondary | `var(--bg-elevated)` | `var(--text-primary)` | `var(--border-default)` | Ação secundária |
| Ghost | transparent | `var(--text-secondary)` | — | Ações terciárias |
| Destructive | `rgba(239,68,68,0.12)` | `#EF4444` | `rgba(239,68,68,0.30)` | Deletar/desativar |

**Especificações:**
- Height: `36px` (default) / `32px` (sm) / `40px` (lg)
- Padding: `0 16px`
- `border-radius: 8px`
- `font-size: 14px`, `font-weight: 500`
- Hover: `filter: brightness(1.1)` nos coloridos; `background: var(--bg-elevated)` nos ghost

---

### 2.4 Diretrizes Mobile-First

#### Princípios Gerais

1. **Mobile é o ponto de partida**, não uma adaptação desktop
2. Toque mínimo: `44×44px` para qualquer elemento interativo
3. Padding horizontal: `16px` em mobile, `24px` em tablet, `32px` em desktop
4. Scroll vertical como padrão — evitar scroll horizontal

#### Adaptações por Tela

**Dashboard Principal:**
- Mobile: grid `1 coluna`, cards empilhados verticalmente, métricas em linha (2 por row)
- Tablet: grid `2 colunas`
- Desktop: grid `3 colunas` com sidebar visível

**Sidebar:**
- Mobile: **oculta por padrão** → abre como Sheet (drawer) deslizando da esquerda
- Botão hamburger `☰` no header móbile, `44×44px`
- Tablet (≥768px): sidebar colapsada (só ícones `56px`)
- Desktop (≥1280px): sidebar expandida (`240px`) sempre visível

**Cards de Agente:**
- Mobile: largura 100%, padding `16px`, informações reorganizadas em grid 2×2
- Status + modelo ficam abaixo do nome
- Botões de ação viram menu `···` que abre bottom sheet

**Tabelas:**
- Mobile: converte para **card list** — cada linha vira um card com os campos empilhados
- Alternativa: scroll horizontal com as primeiras colunas fixas (sticky)
- Coluna de ações: sempre visível no card mobile (não hidden on hover)

**Formulários de criação de agente:**
- Mobile: wizard por etapas (steps), não formulário longo em uma página
- Cada step tem 1–3 campos máximo
- Botões Next/Back fixos no rodapé (`position: sticky, bottom: 0`)

**Navegação:**
- Mobile: **Bottom Tab Bar** com 4–5 itens principais (Dashboard, Agentes, Squads, Alertas, Perfil)
- Ícone 24px + label `10px` abaixo
- Item ativo: `color: var(--brand-primary)`, dot ou underline

#### Breakpoints

```css
/* Mobile first */
/* xs: 0–479px — smartphones portrait */
@media (min-width: 480px)  { /* sm: smartphones landscape */ }
@media (min-width: 768px)  { /* md: tablets */ }
@media (min-width: 1024px) { /* lg: laptops */ }
@media (min-width: 1280px) { /* xl: desktops */ }
@media (min-width: 1536px) { /* 2xl: large screens */ }
```

---

### 2.5 Inspirações Específicas por Componente

| Componente SquadIA | Inspiração Principal | Detalhes |
|-------------------|---------------------|----------|
| **Card de Agente** | Linear (issue row) + Supabase (card visual) | Estrutura densa do Linear com os dois níveis de info; borda e radius sutil do Supabase; status pill pequeno como no Linear |
| **Sidebar de navegação** | Linear (hierarquia) + Shadcn (variáveis CSS) | 3 níveis hierárquicos como o Linear; sistema de variáveis `--sidebar-*` do shadcn para fácil customização |
| **Badges de status** | Linear (tamanho micro) + Vercel (semântica) | Pills de 22px de altura como no Linear; sistema de cores semânticas (verde/amarelo/vermelho/cinza) como no Vercel |
| **Tabelas** | Vercel (espaçamento) + Resend (tipografia de header) | Espaçamento generoso do Vercel; headers uppercase `11px letter-spacing` estilo Resend |
| **Botão primário** | Supabase → adaptado para indigo | Conceito de accent vibrante sobre fundo escuro do Supabase, mas com `#6366F1` no lugar do verde |
| **Empty states** | Vercel (layout) + Linear (copy) | Ícone centralizado 48px + título 16px + descrição 14px + CTA primário, como ambos fazem |
| **Modal de criação** | Shadcn (estrutura) + Resend (espaçamento) | Componente Dialog do shadcn com padding generoso estilo Resend (24–32px) |
| **Dashboard de métricas** | Resend (números grandes) + Vercel (grid) | Números em 32–40px peso 700 como no Resend; grid responsivo 1→2→3 colunas como no Vercel |
| **Bottom tabs mobile** | Padrão mobile iOS/Android | Item ativo com `var(--brand-primary)`, 4 tabs principais: Dashboard, Agentes, Squads, Config |
| **Modo claro/escuro** | Linear (toggle suave) + Vercel (escalas) | Toggle via `prefers-color-scheme` + botão manual; escala de cinzas precisa como no Vercel Geist |

---

### 2.6 Tokens CSS Completos (Implementação)

```css
/* globals.css */
:root {
  /* Brand */
  --brand-primary: #6366F1;
  --brand-primary-hover: #4F46E5;
  --brand-primary-subtle: rgba(99, 102, 241, 0.12);
  --brand-primary-border: rgba(99, 102, 241, 0.30);

  /* Typography */
  --font-sans: 'Geist', 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Geist Mono', 'Fira Code', monospace;

  /* Backgrounds - Light */
  --bg-base: #FAFAFA;
  --bg-surface: #FFFFFF;
  --bg-elevated: #F4F4F5;
  --bg-overlay: #FFFFFF;
  --bg-muted: rgba(0, 0, 0, 0.03);

  /* Text - Light */
  --text-primary: #09090B;
  --text-secondary: #52525B;
  --text-tertiary: #A1A1AA;
  --text-disabled: #D4D4D8;
  --text-inverse: #FAFAFA;

  /* Borders - Light */
  --border-subtle: #F4F4F5;
  --border-default: #E4E4E7;
  --border-strong: #D4D4D8;

  /* Status */
  --status-active: #22C55E;
  --status-active-subtle: rgba(34, 197, 94, 0.12);
  --status-active-border: rgba(34, 197, 94, 0.30);
  --status-idle: #F59E0B;
  --status-idle-subtle: rgba(245, 158, 11, 0.12);
  --status-idle-border: rgba(245, 158, 11, 0.30);
  --status-error: #EF4444;
  --status-error-subtle: rgba(239, 68, 68, 0.12);
  --status-error-border: rgba(239, 68, 68, 0.30);
  --status-offline: #71717A;
  --status-offline-subtle: rgba(113, 113, 122, 0.12);
  --status-offline-border: rgba(113, 113, 122, 0.30);
  --status-processing: #6366F1;

  /* Spacing */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.dark {
  /* Backgrounds - Dark */
  --bg-base: #0A0A0A;
  --bg-surface: #111111;
  --bg-elevated: #1A1A1A;
  --bg-overlay: #222222;
  --bg-muted: rgba(255, 255, 255, 0.04);

  /* Text - Dark */
  --text-primary: #F4F4F5;
  --text-secondary: #A1A1AA;
  --text-tertiary: #71717A;
  --text-disabled: #52525B;
  --text-inverse: #09090B;

  /* Borders - Dark */
  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-default: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);

  /* Shadows - Dark */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

---

## 3. Checklist de Implementação

- [ ] Configurar fontes: `next/font` com Geist Sans + Geist Mono
- [ ] Instalar shadcn/ui com base color `zinc` e CSS variables habilitado
- [ ] Criar `globals.css` com todos os tokens acima
- [ ] Implementar `ThemeProvider` com dark mode padrão + toggle
- [ ] Componentes prioritários para construir primeiro:
  - [ ] `AgentCard` — card de agente com status badge
  - [ ] `AppSidebar` — sidebar com shadcn `Sidebar` component
  - [ ] `StatusBadge` — badge de status com as 5 variantes
  - [ ] `AgentTable` — tabela com hover actions
  - [ ] `MobileNav` — bottom tab bar para mobile
- [ ] Testes de acessibilidade: contraste mínimo WCAG AA em ambos os modos

---

*Documento gerado em: 2026-03-16*
*Versão: 1.0*
*Pesquisa baseada em: Supabase Design System, Linear UI Redesign (2024), Vercel Geist Design System, Resend Dashboard, shadcn/ui theming docs*
