import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { AvatarColorPicker } from '@/components/ui/avatar-color-picker'
import { X } from 'lucide-react'
import { useAgents } from '@/hooks/useAgents'
import { useLlmConnections } from '@/hooks/useLlmConnections'
import { Trash2, AlertTriangle } from 'lucide-react'
import type { Agent, AgentStatus } from '@/types'

interface AgentEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent
}

export function AgentEditModal({ open, onOpenChange, agent }: AgentEditModalProps) {
  const { updateAgent, deleteAgent } = useAgents()
  const { connections } = useLlmConnections()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = async () => {
    await deleteAgent.mutateAsync(agent.id)
    onOpenChange(false)
  }
  const [specialtyInput, setSpecialtyInput] = useState('')

  const [formData, setFormData] = useState({
    name: agent.name,
    role: agent.role,
    personality: agent.personality,
    status: agent.status as AgentStatus,
    llm_connection_id: agent.llm_connection_id ?? null as string | null,
    system_prompt: agent.system_prompt ?? '',
    specialties: agent.specialties ?? [] as string[],
    is_senior: agent.is_senior ?? false,
    avatar_color: agent.avatar_color ?? '#6366F1',
    avatar_url: agent.avatar_url ?? null as string | null,
  })

  useEffect(() => {
    setFormData({
      name: agent.name,
      role: agent.role,
      personality: agent.personality,
      status: agent.status,
      llm_connection_id: agent.llm_connection_id ?? null,
      system_prompt: agent.system_prompt ?? '',
      specialties: agent.specialties ?? [],
      is_senior: agent.is_senior ?? false,
      avatar_color: agent.avatar_color ?? '#6366F1',
      avatar_url: agent.avatar_url ?? null,
    })
  }, [agent])

  const addSpecialty = (value: string) => {
    const tag = value.trim().toLowerCase()
    if (!tag || formData.specialties.includes(tag)) return
    setFormData({ ...formData, specialties: [...formData.specialties, tag] })
    setSpecialtyInput('')
  }

  const removeSpecialty = (tag: string) => {
    setFormData({ ...formData, specialties: formData.specialties.filter(s => s !== tag) })
  }

  const handleSpecialtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSpecialty(specialtyInput)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateAgent.mutateAsync({ id: agent.id, updates: formData })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Agente</DialogTitle>
          <DialogDescription>
            Atualize as informações do agente
          </DialogDescription>
        </DialogHeader>
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
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Função</label>
            <Input
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Personalidade</label>
            <Textarea
              value={formData.personality}
              onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
              rows={3}
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

          {/* Especialidades */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Especialidades
              <span className="font-normal ml-1" style={{ color: 'var(--text-tertiary)' }}>
                (áreas de conhecimento para roteamento de tasks)
              </span>
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {formData.specialties.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(tag)}
                    className="ml-1 hover:opacity-70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              value={specialtyInput}
              onChange={(e) => setSpecialtyInput(e.target.value)}
              onKeyDown={handleSpecialtyKeyDown}
              onBlur={() => addSpecialty(specialtyInput)}
              placeholder="Ex: suporte, financeiro, vendas (Enter para adicionar)"
            />
          </div>

          {/* Agente Sênior */}
          <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border-default)' }}>
            <input
              type="checkbox"
              id="is_senior"
              checked={formData.is_senior}
              onChange={(e) => setFormData({ ...formData, is_senior: e.target.checked })}
              className="h-4 w-4 rounded"
            />
            <div>
              <label htmlFor="is_senior" className="text-sm font-medium cursor-pointer">
                Agente Sênior
              </label>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Responsável por revisar e aprovar tasks finalizadas
              </p>
            </div>
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

          {confirmDelete ? (
            <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: '#7f1d1d22', border: '1px solid #ef4444' }}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-400">Excluir {agent.name}?</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Esta ação é permanente. Todo o histórico, memórias e sessão do agente serão removidos.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteAgent.isPending}
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                >
                  {deleteAgent.isPending ? 'Excluindo...' : 'Sim, excluir'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmDelete(true)}
                className="text-red-400 border-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir agente
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateAgent.isPending}>
                  {updateAgent.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
