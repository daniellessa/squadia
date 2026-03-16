-- Habilitar extensões necessárias
create extension if not exists "uuid-ossp";

-- Tabela de empresas
create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  sector text not null,
  created_at timestamp with time zone default now()
);

-- Tabela de canais
create table if not exists channels (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  type text not null check (type in ('whatsapp', 'telegram', 'email', 'instagram')),
  name text not null,
  is_connected boolean default false,
  created_at timestamp with time zone default now()
);

-- Tabela de agentes
create table if not exists agents (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  name text not null,
  role text not null,
  personality text not null,
  status text not null default 'idle' check (status in ('idle', 'active', 'blocked', 'paused')),
  channel uuid references channels(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Tabela de tarefas
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  agent_id uuid references agents(id) on delete set null,
  title text not null,
  description text not null,
  status text not null default 'inbox' check (status in ('inbox', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamp with time zone default now()
);

-- Tabela de mensagens
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references agents(id) on delete cascade not null,
  direction text not null check (direction in ('in', 'out')),
  content text not null,
  created_at timestamp with time zone default now()
);

-- Tabela de feed de atividades
create table if not exists activity_feed (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  agent_id uuid references agents(id) on delete set null,
  agent_name text,
  type text not null,
  description text not null,
  created_at timestamp with time zone default now()
);

-- Tabela de documentos
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references agents(id) on delete cascade not null,
  name text not null,
  url text not null,
  created_at timestamp with time zone default now()
);

-- Estender a tabela de usuários do Auth
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Habilitar RLS (Row Level Security) em todas as tabelas
alter table companies enable row level security;
alter table channels enable row level security;
alter table agents enable row level security;
alter table tasks enable row level security;
alter table messages enable row level security;
alter table activity_feed enable row level security;
alter table documents enable row level security;
alter table user_profiles enable row level security;

-- Políticas RLS para companies
create policy "Usuários podem ver sua própria empresa"
  on companies for select
  using (id in (
    select company_id from user_profiles where id = auth.uid()
  ));

create policy "Usuários podem atualizar sua própria empresa"
  on companies for update
  using (id in (
    select company_id from user_profiles where id = auth.uid()
  ));

-- Políticas RLS para channels
create policy "Usuários podem ver canais de sua empresa"
  on channels for select
  using (company_id in (
    select company_id from user_profiles where id = auth.uid()
  ));

create policy "Usuários podem criar canais em sua empresa"
  on channels for insert
  with check (company_id in (
    select company_id from user_profiles where id = auth.uid()
  ));

create policy "Usuários podem atualizar canais de sua empresa"
  on channels for update
  using (company_id in (
    select company_id from user_profiles where id = auth.uid()
  ));

create policy "Usuários podem deletar canais de sua empresa"
  on channels for delete
  using (company_id in (
    select company_id from user_profiles where id = auth.uid()
  ));

-- Políticas RLS para agents
create policy "Usuários podem ver agentes de sua empresa"
  on agents for select
  using (company_id in (
    select company_id from user_profiles where id = auth.uid()
  ));

create policy "Usuários podem criar agentes em sua empresa"
  on agents for insert
  with check (company_id in (
    select company_id from user_profiles where id = auth.uid()
  ));

create policy "Usuários podem atualizar agentes de sua empresa"
  on agents for update
  using (company_id in (
    select company_id from user_profiles where id = auth.uid()
  ));

create policy "Usuários podem deletar agentes de sua empresa"
  on agents for delete
  using (company_id in (
    select company_id from user_profiles where id = auth.uid()
  ));

-- Políticas RLS para tasks
create policy "Usuários podem ver tarefas de sua empresa"
  on tasks for select
  using (company_id in (
    select company_id from user_profiles where id = auth.uid()
  ));

create policy "Usuários podem criar tarefas em sua empresa"
  on tasks for insert
  with check (company_id in (
    select company_id from user_profiles where id = auth.uid()
  ));

create policy "Usuários podem atualizar tarefas de sua empresa"
  on tasks for update
  using (company_id in (
    select company_id from user_profiles where id = auth.uid()
  ));

create policy "Usuários podem deletar tarefas de sua empresa"
  on tasks for delete
  using (company_id in (
    select company_id from user_profiles where id = auth.uid()
  ));

-- Políticas RLS para messages
create policy "Usuários podem ver mensagens de agentes de sua empresa"
  on messages for select
  using (agent_id in (
    select id from agents where company_id in (
      select company_id from user_profiles where id = auth.uid()
    )
  ));

create policy "Usuários podem criar mensagens para agentes de sua empresa"
  on messages for insert
  with check (agent_id in (
    select id from agents where company_id in (
      select company_id from user_profiles where id = auth.uid()
    )
  ));

-- Políticas RLS para activity_feed
create policy "Usuários podem ver atividades de sua empresa"
  on activity_feed for select
  using (company_id in (
    select company_id from user_profiles where id = auth.uid()
  ));

create policy "Usuários podem criar atividades em sua empresa"
  on activity_feed for insert
  with check (company_id in (
    select company_id from user_profiles where id = auth.uid()
  ));

-- Políticas RLS para documents
create policy "Usuários podem ver documentos de agentes de sua empresa"
  on documents for select
  using (agent_id in (
    select id from agents where company_id in (
      select company_id from user_profiles where id = auth.uid()
    )
  ));

create policy "Usuários podem criar documentos para agentes de sua empresa"
  on documents for insert
  with check (agent_id in (
    select id from agents where company_id in (
      select company_id from user_profiles where id = auth.uid()
    )
  ));

create policy "Usuários podem deletar documentos de agentes de sua empresa"
  on documents for delete
  using (agent_id in (
    select id from agents where company_id in (
      select company_id from user_profiles where id = auth.uid()
    )
  ));

-- Políticas RLS para user_profiles
create policy "Usuários podem ver seu próprio perfil"
  on user_profiles for select
  using (id = auth.uid());

create policy "Usuários podem criar seu próprio perfil"
  on user_profiles for insert
  with check (id = auth.uid());

create policy "Usuários podem atualizar seu próprio perfil"
  on user_profiles for update
  using (id = auth.uid());

-- Índices para melhorar performance
create index if not exists idx_channels_company on channels(company_id);
create index if not exists idx_agents_company on agents(company_id);
create index if not exists idx_tasks_company on tasks(company_id);
create index if not exists idx_tasks_agent on tasks(agent_id);
create index if not exists idx_messages_agent on messages(agent_id);
create index if not exists idx_activity_feed_company on activity_feed(company_id);
create index if not exists idx_documents_agent on documents(agent_id);
create index if not exists idx_user_profiles_company on user_profiles(company_id);

-- Função para criar perfil de usuário automaticamente após signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para criar perfil automaticamente
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
