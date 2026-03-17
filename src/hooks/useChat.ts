import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Message, Agent } from '@/types'
import { useAuthStore } from '@/stores/authStore'

interface ChatMessage extends Message {
  isStreaming?: boolean
}

async function callOpenAI(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>
) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Erro ao chamar OpenAI')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callAnthropic(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt?: string
) {
  const anthropicMessages = messages.filter((m) => m.role !== 'system')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt || undefined,
      messages: anthropicMessages,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Erro ao chamar Anthropic')
  }

  const data = await response.json()
  return data.content[0].text
}

async function callGoogle(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt?: string
) {
  const googleMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  if (systemPrompt) {
    googleMessages.unshift({
      role: 'user',
      parts: [{ text: systemPrompt }],
    })
    googleMessages.splice(1, 0, {
      role: 'model',
      parts: [{ text: 'Entendido. Vou seguir essas instruções.' }],
    })
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: googleMessages,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Erro ao chamar Google')
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

export function useChat(agentId: string) {
  const queryClient = useQueryClient()
  const { companyId } = useAuthStore()
  const [isTyping, setIsTyping] = useState(false)

  const { data: agent } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single()

      if (error) throw error
      return data as Agent
    },
  })

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as ChatMessage[]
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${agentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `agent_id=eq.${agentId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', agentId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [agentId, queryClient])

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!agent) throw new Error('Agente não encontrado')

      const { error: userError } = await supabase
        .from('messages')
        .insert([
          {
            agent_id: agentId,
            direction: 'in',
            content,
          },
        ])
        .select()
        .single()

      if (userError) throw userError

      setIsTyping(true)

      try {
        if (!agent.llm_provider || !agent.llm_model || !agent.llm_api_key) {
          throw new Error('Agente não configurado com LLM')
        }

        const recentMessages = messages.slice(-20)
        const conversationHistory = recentMessages.map((msg) => ({
          role: msg.direction === 'in' ? 'user' : 'assistant',
          content: msg.content,
        }))

        if (agent.system_prompt) {
          conversationHistory.unshift({
            role: 'system',
            content: agent.system_prompt,
          })
        }

        conversationHistory.push({
          role: 'user',
          content,
        })

        let assistantResponse: string

        if (agent.llm_provider === 'openai') {
          assistantResponse = await callOpenAI(
            agent.llm_api_key,
            agent.llm_model,
            conversationHistory
          )
        } else if (agent.llm_provider === 'anthropic') {
          assistantResponse = await callAnthropic(
            agent.llm_api_key,
            agent.llm_model,
            conversationHistory,
            agent.system_prompt || undefined
          )
        } else if (agent.llm_provider === 'google') {
          assistantResponse = await callGoogle(
            agent.llm_api_key,
            agent.llm_model,
            conversationHistory,
            agent.system_prompt || undefined
          )
        } else {
          throw new Error('Provider não suportado')
        }

        const { data: agentMessage, error: agentError } = await supabase
          .from('messages')
          .insert([
            {
              agent_id: agentId,
              direction: 'out',
              content: assistantResponse,
            },
          ])
          .select()
          .single()

        if (agentError) throw agentError

        if (companyId) {
          await supabase.from('activity_feed').insert([
            {
              company_id: companyId,
              agent_id: agentId,
              agent_name: agent.name,
              type: 'message',
              description: `Conversa com ${agent.name}`,
            },
          ])
        }

        return agentMessage
      } finally {
        setIsTyping(false)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', agentId] })
    },
  })

  return {
    agent,
    messages,
    isLoading,
    isTyping,
    sendMessage: sendMessage.mutateAsync,
    isSending: sendMessage.isPending,
  }
}
