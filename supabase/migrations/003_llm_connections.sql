CREATE TABLE IF NOT EXISTS llm_connections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google')),
  model text NOT NULL,
  api_key text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS llm_connection_id uuid REFERENCES llm_connections(id) ON DELETE SET NULL;
