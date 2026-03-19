import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Task, Agent } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { formatRelativeTime } from '@/lib/utils'
import { ChevronDown, ChevronUp, Send, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { DocumentViewer } from '@/components/documents/DocumentViewer'

interface TaskCardProps {
  task: Task
  assignedAgent?: Agent
  executedByAgent?: Agent
}

const priorityColors: Record<Task['priority'], string> = {
  low: 'bg-blue-900 text-blue-200',
  medium: 'bg-yellow-900 text-yellow-200',
  high: 'bg-red-900 text-red-200',
}

const priorityLabels: Record<Task['priority'], string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
}

export function TaskCard({ task, assignedAgent, executedByAgent }: TaskCardProps) {
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [answer, setAnswer] = useState('')
  const [sending, setSending] = useState(false)
  const [viewingDoc, setViewingDoc] = useState(false)

  // Buscar documento vinculado quando task está done
  const { data: document } = useQuery({
    queryKey: ['task-document', task.id],
    queryFn: async () => {
      const agentId = task.executed_by || task.assigned_to
      if (!agentId) return null
      const { data } = await supabase
        .from('documents')
        .select('id, name, url')
        .eq('agent_id', agentId)
        .eq('name', task.title)
        .limit(1)
        .single()
      return data
    },
    enabled: task.status === 'done',
  })

  const submitAnswer = async () => {
    if (!answer.trim() || sending) return
    setSending(true)
    await supabase.from('tasks').update({ clarification_answer: answer.trim() }).eq('id', task.id)
    setAnswer('')
    setSending(false)
  }
  return (
    <div
      className="rounded-lg border p-3 space-y-2"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
    >
      {/* Título + prioridade */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        <Badge className={`${priorityColors[task.priority]} text-xs flex-shrink-0`}>
          {priorityLabels[task.priority]}
        </Badge>
      </div>

      {/* Descrição */}
      {task.description && (
        <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {task.description}
        </p>
      )}

      {/* Tags colapsáveis */}
      {task.tags && task.tags.length > 0 && (
        <div>
          <button
            onClick={() => setTagsExpanded(v => !v)}
            className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {tagsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {tagsExpanded ? 'Ocultar tags' : `${task.tags.length} tag${task.tags.length !== 1 ? 's' : ''}`}
          </button>
          {tagsExpanded && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {task.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pergunta do agente quando waiting */}
      {task.status === 'waiting' && task.clarification_question && (
        <div className="rounded p-2 space-y-2" style={{ backgroundColor: '#7c340022', border: '1px solid #f97316' }}>
          <p className="text-xs font-medium" style={{ color: '#f97316' }}>
            ❓ Agente precisa de mais informações:
          </p>
          <p className="text-xs">{task.clarification_question}</p>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitAnswer() }}
              placeholder="Responda aqui..."
              className="flex-1 text-xs rounded px-2 py-1 outline-none"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              disabled={sending}
            />
            <button
              onClick={submitAnswer}
              disabled={sending || !answer.trim()}
              className="px-2 py-1 rounded"
              style={{ backgroundColor: '#f97316', color: 'white', opacity: (!answer.trim() || sending) ? 0.5 : 1 }}
            >
              <Send className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Executor e revisor */}
      {(executedByAgent || assignedAgent) && (
        <div className="flex items-center gap-3 pt-1 flex-wrap">
          {executedByAgent && (
            <div className="group relative flex items-center gap-1.5 cursor-default">
              <Avatar name={executedByAgent.name} size="sm" color={executedByAgent.avatar_color} imageUrl={executedByAgent.avatar_url} className="h-5 w-5 text-[10px]" />
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{executedByAgent.name}</span>
              <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block z-10 pointer-events-none">
                <div className="rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                  ⚙️ Executado por {executedByAgent.name}
                </div>
              </div>
            </div>
          )}
          {assignedAgent && assignedAgent.id !== executedByAgent?.id && (
            <>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>→</span>
              <div className="group relative flex items-center gap-1.5 cursor-default">
                <Avatar name={assignedAgent.name} size="sm" color={assignedAgent.avatar_color} imageUrl={assignedAgent.avatar_url} className="h-5 w-5 text-[10px]" />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{assignedAgent.name}</span>
                <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block z-10 pointer-events-none">
                  <div className="rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                    🔍 Revisor: {assignedAgent.name}
                  </div>
                </div>
              </div>
            </>
          )}
          {assignedAgent && !executedByAgent && (
            <div className="group relative flex items-center gap-1.5 cursor-default">
              <Avatar name={assignedAgent.name} size="sm" color={assignedAgent.avatar_color} imageUrl={assignedAgent.avatar_url} className="h-5 w-5 text-[10px]" />
              <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{assignedAgent.name}</span>
              <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block z-10 pointer-events-none">
                <div className="rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                  👤 Atribuído a {assignedAgent.name}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {formatRelativeTime(task.created_at)}
        </span>
        <div className="flex items-center gap-2">
          {task.source && task.source !== 'manual' && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>
              {task.source}
            </span>
          )}
          {task.status === 'done' && document && (
            <button
              onClick={() => setViewingDoc(true)}
              className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity"
              style={{ color: 'var(--brand-primary)' }}
            >
              <FileText className="h-3 w-3" />
              Ver resultado
            </button>
          )}
        </div>
      </div>

      {document && (
        <DocumentViewer
          open={viewingDoc}
          onOpenChange={setViewingDoc}
          name={document.name}
          url={document.url}
        />
      )}
    </div>
  )
}
