import { useState } from 'react'
import { useAgents } from '@/hooks/useAgents'
import { AgentList } from '@/components/agents/AgentList'
import { AgentModal } from '@/components/agents/AgentModal'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'

export function Agents() {
  const { agents, isLoading } = useAgents()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agentes</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Gerencie seus agentes de IA
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Agente
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--text-secondary)" }} />
        </div>
      ) : (
        <AgentList agents={agents} />
      )}

      <AgentModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
