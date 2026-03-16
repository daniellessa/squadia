import type { Task } from '@/types'
import { TaskCard } from './TaskCard'

interface KanbanBoardProps {
  tasks: Task[]
}

const columns = [
  { id: 'inbox' as const, title: 'Inbox', color: 'border-blue-500' },
  { id: 'in_progress' as const, title: 'Em Andamento', color: 'border-yellow-500' },
  { id: 'done' as const, title: 'Concluído', color: 'border-green-500' },
]

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.id)

        return (
          <div key={column.id} className="flex flex-col">
            <div className={`border-l-4 ${column.color} pl-4 mb-4`}>
              <h3 className="text-lg font-semibold">{column.title}</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {columnTasks.length} {columnTasks.length === 1 ? 'tarefa' : 'tarefas'}
              </p>
            </div>
            <div className="space-y-3 flex-1">
              {columnTasks.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                  Nenhuma tarefa
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
