import { useState } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { TaskModal } from '@/components/tasks/TaskModal'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'

export function Tasks() {
  const { tasks, isLoading } = useTasks()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Gerencie suas tarefas em um quadro Kanban
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--text-secondary)" }} />
        </div>
      ) : (
        <KanbanBoard tasks={tasks} />
      )}

      <TaskModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
