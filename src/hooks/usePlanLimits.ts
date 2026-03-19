import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useAgents } from '@/hooks/useAgents'
import { useOpenClaw, getAgentStatus } from '@/hooks/useOpenClaw'

const PLAN_LIMITS = {
  free:       { agents: 3,    tasks: 100 },
  pro:        { agents: null, tasks: null },
  enterprise: { agents: null, tasks: null },
} as const

export function usePlanLimits() {
  const { companyId } = useAuthStore()
  const { agents } = useAgents()
  const { isConnected } = useOpenClaw()

  const { data: company } = useQuery({
    queryKey: ['company-plan', companyId],
    queryFn: async () => {
      if (!companyId) return null
      const { data } = await supabase.from('companies').select('plan').eq('id', companyId).single()
      return data
    },
    enabled: !!companyId,
  })

  const { data: monthlyTasks = 0 } = useQuery({
    queryKey: ['billing-tasks', companyId],
    queryFn: async () => {
      if (!companyId) return 0
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gte('created_at', startOfMonth.toISOString())
      return count || 0
    },
    enabled: !!companyId,
  })

  const plan = (company?.plan || 'free') as keyof typeof PLAN_LIMITS
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free

  const activeAgents = agents.filter(a => getAgentStatus(a, isConnected) === 'active').length

  const agentLimitReached = limits.agents !== null && activeAgents >= limits.agents
  const taskLimitReached = limits.tasks !== null && monthlyTasks >= limits.tasks

  return {
    plan,
    limits,
    activeAgents,
    monthlyTasks,
    agentLimitReached,
    taskLimitReached,
  }
}
