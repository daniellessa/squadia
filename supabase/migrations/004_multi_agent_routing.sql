-- Migration 004: Multi-agent task routing

-- Adicionar especialidades e flag sênior nos agentes
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS specialties text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_senior boolean DEFAULT false;

-- Atualizar status possíveis das tasks para o novo fluxo
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_status_check;

ALTER TABLE tasks
ADD CONSTRAINT tasks_status_check
CHECK (status IN ('inbox', 'pending', 'assigned', 'in_progress', 'review', 'done', 'rejected'));

-- Adicionar tags e agente responsável nas tasks
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES agents(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS review_feedback text,
ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual' CHECK (source IN ('manual', 'whatsapp', 'telegram', 'web')),
ADD COLUMN IF NOT EXISTS source_session_key text;

-- Índice para buscar tasks por status rapidamente
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
