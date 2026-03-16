import type { Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { formatRelativeTime } from '@/lib/utils'

interface TaskCardProps {
  task: Task
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
}

export function TaskCard({ task }: TaskCardProps) {
  const { moveTask } = useTasks()

  const handleMoveRight = () => {
    if (task.status === 'inbox') {
      moveTask.mutate({ id: task.id, status: 'in_progress' })
    } else if (task.status === 'in_progress') {
      moveTask.mutate({ id: task.id, status: 'done' })
    }
  }

  const handleMoveLeft = () => {
    if (task.status === 'done') {
      moveTask.mutate({ id: task.id, status: 'in_progress' })
    } else if (task.status === 'in_progress') {
      moveTask.mutate({ id: task.id, status: 'inbox' })
    }
  }

  const canMoveRight = task.status !== 'done'
  const canMoveLeft = task.status !== 'inbox'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{task.title}</CardTitle>
          <Badge className={priorityColors[task.priority]}>
            {priorityLabels[task.priority]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{task.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {formatRelativeTime(task.created_at)}
          </span>
          <div className="flex gap-1">
            {canMoveLeft && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMoveLeft}
                disabled={moveTask.isPending}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {canMoveRight && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMoveRight}
                disabled={moveTask.isPending}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
