import { useState, useRef, useEffect, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { classifyMessage } from '@/lib/classifier'
import { useAuthStore } from '@/stores/authStore'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Send, Loader2, Inbox as InboxIcon, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface InboxMessage {
  id: string
  type: 'user' | 'reply' | 'task_created' | 'task_result' | 'clarification'
  content: string
  tags?: string[]
  taskTitle?: string
  taskId?: string
  createdAt: string
}

const STORAGE_KEY_SESSION = 'squadia:chat:session_id'
const STORAGE_KEY_MESSAGES = 'squadia:chat:messages'

// Recupera ou cria um SESSION_ID persistente por usuário/browser
function getOrCreateSessionId(): string {
  const existing = localStorage.getItem(STORAGE_KEY_SESSION)
  if (existing) return existing
  const newId = `inbox-${Date.now()}-${Math.random().toString(36).slice(2)}`
  localStorage.setItem(STORAGE_KEY_SESSION, newId)
  return newId
}

function loadMessages(): InboxMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveMessages(msgs: InboxMessage[]) {
  // Guarda apenas as últimas 100 mensagens
  const toSave = msgs.slice(-100)
  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(toSave))
}

const SESSION_ID = getOrCreateSessionId()

export function Chat2() {
  const { companyId } = useAuthStore()
  const { taskLimitReached, limits, monthlyTasks } = usePlanLimits()
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<InboxMessage[]>(loadMessages)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Persiste mensagens no localStorage sempre que mudam
  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Escuta tasks com source_session_key = SESSION_ID que foram para "done"
  const handleTaskDone = useCallback((task: { id: string; title: string; description: string }) => {
    // Extrai só o resultado (após o separador "---")
    const parts = task.description.split('\n\n---\n')
    const result = parts[parts.length - 1]
      .replace(/^\*\*Resultado do agente:\*\*\n/, '')
      .trim()

    setMessages(prev => {
      // Evita duplicata
      if (prev.some(m => m.type === 'task_result' && m.taskId === task.id)) return prev
      return [...prev, {
        id: `result-${task.id}`,
        type: 'task_result',
        content: result,
        taskTitle: task.title,
        taskId: task.id,
        createdAt: new Date().toISOString(),
      }]
    })
  }, [])

  // Verifica tasks waiting (agente com dúvida) e done periodicamente
  useEffect(() => {
    const check = async () => {
      // Tasks waiting — agente tem uma pergunta
      const { data: waiting } = await supabase
        .from('tasks')
        .select('id, title, clarification_question')
        .eq('source_session_key', SESSION_ID)
        .eq('status', 'waiting')
        .not('clarification_question', 'is', null)

      if (waiting?.length) {
        setMessages(prev => {
          const existingIds = new Set(prev.filter(m => m.type === 'clarification').map(m => m.taskId))
          const newClarifs = waiting.filter(t => !existingIds.has(t.id)).map(t => ({
            id: `clarif-${t.id}`,
            type: 'clarification' as const,
            content: t.clarification_question!,
            taskTitle: t.title,
            taskId: t.id,
            createdAt: new Date().toISOString(),
          }))
          return newClarifs.length ? [...prev, ...newClarifs] : prev
        })
      }
    }
    check()
    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [])

  // Ao montar: busca tasks done desta sessão já existentes
  useEffect(() => {
    supabase
      .from('tasks')
      .select('id, title, description, status')
      .eq('source_session_key', SESSION_ID)
      .eq('status', 'done')
      .then(({ data, error }) => {

        if (!data?.length) return
        setMessages(prev => {
          const existingIds = new Set(prev.filter(m => m.type === 'task_result' && m.taskId).map(m => m.taskId))
          const newResults = data.filter(t => !existingIds.has(t.id)).map(t => {
            const parts = t.description.split('\n\n---\n')

            const result = parts[parts.length - 1].replace(/^\*\*Resultado do agente:\*\*\n/, '').trim()
            return { id: `result-${t.id}`, type: 'task_result' as const, content: result, taskTitle: t.title, taskId: t.id, createdAt: new Date().toISOString() }
          })
          return newResults.length ? [...prev, ...newResults] : prev
        })
      })
  }, [])

  // Realtime: escuta updates via RLS — entrega imediata quando task vai para done
  useEffect(() => {
    const channel = supabase
      .channel(`chat-results-${SESSION_ID}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tasks' },
        (payload) => {
          const task = payload.new as { id: string; title: string; description: string; status: string; source_session_key: string }
          if (task.status === 'done' && task.source_session_key === SESSION_ID) {
            handleTaskDone(task)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [handleTaskDone])

  const sendMutation = useMutation({
    onError: (error) => {
      console.error('Chat mutation error:', error)
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'reply',
        content: `Erro: ${error instanceof Error ? error.message : 'Falha ao processar mensagem'}`,
        createdAt: new Date().toISOString(),
      }])
    },
    mutationFn: async (content: string) => {
      setMessages(prev => [...prev, {
        id: `user-${Date.now()}`,
        type: 'user',
        content,
        createdAt: new Date().toISOString(),
      }])

      const result = await classifyMessage(content, companyId)

      if (result.type === 'reply' && result.reply) {
        setMessages(prev => [...prev, {
          id: `reply-${Date.now()}`,
          type: 'reply',
          content: result.reply!,
          createdAt: new Date().toISOString(),
        }])
      } else if (result.type === 'task' && result.task) {
        if (!companyId) throw new Error('company_id não encontrado')
        if (taskLimitReached) {
          setMessages(prev => [...prev, {
            id: `limit-${Date.now()}`,
            type: 'reply',
            content: `⚠️ Limite de ${limits.tasks} tasks/mês atingido (${monthlyTasks} usadas). Faça upgrade para o plano Pro para continuar criando tasks.`,
            createdAt: new Date().toISOString(),
          }])
          return
        }

        const { data, error } = await supabase
          .from('tasks')
          .insert([{
            company_id: companyId,
            title: result.task.title,
            description: result.task.description,
            tags: result.task.tags,
            priority: result.task.priority,
            status: 'pending',
            source: 'web',
            source_session_key: SESSION_ID,   // ← salva a sessão de origem
          }])
          .select()
          .single()

        if (error) throw error

        queryClient.invalidateQueries({ queryKey: ['tasks'] })

        setMessages(prev => [...prev, {
          id: `task-${Date.now()}`,
          type: 'task_created',
          content: result.task!.description,
          tags: result.task!.tags,
          taskTitle: result.task!.title,
          taskId: data.id,
          createdAt: new Date().toISOString(),
        }])
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sendMutation.isPending) return
    const msg = input
    setInput('')
    sendMutation.mutate(msg)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex flex-col flex-1 overflow-hidden">
        <CardHeader className="border-b" style={{ borderColor: 'var(--border-default)' }}>
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--brand-primary-subtle)' }}
            >
              <InboxIcon className="h-5 w-5" style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Chat</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Solicitações simples são respondidas aqui, complexas viram tasks e retornam quando prontas
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <InboxIcon className="h-12 w-12" style={{ color: 'var(--text-tertiary)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Envie uma mensagem para começar</p>
              <p className="text-sm text-center max-w-sm" style={{ color: 'var(--text-tertiary)' }}>
                Solicitações simples são respondidas na hora. Problemas complexos são atribuídos automaticamente ao agente mais adequado e o resultado volta aqui.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id}>
                  {/* Mensagem do usuário */}
                  {msg.type === 'user' && (
                    <div className="flex justify-end">
                      <div className="max-w-[70%] rounded-lg p-3 bg-indigo-600 text-white">
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs mt-1 text-indigo-200">{formatRelativeTime(msg.createdAt)}</p>
                      </div>
                    </div>
                  )}

                  {/* Resposta simples do classificador */}
                  {msg.type === 'reply' && (
                    <div className="flex items-end gap-2 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                        IA
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium mb-1 ml-1" style={{ color: 'var(--text-secondary)' }}>
                          Assistente
                        </span>
                        <div className="max-w-[70%] rounded-lg p-3 bg-gray-800">
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs mt-1 text-gray-400">{formatRelativeTime(msg.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Task criada */}
                  {msg.type === 'task_created' && (
                    <div className="flex items-start gap-2 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col max-w-[70%]">
                        <span className="text-xs font-medium mb-1 ml-1" style={{ color: 'var(--text-secondary)' }}>
                          Task criada — aguardando agente
                        </span>
                        <div className="rounded-lg p-3 border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                          <p className="text-sm font-medium mb-1">{msg.taskTitle}</p>
                          <p className="text-sm mb-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{msg.content}</p>
                          {msg.tags && msg.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {msg.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pergunta do agente — aguardando esclarecimento */}
                  {msg.type === 'clarification' && (
                    <div className="flex items-end gap-2 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                        <HelpCircle className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col max-w-[75%]">
                        <span className="text-xs font-medium mb-1 ml-1" style={{ color: 'var(--text-secondary)' }}>
                          ❓ {msg.taskTitle} — precisa de mais informações
                        </span>
                        <div className="rounded-lg p-3 border space-y-3" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: '#f97316', borderLeftWidth: '3px' }}>
                          <p className="text-sm">{msg.content}</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={clarificationAnswers[msg.taskId!] || ''}
                              onChange={(e) => setClarificationAnswers(prev => ({ ...prev, [msg.taskId!]: e.target.value }))}
                              onKeyDown={async (e) => {
                                if (e.key === 'Enter' && msg.taskId && clarificationAnswers[msg.taskId]?.trim()) {
                                  const answer = clarificationAnswers[msg.taskId]
                                  await supabase.from('tasks').update({ clarification_answer: answer }).eq('id', msg.taskId)
                                  setClarificationAnswers(prev => ({ ...prev, [msg.taskId!]: '' }))
                                  setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, type: 'task_created' as const } : m))
                                  setMessages(prev => [...prev, { id: `ans-${Date.now()}`, type: 'user', content: answer, createdAt: new Date().toISOString() }])
                                }
                              }}
                              placeholder="Responda aqui e pressione Enter..."
                              className="flex-1 text-sm rounded px-2 py-1.5 outline-none"
                              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                            />
                            <button
                              onClick={async () => {
                                if (!msg.taskId || !clarificationAnswers[msg.taskId]?.trim()) return
                                const answer = clarificationAnswers[msg.taskId]
                                await supabase.from('tasks').update({ clarification_answer: answer }).eq('id', msg.taskId)
                                setClarificationAnswers(prev => ({ ...prev, [msg.taskId!]: '' }))
                                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, type: 'task_created' as const } : m))
                                setMessages(prev => [...prev, { id: `ans-${Date.now()}`, type: 'user', content: answer, createdAt: new Date().toISOString() }])
                              }}
                              className="px-2 py-1.5 rounded text-sm font-medium"
                              style={{ backgroundColor: '#f97316', color: 'white' }}
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resultado da task */}
                  {msg.type === 'task_result' && (
                    <div className="flex items-end gap-2 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col max-w-[75%]">
                        <span className="text-xs font-medium mb-1 ml-1" style={{ color: 'var(--text-secondary)' }}>
                          ✅ {msg.taskTitle} — concluído
                        </span>
                        <div
                          className="rounded-lg p-3 border"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            borderColor: '#7c3aed44',
                            borderLeftWidth: '3px',
                            borderLeftColor: '#7c3aed',
                          }}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                            {formatRelativeTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {sendMutation.isPending && (
                <div className="flex items-end gap-2 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    IA
                  </div>
                  <div className="rounded-lg p-3 bg-gray-800">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        <div className="border-t p-4" style={{ borderColor: 'var(--border-default)' }}>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua solicitação..."
              disabled={sendMutation.isPending}
              className="flex-1"
            />
            <Button type="submit" disabled={sendMutation.isPending || !input.trim()}>
              {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
