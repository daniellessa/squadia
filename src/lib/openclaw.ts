/**
 * OpenClaw Gateway HTTP Client
 * Handles communication with the local OpenClaw gateway for agent execution
 */

export interface Session {
  key: string
  agent_id?: string
  created_at?: string
  metadata?: Record<string, unknown>
}

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatCompletionMessage[]
  session_key?: string
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
}

export interface ToolInvokeRequest {
  tool: string
  args?: Record<string, unknown>
  session_key?: string
}

export class OpenClawClient {
  private baseUrl: string
  private token: string

  constructor(baseUrl?: string, token?: string) {
    // Use Vite proxy path to avoid CORS in dev; in prod apontar para URL real
    this.baseUrl = baseUrl || import.meta.env.VITE_OPENCLAW_GATEWAY_HTTP_URL || '/openclaw'
    this.token = token || import.meta.env.VITE_OPENCLAW_GATEWAY_TOKEN || ''
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
    }
  }

  /**
   * Check if the OpenClaw gateway is healthy and reachable
   */
  async health(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
      })
      return response.ok
    } catch (error) {
      console.error('OpenClaw health check failed:', error)
      return false
    }
  }

  /**
   * List active sessions
   */
  async listSessions(): Promise<Session[]> {
    try {
      const response = await this.invokeTool('sessions_list')
      if (Array.isArray(response?.sessions)) {
        return response.sessions
      }
      return []
    } catch (error) {
      console.error('Failed to list sessions:', error)
      return []
    }
  }

  /**
   * Send a message to an agent and get a response
   * @param agentId The ID of the agent to send the message to
   * @param message The message content
   * @param history Optional conversation history
   * @param sessionKey Optional session key to maintain conversation context (e.g., "agent:main:squadia-<uuid>")
   * @returns The agent's response text
   */
  async sendMessage(
    agentId: string,
    message: string,
    history?: ChatCompletionMessage[],
    sessionKey?: string
  ): Promise<string> {
    try {
      const messages: ChatCompletionMessage[] = history
        ? history
        : [{ role: 'user', content: message }]

      const request: ChatCompletionRequest = {
        model: `openclaw:${agentId}`,
        messages,
      }

      const headers = this.getHeaders()
      if (sessionKey) {
        headers['x-openclaw-session-key'] = sessionKey
      }

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `OpenClaw chat request failed: ${response.status} ${response.statusText} - ${errorText}`
        )
      }

      const data: ChatCompletionResponse = await response.json()

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenClaw agent')
      }

      return data.choices[0].message.content
    } catch (error) {
      console.error('Failed to send message to OpenClaw:', error)
      throw error
    }
  }

  /**
   * Invoke a tool on the OpenClaw gateway
   * @param tool The tool name (e.g., "sessions_list", "sessions_spawn")
   * @param args Optional tool arguments
   * @param sessionKey Optional session key
   * @returns The tool response
   */
  async invokeTool(
    tool: string,
    args?: Record<string, unknown>,
    sessionKey?: string
  ): Promise<any> {
    try {
      const request: ToolInvokeRequest = {
        tool,
        args: args || {},
      }

      if (sessionKey) {
        request.session_key = sessionKey
      }

      const response = await fetch(`${this.baseUrl}/tools/invoke`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `OpenClaw tool invocation failed: ${response.status} ${response.statusText} - ${errorText}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to invoke OpenClaw tool:', error)
      throw error
    }
  }
}

// Export a singleton instance
export const openClawClient = new OpenClawClient()
