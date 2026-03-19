import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Agent, Message, Task, Document } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Circle, Edit, MessageSquare, Brain, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatRelativeTime } from '@/lib/utils'
import { AgentEditModal } from '@/components/agents/AgentEditModal'
import { useOpenClaw, getAgentStatus } from '@/hooks/useOpenClaw'

const statusConfig = {
  idle: { label: 'Inativo', color: 'bg-gray-400' },
  active: { label: 'Ativo', color: 'bg-green-500' },
  blocked: { label: 'Bloqueado', color: 'bg-red-500' },
  paused: { label: 'Pausado', color: 'bg-yellow-500' },
}

export function AgentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('conversations')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const { isConnected } = useOpenClaw()
  const queryClient = useQueryClient()

  const { data: memories = [] } = useQuery({
    queryKey: ['agent-memories', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_memories')
        .select('*')
        .eq('agent_id', id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const deleteMemory = useMutation({
    mutationFn: async (memoryId: string) => {
      const { error } = await supabase.from('agent_memories').delete().eq('id', memoryId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agent-memories', id] }),
  })

  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Agent
    },
  })

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('agent_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Message[]
    },
  })

  const { data: tasks = [] } = useQuery({
    queryKey: ['agent-tasks', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('agent_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Task[]
    },
  })

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('agent_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Document[]
    },
  })

  if (isLoading || !agent) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--text-secondary)" }} />
      </div>
    )
  }

  const status = statusConfig[getAgentStatus(agent, isConnected)]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{agent.name}</CardTitle>
              <p className="mt-1" style={{ color: "var(--text-secondary)" }}>{agent.role}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Circle className={`h-3 w-3 fill-current ${status.color}`} />
                <span className="text-sm">{status.label}</span>
              </div>
              <Button
                size="sm"
                onClick={() => navigate(`/chat/${id}`)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Conversar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditOpen(true)}>
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <h4 className="font-medium mb-2">Personalidade</h4>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{agent.personality}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="conversations" className="flex-1">
            Conversas
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex-1">
            Tarefas
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-1">
            Documentos
          </TabsTrigger>
          <TabsTrigger value="memory" className="flex-1">
            <Brain className="h-3.5 w-3.5 mr-1" />
            Memória {memories.length > 0 && `(${memories.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Conversas</CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <p className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
                  Nenhuma conversa ainda
                </p>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: message.direction === 'in'
                          ? 'var(--bg-elevated)'
                          : 'var(--brand-primary-subtle)',
                      }}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                        {formatRelativeTime(message.created_at)} •{' '}
                        {message.direction === 'in' ? 'Recebida' : 'Enviada'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas do Agente</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
                  Nenhuma tarefa atribuída
                </p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 border rounded-lg transition-colors"
                      style={{ borderColor: "var(--border-default)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--bg-elevated)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                            {task.description}
                          </p>
                        </div>
                        <Badge>{task.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
                  Nenhum documento anexado
                </p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 border rounded-lg transition-colors"
                      style={{ borderColor: "var(--border-default)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--bg-elevated)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      <h4 className="font-medium">{doc.name}</h4>
                      <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                        {formatRelativeTime(doc.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Memória do Agente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {memories.length === 0 ? (
                <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                  Nenhum conhecimento acumulado ainda. Memórias são criadas automaticamente após tarefas concluídas.
                </p>
              ) : (
                <div className="space-y-3">
                  {memories.map((memory: { id: string; content: string; tags: string[]; created_at: string; source_task_id: string | null }) => (
                    <div
                      key={memory.id}
                      className="p-3 rounded-lg border flex items-start gap-3"
                      style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-elevated)' }}
                    >
                      <div className="flex-1 space-y-1.5">
                        <p className="text-sm">{memory.content}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {memory.tags?.map((tag: string) => (
                            <span key={tag} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-tertiary)' }}>
                              #{tag}
                            </span>
                          ))}
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {formatRelativeTime(memory.created_at)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMemory.mutate(memory.id)}
                        className="flex-shrink-0 hover:opacity-70 transition-opacity"
                        title="Remover memória"
                      >
                        <Trash2 className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AgentEditModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        agent={agent}
      />
    </div>
  )
}
