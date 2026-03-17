-- Adicionar campos de LLM na tabela agents
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS llm_provider TEXT CHECK (llm_provider IN ('openai', 'anthropic', 'google')),
ADD COLUMN IF NOT EXISTS llm_model TEXT,
ADD COLUMN IF NOT EXISTS llm_api_key TEXT,
ADD COLUMN IF NOT EXISTS system_prompt TEXT;
