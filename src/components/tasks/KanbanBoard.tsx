import type { Task, Agent } from '@/types'
import { TaskCard } from './TaskCard'

interface KanbanBoardProps {
  tasks: Task[]
  agents?: Agent[]
}

const columns = [
  { id: 'pending',     title: 'Pendente',       color: 'border-gray-400',   dot: 'bg-gray-400' },
  { id: 'assigned',    title: 'Atribuído',      color: 'border-blue-400',   dot: 'bg-blue-400' },
  { id: 'in_progress', title: 'Em Andamento',   color: 'border-yellow-500', dot: 'bg-yellow-500' },
  { id: 'waiting',     title: 'Aguardando Info',color: 'border-orange-400', dot: 'bg-orange-400' },
  { id: 'review',      title: 'Em Revisão',     color: 'border-purple-500', dot: 'bg-purple-500' },
  { id: 'done',        title: 'Concluído',      color: 'border-green-500',  dot: 'bg-green-500' },
  { id: 'rejected',    title: 'Rejeitado',      color: 'border-red-500',    dot: 'bg-red-500' },
]

export function KanbanBoard({ tasks, agents = [] }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.id)

        return (
          <div key={column.id} className="flex flex-col min-w-[260px] w-[260px]">
            <div className={`border-l-4 ${column.color} pl-3 mb-3`}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${column.dot}`} />
                <h3 className="text-sm font-semibold">{column.title}</h3>
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {columnTasks.length}
                </span>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {columnTasks.length === 0 ? (
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center text-xs"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-tertiary)' }}
                >
                  Nenhuma tarefa
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    assignedAgent={agents.find(a => a.id === task.assigned_to)}
                    executedByAgent={agents.find(a => a.id === task.executed_by)}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
