import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Task } from '@/types'
import { useAuthStore } from '@/stores/authStore'

export function useTasks() {
  const queryClient = useQueryClient()
  const { companyId } = useAuthStore()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', companyId],
    queryFn: async () => {
      if (!companyId) return []

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Task[]
    },
    enabled: !!companyId,
  })

  const createTask = useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([task])
        .select()
        .single()

      if (error) throw error
      return data as Task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', companyId] })
    },
  })

  const updateTask = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Task>
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', companyId] })
    },
  })

  const moveTask = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: Task['status']
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', companyId] })
    },
  })

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', companyId] })
    },
  })

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
  }
}
