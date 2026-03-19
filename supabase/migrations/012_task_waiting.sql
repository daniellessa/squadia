-- Adicionar status "waiting" nas tasks
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks
ADD CONSTRAINT tasks_status_check
CHECK (status IN ('inbox', 'pending', 'assigned', 'in_progress', 'waiting', 'review', 'done', 'rejected'));

-- Salvar a pergunta do agente e a resposta do usuário
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS clarification_question text,
ADD COLUMN IF NOT EXISTS clarification_answer text;
