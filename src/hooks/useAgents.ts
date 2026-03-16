import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

  const createAgent = useMutation({
    mutationFn: async (agent: Omit<Agent, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('agents')
        .insert([agent])
        .select()
        .single()

      if (error) throw error
      return data as Agent
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
