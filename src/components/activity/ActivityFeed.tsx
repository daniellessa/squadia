import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useActivity } from '@/hooks/useActivity'
import { ActivityItem } from './ActivityItem'
import { Loader2 } from 'lucide-react'

export function ActivityFeed() {
  const { events, isLoading } = useActivity()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--text-secondary)" }} />
          </div>
        ) : events.length === 0 ? (
          <p className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
            Nenhuma atividade recente
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <ActivityItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
