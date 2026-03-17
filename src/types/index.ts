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
  system_prompt: string | null
  created_at: string
}

export interface Task {
  id: string
  company_id: string
  agent_id: string | null
  title: string
  description: string
  status: "inbox" | "in_progress" | "done"
  priority: "low" | "medium" | "high"
  created_at: string
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
