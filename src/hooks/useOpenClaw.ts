import { useState, useEffect, useCallback } from 'react'
import { openClawClient, type Session } from '@/lib/openclaw'
import type { Agent, AgentStatus } from '@/types'

export function getAgentStatus(agent: Agent, isConnected: boolean): AgentStatus {
  if (agent.status === 'blocked' || agent.status === 'paused') return agent.status
  if (isConnected && agent.openclaw_session_key) return 'active'
  return 'idle'
}

export function useOpenClaw() {
  const [isConnected, setIsConnected] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  // Health check function
  const checkHealth = useCallback(async () => {
    try {
      const healthy = await openClawClient.health()
      setIsConnected(healthy)
      return healthy
    } catch (error) {
      console.error('OpenClaw health check error:', error)
      setIsConnected(false)
      return false
    }
  }, [])

  // Fetch sessions function
  const fetchSessions = useCallback(async () => {
    try {
      const sessionList = await openClawClient.listSessions()
      setSessions(sessionList)
    } catch (error) {
      console.error('Failed to fetch OpenClaw sessions:', error)
      setSessions([])
    }
  }, [])

  // Send message function with error handling
  const sendMessage = useCallback(
    async (agentId: string, message: string, sessionKey?: string): Promise<string> => {
      if (!isConnected) {
        throw new Error('OpenClaw gateway is not connected')
      }

      try {
        const response = await openClawClient.sendMessage(agentId, message, sessionKey)
        return response
      } catch (error) {
        console.error('Failed to send message to OpenClaw:', error)
        throw error
      }
    },
    [isConnected]
  )

  // Initial health check and periodic health checks
  useEffect(() => {
    let mounted = true
    let healthCheckInterval: number | null = null

    const initializeOpenClaw = async () => {
      if (!mounted) return

      setLoading(true)

      // Initial health check
      const healthy = await checkHealth()

      if (healthy && mounted) {
        // Fetch initial sessions if connected
        await fetchSessions()
      }

      if (mounted) {
        setLoading(false)
      }
    }

    initializeOpenClaw()

    // Set up periodic health checks every 30 seconds
    healthCheckInterval = setInterval(async () => {
      if (!mounted) return

      const healthy = await checkHealth()

      // Refresh sessions if connected
      if (healthy) {
        await fetchSessions()
      }
    }, 30000)

    return () => {
      mounted = false
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval)
      }
    }
  }, [checkHealth, fetchSessions])

  return {
    isConnected,
    sessions,
    loading,
    sendMessage,
    checkHealth,
    fetchSessions,
  }
}
