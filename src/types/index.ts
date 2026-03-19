export type AgentStatus = "idle" | "active" | "blocked" | "paused"

export interface Company {
  id: string
  name: string
  sector: string
  created_at: string
}

export interface Agent {
  id: string
  company_id: string
  name: string
  role: string
  personality: string
  status: AgentStatus
  channel: string | null
  llm_provider: "openai" | "anthropic" | "google" | null
  llm_model: string | null
  llm_api_key: string | null
  llm_connection_id?: string | null
  system_prompt: string | null
  openclaw_session_key?: string
  specialties?: string[]
  is_senior?: boolean
  is_temp?: boolean
  created_by_agent_id?: string | null
  avatar_color?: string | null
  avatar_url?: string | null
  created_at: string
}

export interface Task {
  id: string
  company_id: string
  agent_id: string | null
  assigned_to: string | null
  executed_by?: string | null
  title: string
  description: string
  status: "inbox" | "pending" | "assigned" | "in_progress" | "waiting" | "review" | "done" | "rejected"
  clarification_question?: string | null
  clarification_answer?: string | null
  priority: "low" | "medium" | "high"
  tags: string[]
  source: "manual" | "whatsapp" | "telegram" | "web"
  review_feedback: string | null
  created_at: string
  updated_at?: string
}

export interface Message {
  id: string
  agent_id: string
  direction: "in" | "out"
  content: string
  created_at: string
}

export interface ActivityEvent {
  id: string
  company_id: string
  agent_id: string | null
  agent_name: string | null
  type: string
  description: string
  created_at: string
}

export interface Document {
  id: string
  agent_id: string
  name: string
  url: string
  created_at: string
}

export interface Channel {
  id: string
  company_id: string
  type: "whatsapp" | "telegram" | "email" | "instagram"
  name: string
  is_connected: boolean
  created_at: string
}

export interface User {
  id: string
  email: string
  company_id: string | null
}

export interface LlmConnection {
  id: string
  company_id: string
  name: string
  provider: "openai" | "anthropic" | "google"
  model: string
  api_key: string
  created_at: string
}
