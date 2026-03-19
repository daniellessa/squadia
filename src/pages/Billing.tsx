import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useAgents } from '@/hooks/useAgents'
import { useOpenClaw, getAgentStatus } from '@/hooks/useOpenClaw'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Lock } from 'lucide-react'

const plans = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    description: 'Para começar e explorar',
    current: true,
    features: [
      '3 agentes ativos',
      '100 tasks/mês',
      'Chat com histórico',
      'Roteamento automático',
    ],
    missingFeatures: [
      'Criação automática de agentes por IA',
    ],
  },
  {
    name: 'Pro',
    price: 'R$ 149',
    period: '/mês',
    description: 'Para times em crescimento',
    current: false,
    features: [
      'Agentes ilimitados',
      'Tasks ilimitadas',
      'Memória persistente',
      'Roteamento automático',
      '✨ Criação automática de agentes por IA',
      'Integrações WhatsApp/Telegram',
      'Suporte prioritário',
    ],
    missingFeatures: [],
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    description: 'Para grandes operações',
    current: false,
    features: [
      'Tudo do Pro',
      '✨ Criação automática de agentes por IA',
      'VPS dedicado',
      'SLA garantido',
      'Onboarding dedicado',
      'Integrações customizadas',
    ],
    missingFeatures: [],
  },
]

const PLAN_LIMITS: Record<string, { agents: number | null; tasks: number | null }> = {
  free:       { agents: 3,    tasks: 100 },
  pro:        { agents: null, tasks: null },
  enterprise: { agents: null, tasks: null },
}

export function Billing() {
  const { companyId } = useAuthStore()
  const { agents } = useAgents()
  const { isConnected } = useOpenClaw()

  const activeAgents = agents.filter(a => getAgentStatus(a, isConnected) === 'active').length

  const { data: company } = useQuery({
    queryKey: ['company-plan', companyId],
    queryFn: async () => {
      if (!companyId) return null
      const { data } = await supabase.from('companies').select('name, plan').eq('id', companyId).single()
      return data
    },
    enabled: !!companyId,
  })

  const currentPlan = company?.plan || 'free'
  const currentPlanLabel = { free: 'Gratuito', pro: 'Pro', enterprise: 'Enterprise' }[currentPlan] || 'Gratuito'
  const limits = PLAN_LIMITS[currentPlan] ?? PLAN_LIMITS.free

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

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Faturamento</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Gerencie seu plano e assinatura
        </p>
      </div>

      {/* Plano atual */}
      <Card>
        <CardHeader>
          <CardTitle>Plano Atual</CardTitle>
          <CardDescription>Você está no plano {currentPlanLabel}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge>{currentPlanLabel}</Badge>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Renova automaticamente
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p style={{ color: 'var(--text-secondary)' }}>Agentes ativos</p>
              <p className="font-semibold">
                {activeAgents} / {limits.agents === null ? '∞' : limits.agents}
                {limits.agents !== null && activeAgents >= limits.agents && (
                  <span className="ml-2 text-xs text-red-400">Limite atingido</span>
                )}
              </p>
              <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: limits.agents === null ? '0%' : `${Math.min(100, (activeAgents / limits.agents) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)' }}>Tasks este mês</p>
              <p className="font-semibold">
                {monthlyTasks} / {limits.tasks === null ? '∞' : limits.tasks}
                {limits.tasks !== null && monthlyTasks >= limits.tasks && (
                  <span className="ml-2 text-xs text-red-400">Limite atingido</span>
                )}
              </p>
              <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: limits.tasks === null ? '0%' : `${Math.min(100, (monthlyTasks / limits.tasks) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planos */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Planos disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = plan.name.toLowerCase() === currentPlanLabel.toLowerCase()
            return (
            <div
              key={plan.name}
              className="rounded-lg border p-5 space-y-4 relative"
              style={{
                borderColor: isCurrent ? 'var(--brand-primary)' : 'var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              {isCurrent && (
                <span
                  className="absolute -top-3 left-4 text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}
                >
                  Atual
                </span>
              )}

              <div>
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{plan.price}</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{plan.period}</span>
              </div>

              <ul className="space-y-2">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
                {plan.missingFeatures?.map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-sm opacity-50">
                    <Lock className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                    <span style={{ color: 'var(--text-tertiary)' }}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={isCurrent ? 'outline' : 'default'}
                disabled={isCurrent}
                style={!isCurrent ? { backgroundColor: 'var(--brand-primary)', color: 'white' } : {}}
              >
                {isCurrent ? 'Plano atual' : plan.name === 'Enterprise' ? 'Falar com vendas' : (
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4" />
                    Fazer upgrade
                  </span>
                )}
              </Button>
            </div>
          )})}
        </div>
      </div>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>Suas faturas anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Nenhum pagamento ainda
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
