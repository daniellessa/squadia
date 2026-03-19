import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Task } from '@/types'
import { useAuthStore } from '@/stores/authStore'

export type TimeFilter = 'today' | 'week' | 'month' | '6months'

function getTimeFilterDate(filter: TimeFilter): string {
  const d = new Date()
  if (filter === 'today') {
    d.setHours(0, 0, 0, 0)
  } else if (filter === 'week') {
    const day = d.getDay()
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
  } else if (filter === 'month') {
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
  } else if (filter === '6months') {
    d.setMonth(d.getMonth() - 6)
    d.setHours(0, 0, 0, 0)
  }
  return d.toISOString()
}

export function useTasks(timeFilter: TimeFilter = 'today') {
  const queryClient = useQueryClient()
  const { companyId } = useAuthStore()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', companyId, timeFilter],
    queryFn: async () => {
      if (!companyId) return []

      const since = getTimeFilterDate(timeFilter)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .gte('created_at', since)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data as Task[]
    },
    enabled: !!companyId,
  })

  // Polling leve a cada 5s para manter o Kanban atualizado
  useEffect(() => {
    if (!companyId) return
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['tasks', companyId], exact: false })
    }, 5000)
    return () => clearInterval(interval)
  }, [companyId, queryClient])

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
      queryClient.invalidateQueries({ queryKey: ['tasks', companyId], exact: false })
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
      queryClient.invalidateQueries({ queryKey: ['tasks', companyId], exact: false })
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
      queryClient.invalidateQueries({ queryKey: ['tasks', companyId], exact: false })
    },
  })

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', companyId], exact: false })
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
