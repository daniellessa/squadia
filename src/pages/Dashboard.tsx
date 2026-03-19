import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useAgents } from '@/hooks/useAgents'
import { useTasks } from '@/hooks/useTasks'
import { useOpenClaw, getAgentStatus } from '@/hooks/useOpenClaw'
import { AgentModal } from '@/components/agents/AgentModal'
import { DocumentViewer } from '@/components/documents/DocumentViewer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import {
  Plus, Send, Zap, CheckCircle2, Clock, TrendingUp,
  Users, AlertCircle, Loader2, FileText
} from 'lucide-react'

function startOfDay() {
  const d = new Date(); d.setHours(0,0,0,0); return d.toISOString()
}
function startOfWeek() {
  const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0,0,0,0); return d.toISOString()
}

function TaskDocButton({ taskTitle }: { taskTitle: string }) {
  const [viewingDoc, setViewingDoc] = useState<{ name: string; url: string } | null>(null)

  const { data: document, isLoading } = useQuery({
    queryKey: ['task-document', taskTitle],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('id, name, url')
        .eq('name', taskTitle)
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
  })

  if (isLoading) {
    return <Loader2 className="h-3 w-3 animate-spin" style={{ color: 'var(--text-tertiary)' }} />
  }

  if (!document) {
    return null
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setViewingDoc({ name: document.name, url: document.url })}
        className="text-xs h-6 px-2"
      >
        <FileText className="h-3 w-3 mr-1" />
        Ver resultado
      </Button>
      {viewingDoc && (
        <DocumentViewer
          open={!!viewingDoc}
          onOpenChange={(open) => !open && setViewingDoc(null)}
          name={viewingDoc.name}
          url={viewingDoc.url}
        />
      )}
    </>
  )
}

export function Dashboard() {
  const { companyId } = useAuthStore()
  const { agents } = useAgents()
  const { tasks } = useTasks('today')
  const { isConnected } = useOpenClaw()
  const navigate = useNavigate()
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false)
  const [quickInput, setQuickInput] = useState('')

  // Métricas da semana
  const { data: weekMetrics } = useQuery({
    queryKey: ['week-metrics', companyId],
    queryFn: async () => {
      if (!companyId) return null
      const since = startOfWeek()
      const { data } = await supabase
        .from('tasks')
        .select('status, created_at, updated_at')
        .eq('company_id', companyId)
        .in('status', ['done', 'rejected'])
        .gte('updated_at', since)
      if (!data) return null
      const done = data.filter(t => t.status === 'done')
      const rejected = data.filter(t => t.status === 'rejected')
      const total = done.length + rejected.length
      const avgMs = done.length
        ? done.reduce((acc, t) => acc + (new Date(t.updated_at).getTime() - new Date(t.created_at).getTime()), 0) / done.length
        : 0
      return {
        done: done.length,
        rejected: rejected.length,
        approvalRate: total > 0 ? Math.round((done.length / total) * 100) : 100,
        avgMinutes: Math.round(avgMs / 60000),
      }
    },
    enabled: !!companyId,
    refetchInterval: 30000,
  })

  // Tasks ativas
  const activeTasks = tasks.filter(t => ['in_progress', 'assigned'].includes(t.status))
  const waitingTasks = tasks.filter(t => t.status === 'waiting')
  const queuedTasks = tasks.filter(t => ['pending'].includes(t.status))
  const doneTodayTasks = tasks.filter(t => t.status === 'done')
  const activeAgents = agents.filter(a => getAgentStatus(a, isConnected) === 'active')

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickInput.trim()) return
    navigate('/chat', { state: { prefill: quickInput } })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Visão geral do seu time de agentes
          </p>
        </div>
        <Button onClick={() => setIsAgentModalOpen(true)} style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agente
        </Button>
      </div>

      {/* Métricas da semana */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Agentes ativos</p>
                <p className="text-2xl font-bold mt-1">{activeAgents.length}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>de {agents.length} total</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22c55e22' }}>
                <Users className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Concluídas (7 dias)</p>
                <p className="text-2xl font-bold mt-1">{weekMetrics?.done ?? '—'}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{weekMetrics?.rejected ?? 0} rejeitadas</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6366f122' }}>
                <CheckCircle2 className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Tempo médio</p>
                <p className="text-2xl font-bold mt-1">
                  {weekMetrics ? (weekMetrics.avgMinutes >= 60
                    ? `${Math.round(weekMetrics.avgMinutes / 60)}h`
                    : `${weekMetrics.avgMinutes}m`) : '—'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>por task</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b22' }}>
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Taxa de aprovação</p>
                <p className="text-2xl font-bold mt-1">{weekMetrics?.approvalRate ?? '—'}{weekMetrics ? '%' : ''}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>revisões aprovadas</p>
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#a855f722' }}>
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pulse + Entregues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pulse */}
        <div className="space-y-4">

          {/* Aguardando você */}
          {waitingTasks.length > 0 && (
            <Card style={{ borderColor: '#f97316', border: '1px solid' }}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-500">Aguardando você ({waitingTasks.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {waitingTasks.map(task => {
                  const agent = agents.find(a => a.id === task.assigned_to)
                  return (
                    <div key={task.id} className="flex items-start gap-2 rounded p-2" style={{ backgroundColor: '#f9741622' }}>
                      {agent && <Avatar name={agent.name} size="sm" color={agent.avatar_color} imageUrl={agent.avatar_url} className="h-6 w-6 text-[10px] flex-shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs truncate" style={{ color: '#f97316' }}>{task.clarification_question}</p>
                      </div>
                      <Button size="sm" onClick={() => navigate('/chat')} style={{ backgroundColor: '#f97316', color: 'white', height: '24px', fontSize: '11px' }}>
                        Responder
                      </Button>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Em andamento */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-amber-500" />
                Em andamento
                {activeTasks.length > 0 && <Badge variant="secondary">{activeTasks.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeTasks.length === 0 && queuedTasks.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-tertiary)' }}>Nenhuma task ativa no momento</p>
              ) : (
                <div className="space-y-2">
                  {activeTasks.map(task => {
                    const agent = agents.find(a => a.id === task.assigned_to)
                    return (
                      <div key={task.id} className="flex items-center gap-2 rounded p-2" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                        {agent && <Avatar name={agent.name} size="sm" color={agent.avatar_color} imageUrl={agent.avatar_url} className="h-6 w-6 text-[10px] flex-shrink-0" />}
                        <p className="text-sm flex-1 truncate">{task.title}</p>
                        <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>{formatRelativeTime(task.updated_at || task.created_at)}</span>
                      </div>
                    )
                  })}
                  {queuedTasks.length > 0 && (
                    <p className="text-xs pt-1" style={{ color: 'var(--text-tertiary)' }}>
                      + {queuedTasks.length} na fila
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Entregues hoje */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Entregues hoje
              {doneTodayTasks.length > 0 && <Badge variant="secondary">{doneTodayTasks.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {doneTodayTasks.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-tertiary)' }}>Nenhuma entrega ainda hoje</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {doneTodayTasks.map(task => {
                  const executor = agents.find(a => a.id === task.executed_by)
                  const reviewer = agents.find(a => a.id === task.assigned_to)
                  const duration = task.updated_at && task.created_at
                    ? Math.round((new Date(task.updated_at).getTime() - new Date(task.created_at).getTime()) / 60000)
                    : null
                  return (
                    <div key={task.id} className="rounded p-2 space-y-1.5" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium truncate flex-1">{task.title}</p>
                        <TaskDocButton taskTitle={task.title} />
                      </div>
                      <div className="flex items-center gap-3">
                        {executor && (
                          <div className="flex items-center gap-1" title={`Executado por ${executor.name}`}>
                            <Avatar name={executor.name} size="sm" color={executor.avatar_color} imageUrl={executor.avatar_url} className="h-4 w-4 text-[10px]" />
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{executor.name}</span>
                          </div>
                        )}
                        {reviewer && reviewer.id !== executor?.id && (
                          <>
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>→</span>
                            <div className="flex items-center gap-1" title={`Revisado por ${reviewer.name}`}>
                              <Avatar name={reviewer.name} size="sm" color={reviewer.avatar_color} imageUrl={reviewer.avatar_url} className="h-4 w-4 text-[10px]" />
                              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{reviewer.name}</span>
                            </div>
                          </>
                        )}
                        {duration !== null && (
                          <span className="text-xs ml-auto" style={{ color: 'var(--text-tertiary)' }}>
                            {duration >= 60 ? `${Math.round(duration/60)}h` : `${duration}m`}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Input rápido */}
      <Card>
        <CardContent className="pt-5">
          <form onSubmit={handleQuickSubmit} className="flex gap-3 items-center">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--brand-primary-subtle)' }}>
              <Zap className="h-4 w-4" style={{ color: 'var(--brand-primary)' }} />
            </div>
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="O que você precisa hoje? Envie para o Chat..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
            <Button type="submit" disabled={!quickInput.trim()} size="sm" style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <AgentModal open={isAgentModalOpen} onOpenChange={setIsAgentModalOpen} />
    </div>
  )
}
