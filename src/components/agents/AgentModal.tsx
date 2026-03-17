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
import { useAgents } from '@/hooks/useAgents'
import { useAuthStore } from '@/stores/authStore'
import type { AgentStatus } from '@/types'

interface AgentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AgentModal({ open, onOpenChange }: AgentModalProps) {
  const { companyId } = useAuthStore()
  const { createAgent } = useAgents()
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    personality: '',
    status: 'idle' as AgentStatus,
    llm_provider: null as "openai" | "anthropic" | "google" | null,
    llm_model: '',
    llm_api_key: '',
    system_prompt: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return

    await createAgent.mutateAsync({
      ...formData,
      company_id: companyId,
      channel: null,
    })

    setFormData({
      name: '',
      role: '',
      personality: '',
      status: 'idle',
      llm_provider: null,
      llm_model: '',
      llm_api_key: '',
      system_prompt: '',
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Nome</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Atendente Virtual"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Função</label>
            <Input
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              placeholder="Ex: Atendimento ao cliente"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Personalidade
            </label>
            <Textarea
              value={formData.personality}
              onChange={(e) =>
                setFormData({ ...formData, personality: e.target.value })
              }
              placeholder="Descreva como o agente deve se comportar..."
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as AgentStatus,
                })
              }
            >
              <option value="idle">Inativo</option>
              <option value="active">Ativo</option>
              <option value="paused">Pausado</option>
              <option value="blocked">Bloqueado</option>
            </Select>
          </div>

          <div className="border-t pt-4" style={{ borderColor: "var(--border-default)" }}>
            <h3 className="text-sm font-semibold mb-3">Configuração de LLM</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Provider</label>
                <Select
                  value={formData.llm_provider || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      llm_provider: e.target.value ? e.target.value as "openai" | "anthropic" | "google" : null,
                    })
                  }
                >
                  <option value="">Nenhum</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                </Select>
              </div>

              {formData.llm_provider && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Modelo</label>
                    <Input
                      value={formData.llm_model}
                      onChange={(e) =>
                        setFormData({ ...formData, llm_model: e.target.value })
                      }
                      placeholder={
                        formData.llm_provider === 'openai'
                          ? 'Ex: gpt-4o'
                          : formData.llm_provider === 'anthropic'
                          ? 'Ex: claude-sonnet-4-5'
                          : 'Ex: gemini-2.0-flash'
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">API Key</label>
                    <Input
                      type="password"
                      value={formData.llm_api_key}
                      onChange={(e) =>
                        setFormData({ ...formData, llm_api_key: e.target.value })
                      }
                      placeholder="Sua API Key"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      System Prompt
                    </label>
                    <Textarea
                      value={formData.system_prompt}
                      onChange={(e) =>
                        setFormData({ ...formData, system_prompt: e.target.value })
                      }
                      placeholder="Instruções de sistema para o agente..."
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createAgent.isPending}>
              {createAgent.isPending ? 'Criando...' : 'Criar Agente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
