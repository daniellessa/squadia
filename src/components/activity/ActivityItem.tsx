import type { ActivityEvent } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import {
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Info,
  UserPlus,
} from 'lucide-react'

interface ActivityItemProps {
  event: ActivityEvent
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  message: MessageCircle,
  task_completed: CheckCircle,
  agent_created: UserPlus,
  alert: AlertCircle,
  info: Info,
}

export function ActivityItem({ event }: ActivityItemProps) {
  const Icon = iconMap[event.type] || Info

  return (
    <div
      className="flex gap-3 p-3 rounded-lg transition-colors"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--bg-elevated)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent"
      }}
    >
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand-primary-subtle)" }}>
          <Icon className="h-4 w-4" style={{ color: "var(--brand-primary)" }} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          {event.agent_name && (
            <span className="font-medium">{event.agent_name}</span>
          )}{' '}
          {event.description}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          {formatRelativeTime(event.created_at)}
        </p>
      </div>
    </div>
  )
}
