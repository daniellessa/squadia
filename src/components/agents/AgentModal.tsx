import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { AvatarColorPicker } from '@/components/ui/avatar-color-picker'
import { RefreshCw } from 'lucide-react'
import { useAgents } from '@/hooks/useAgents'
import { useAuthStore } from '@/stores/authStore'
import { useLlmConnections } from '@/hooks/useLlmConnections'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import { AlertTriangle } from 'lucide-react'
import { generateAgentName } from '@/lib/agent-names'
import type { AgentStatus } from '@/types'

interface AgentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AgentModal({ open, onOpenChange }: AgentModalProps) {
  const { companyId } = useAuthStore()
  const { createAgent } = useAgents()
  const { connections } = useLlmConnections()
  const { agentLimitReached, limits, activeAgents } = usePlanLimits()
  const [formData, setFormData] = useState({
    name: generateAgentName(),
    role: '',
    personality: '',
    status: 'idle' as AgentStatus,
    llm_connection_id: null as string | null,
    system_prompt: '',
    avatar_color: '#6366F1',
    avatar_url: null as string | null,
  })

  const handleRefreshName = () => {
    setFormData({ ...formData, name: generateAgentName() })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return

    await createAgent.mutateAsync({
      ...formData,
      company_id: companyId,
      channel: null,
    })

    setFormData({
      name: generateAgentName(),
      role: '',
      personality: '',
      status: 'idle',
      llm_connection_id: null,
      system_prompt: '',
      avatar_color: '#6366F1',
      avatar_url: null,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Agente</DialogTitle>
          <DialogDescription>
            Preencha as informações do agente de IA
          </DialogDescription>
        </DialogHeader>
        {agentLimitReached && (
          <div className="flex items-start gap-2 p-3 rounded-lg mb-4" style={{ backgroundColor: '#7f1d1d22', borderColor: '#ef4444', border: '1px solid' }}>
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Limite de agentes atingido</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Você está usando {activeAgents} de {limits.agents} agentes do plano Gratuito. Faça upgrade para criar mais agentes.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Avatar</label>
            <AvatarColorPicker
              name={formData.name}
              color={formData.avatar_color}
              avatarUrl={formData.avatar_url}
              onColorChange={(color) => setFormData({ ...formData, avatar_color: color })}
              onAvatarUrlChange={(url) => setFormData({ ...formData, avatar_url: url })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Nome</label>
            <div className="flex gap-2">
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Atendente Virtual"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRefreshName}
                title="Gerar novo nome"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Função</label>
            <Input
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Ex: Atendimento ao cliente"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Personalidade</label>
            <Textarea
              value={formData.personality}
              onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
              placeholder="Descreva como o agente deve se comportar..."
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as AgentStatus })}
            >
              <option value="idle">Inativo</option>
              <option value="active">Ativo</option>
              <option value="paused">Pausado</option>
              <option value="blocked">Bloqueado</option>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Conexão de IA</label>
            <Select
              value={formData.llm_connection_id || ''}
              onChange={(e) =>
                setFormData({ ...formData, llm_connection_id: e.target.value || null })
              }
            >
              <option value="">Nenhuma (usar OpenClaw padrão)</option>
              {connections.map((connection) => (
                <option key={connection.id} value={connection.id}>
                  {connection.name} — {connection.provider}/{connection.model}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">System Prompt</label>
            <Textarea
              value={formData.system_prompt}
              onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
              placeholder="Instruções de sistema para o agente..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createAgent.isPending || agentLimitReached}>
              {createAgent.isPending ? 'Criando...' : 'Criar Agente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
