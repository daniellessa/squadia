import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ActivityEvent } from '@/types'
import { useAuthStore } from '@/stores/authStore'

export function useActivity() {
  const { companyId } = useAuthStore()
  const [realtimeEvents, setRealtimeEvents] = useState<ActivityEvent[]>([])

  const { data: initialEvents = [], isLoading } = useQuery({
    queryKey: ['activity', companyId],
    queryFn: async () => {
      if (!companyId) return []

      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data as ActivityEvent[]
    },
    enabled: !!companyId,
  })

  useEffect(() => {
    if (!companyId) return

    const channel = supabase
      .channel('activity_feed_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          setRealtimeEvents((prev) => [payload.new as ActivityEvent, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [companyId])

  const events = [...realtimeEvents, ...initialEvents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 50)

  return {
    events,
    isLoading,
  }
}
