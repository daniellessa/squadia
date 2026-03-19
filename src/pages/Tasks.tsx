import { useState, useEffect } from 'react'
import { useTasks, type TimeFilter } from '@/hooks/useTasks'
import { useAgents } from '@/hooks/useAgents'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { TaskModal } from '@/components/tasks/TaskModal'
import { AgentEditModal } from '@/components/agents/AgentEditModal'
import { AgentModal } from '@/components/agents/AgentModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Plus, Loader2, Crown, Pencil, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { useOpenClaw, getAgentStatus } from '@/hooks/useOpenClaw'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import { formatRelativeTime } from '@/lib/utils'
import type { Agent } from '@/types'

export function Tasks() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today')
  const { tasks, isLoading } = useTasks(timeFilter)
  const { agents } = useAgents()
  const { isConnected } = useOpenClaw()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [expandedAgentTags, setExpandedAgentTags] = useState<Record<string, boolean>>({})
  const [analystCooldown, setAnalystCooldown] = useState(0)
  const [analystLoading, setAnalystLoading] = useState(false)
  const { plan } = usePlanLimits()
  const canTriggerAnalyst = plan === 'pro' || plan === 'enterprise'

  const triggerAnalyst = async () => {
    setAnalystLoading(true)
    try {
      const res = await fetch('/orchestrator/trigger-analyst', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setAnalystCooldown(Math.ceil((data.cooldownMs || 60000) / 1000))
      } else {
        setAnalystCooldown(60)
      }
    } catch {
      console.error('Failed to trigger analyst')
    } finally {
      setAnalystLoading(false)
    }
  }

  // Countdown do cooldown
  useEffect(() => {
    if (analystCooldown <= 0) return
    const t = setTimeout(() => setAnalystCooldown(prev => Math.max(0, prev - 1)), 1000)
    return () => clearTimeout(t)
  }, [analystCooldown])

  const activeAgentsCount = agents.filter(a => getAgentStatus(a, isConnected) === 'active').length
  const queuedTasksCount = tasks.filter(t => ['pending', 'assigned'].includes(t.status)).length
  const activeTasksCount = tasks.filter(t => ['in_progress', 'waiting', 'review'].includes(t.status)).length

  const filteredTasks = selectedAgentId
    ? tasks.filter(t => t.assigned_to === selectedAgentId || t.executed_by === selectedAgentId)
    : tasks

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <strong className="text-white">{activeAgentsCount}</strong> agente{activeAgentsCount !== 1 ? 's' : ''} ativo{activeAgentsCount !== 1 ? 's' : ''}
            </span>
            <span style={{ color: 'var(--border-default)' }}>·</span>
            <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              <strong className="text-white">{queuedTasksCount}</strong> na fila
            </span>
            <span style={{ color: 'var(--border-default)' }}>·</span>
            <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <strong className="text-white">{activeTasksCount}</strong> em andamento
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {canTriggerAnalyst && (
            <div className="group relative">
              <Button
                variant="outline"
                onClick={triggerAnalyst}
                disabled={analystLoading || analystCooldown > 0}
              >
                {analystLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {analystCooldown > 0 ? `Aguarde ${analystCooldown}s` : 'Analisar time'}
              </Button>
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block z-20 pointer-events-none w-64">
                <div
                  className="rounded-lg p-3 text-xs shadow-lg space-y-1.5"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>✨ Analista de IA</p>
                  <p>Analisa o padrão de demanda das tasks e identifica se o time precisa de novos agentes especializados.</p>
                  <p>Se detectar um gap de conhecimento não coberto pelo time atual, cria um novo agente automaticamente.</p>
                  {analystCooldown > 0 && (
                    <p className="text-yellow-400">Disponível em {analystCooldown}s</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <Button variant="outline" onClick={() => setIsAgentModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Agente
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Filtro temporal */}
      <div className="flex items-center gap-2">
        {([
          { value: 'today',   label: 'Hoje' },
          { value: 'week',    label: 'Esta semana' },
          { value: 'month',   label: 'Este mês' },
          { value: '6months', label: 'Últimos 6 meses' },
        ] as { value: TimeFilter; label: string }[]).map(opt => (
          <button
            key={opt.value}
            onClick={() => setTimeFilter(opt.value)}
            className="text-sm px-3 py-1 rounded-full border transition-colors"
            style={{
              borderColor: timeFilter === opt.value ? 'var(--brand-primary)' : 'var(--border-default)',
              backgroundColor: timeFilter === opt.value ? 'var(--brand-primary-subtle)' : 'transparent',
              color: timeFilter === opt.value ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: timeFilter === opt.value ? 600 : 400,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex gap-4 h-full">
        {/* Painel de agentes */}
        <div
          className="w-52 flex-shrink-0 rounded-lg border p-3 space-y-3 self-start"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-default)',
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
            Agentes
          </p>

          {[...agents]
            .sort((a, b) => {
              const sa = getAgentStatus(a, isConnected) === 'active' ? 0 : 1
              const sb = getAgentStatus(b, isConnected) === 'active' ? 0 : 1
              return sa - sb
            })
            .map((agent) => {
              const status = getAgentStatus(agent, isConnected)
              const isActive = status === 'active'
              const isWorking = tasks.some(
                t => t.assigned_to === agent.id && t.status === 'in_progress'
              )
              const isReviewing = tasks.some(
                t => t.assigned_to === agent.id && t.status === 'review'
              )

              let borderColor = ''
              if (!isActive) {
                borderColor = 'var(--border-default)'
              } else if (isWorking) {
                borderColor = '#f59e0b'
              } else if (isReviewing) {
                borderColor = '#a855f7'
              } else {
                borderColor = '#22c55e'
              }

              return (
                <div
                  key={agent.id}
                  className="group rounded-md p-2 space-y-1.5 border-l-2 cursor-pointer transition-all"
                  onClick={() => setSelectedAgentId(prev => prev === agent.id ? null : agent.id)}
                  style={{
                    backgroundColor: selectedAgentId === agent.id ? 'var(--brand-primary-subtle)' : 'var(--bg-elevated)',
                    opacity: isActive ? 1 : 0.5,
                    borderLeftColor: selectedAgentId === agent.id ? 'var(--brand-primary)' : borderColor,
                    outline: selectedAgentId === agent.id ? '1px solid var(--brand-primary)' : 'none',
                  }}
                >
                  {/* Avatar + nome */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-shrink-0">
                      <Avatar name={agent.name} size="sm" color={agent.avatar_color} imageUrl={agent.avatar_url} />
                      <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--bg-elevated)] ${isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                    </div>
                    <span className="text-sm font-medium truncate flex-1">{agent.name}</span>
                    {agent.is_senior && <Crown className="h-3 w-3 flex-shrink-0 text-yellow-500" />}
                    {agent.is_temp && (
                      <span className="text-xs px-1 rounded" style={{ backgroundColor: '#7c3aed22', color: '#a78bfa', fontSize: '10px' }}>
                        temp
                      </span>
                    )}
                    <button
                      onClick={() => setEditingAgent(agent)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-70"
                      title="Editar agente"
                    >
                      <Pencil className="h-3 w-3" style={{ color: 'var(--text-tertiary)' }} />
                    </button>
                  </div>

                  {/* Cargo */}
                  <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                    {agent.role}
                  </p>

                  {/* Task atual do agente */}
                  {(() => {
                    const activeTask = tasks.find(t =>
                      (t.assigned_to === agent.id || t.executed_by === agent.id) &&
                      ['assigned', 'in_progress', 'waiting', 'review'].includes(t.status)
                    )
                    if (!activeTask) return null

                    const statusConfig: Record<string, { label: string; color: string }> = {
                      assigned:    { label: 'Atribuída',     color: '#60a5fa' },
                      in_progress: { label: 'Executando',    color: '#f59e0b' },
                      waiting:     { label: 'Aguard. info',  color: '#f97316' },
                      review:      { label: 'Em revisão',    color: '#a855f7' },
                    }
                    const cfg = statusConfig[activeTask.status] || { label: activeTask.status, color: '#9ca3af' }

                    return (
                      <div
                        className="rounded p-1.5 space-y-0.5"
                        style={{ backgroundColor: 'var(--bg-surface)', border: `1px solid ${cfg.color}33` }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                          <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                        </div>
                        <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }} title={activeTask.title}>
                          {activeTask.title}
                        </p>
                      </div>
                    )
                  })()}

                  {/* Tags de especialidade colapsáveis */}
                  {agent.specialties && agent.specialties.length > 0 && (
                    <div>
                      <button
                        onClick={() => setExpandedAgentTags(prev => ({ ...prev, [agent.id]: !prev[agent.id] }))}
                        className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {expandedAgentTags[agent.id] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {expandedAgentTags[agent.id] ? 'Ocultar' : `${agent.specialties.length} especialidade${agent.specialties.length !== 1 ? 's' : ''}`}
                      </button>
                      {expandedAgentTags[agent.id] && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {agent.specialties.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          }
        </div>

        {/* Kanban */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--text-secondary)' }} />
            </div>
          ) : (
            <KanbanBoard tasks={filteredTasks} agents={agents} />
          )}
        </div>

      </div>

      <TaskModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <AgentModal open={isAgentModalOpen} onOpenChange={setIsAgentModalOpen} />

      {editingAgent && (
        <AgentEditModal
          open={!!editingAgent}
          onOpenChange={(open) => { if (!open) setEditingAgent(null) }}
          agent={editingAgent}
        />
      )}
    </div>
  )
}
