-- Add OpenClaw session key column to agents table
-- This column stores the session key used to maintain separate OpenClaw sessions per agent
-- Format: agent:main:squadia-<agent_id>

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS openclaw_session_key TEXT;
