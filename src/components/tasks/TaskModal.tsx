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
import { useTasks } from '@/hooks/useTasks'
import { useAuthStore } from '@/stores/authStore'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, X } from 'lucide-react'

interface TaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskModal({ open, onOpenChange }: TaskModalProps) {
  const { companyId } = useAuthStore()
  const { createTask } = useTasks()
  const { taskLimitReached, limits, monthlyTasks } = usePlanLimits()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase()
    if (!tag || formData.tags.includes(tag)) return
    setFormData({ ...formData, tags: [...formData.tags, tag] })
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return

    await createTask.mutateAsync({
      ...formData,
      company_id: companyId,
      agent_id: null,
      status: 'pending',
      source: 'manual',
    })

    setFormData({ title: '', description: '', priority: 'medium', tags: [] })
    setTagInput('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Tarefa</DialogTitle>
          <DialogDescription>
            Adicione uma nova tarefa ao seu quadro
          </DialogDescription>
        </DialogHeader>

        {taskLimitReached && (
          <div className="flex items-start gap-2 p-3 rounded-lg mb-2" style={{ backgroundColor: '#7f1d1d22', border: '1px solid #ef4444' }}>
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Limite de tasks atingido</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {monthlyTasks} de {limits.tasks} tasks usadas este mês. Faça upgrade para o plano Pro.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Título</label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ex: Responder cliente X"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Descrição</label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detalhes da tarefa..."
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Prioridade</label>
            <Select
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as 'low' | 'medium' | 'high',
                })
              }
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </Select>
          </div>
          {/* Tags / especialidades */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tags
              <span className="font-normal ml-1" style={{ color: 'var(--text-tertiary)' }}>
                (ajudam a rotear para o agente certo)
              </span>
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:opacity-70">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) }
              }}
              onBlur={() => addTag(tagInput)}
              placeholder="Ex: suporte, financeiro, vendas (Enter para adicionar)"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createTask.isPending || taskLimitReached}>
              {createTask.isPending ? 'Criando...' : 'Criar Tarefa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
