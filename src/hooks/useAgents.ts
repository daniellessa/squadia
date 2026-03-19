import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Agent } from '@/types'
import { useAuthStore } from '@/stores/authStore'

export function useAgents() {
  const queryClient = useQueryClient()
  const { companyId } = useAuthStore()

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents', companyId],
    queryFn: async () => {
      if (!companyId) return []

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Agent[]
    },
    enabled: !!companyId,
  })

  // Polling leve a cada 10s para novos agentes criados pelo analista
  useEffect(() => {
    if (!companyId) return
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['agents', companyId] })
    }, 10000)
    return () => clearInterval(interval)
  }, [companyId, queryClient])

  const createAgent = useMutation({
    mutationFn: async (agent: Omit<Agent, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('agents')
        .insert([agent])
        .select()
        .single()

      if (error) throw error

      const newAgent = data as Agent

      // Generate and save the OpenClaw session key
      const sessionKey = `agent:main:squadia-${newAgent.id}`
      const { error: updateError } = await supabase
        .from('agents')
        .update({ openclaw_session_key: sessionKey })
        .eq('id', newAgent.id)

      if (updateError) {
        console.warn('Failed to update openclaw_session_key:', updateError)
      }

      return { ...newAgent, openclaw_session_key: sessionKey }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', companyId] })
    },
  })

  const updateAgent = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Agent>
    }) => {
      const { data, error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Agent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', companyId] })
    },
  })

  const deleteAgent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('agents').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', companyId] })
    },
  })

  return {
    agents,
    isLoading,
    createAgent,
    updateAgent,
    deleteAgent,
  }
}
