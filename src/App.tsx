import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/Login'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'
import { Agents } from './pages/Agents'
import { AgentDetail } from './pages/AgentDetail'
import { Chat } from './pages/Chat'
import { Tasks } from './pages/Tasks'
import { Settings } from './pages/Settings'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/authStore'
import './i18n'

const queryClient = new QueryClient()

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setCompanyId } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    let profileLoaded = false

    const loadProfile = async (userId: string) => {
      if (profileLoaded) return
      profileLoaded = true
      const { data } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userId)
        .single()
      if (mounted) {
        const companyId = data?.company_id ?? null
        setCompanyId(companyId)
        setLoading(false)
        if (companyId) {
          navigate('/dashboard', { replace: true })
        } else {
          navigate('/onboarding', { replace: true })
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthChange]', event, session?.user?.id, { profileLoaded, mounted })
      if (!mounted) return
      if (session?.user) {
        setUser(session.user)
        loadProfile(session.user.id)
      } else {
        setUser(null)
        setCompanyId(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  console.log('[AuthProvider]', { loading })
  if (loading) return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: '#6366F1', borderTopColor: 'transparent' }} />
    </div>
  )

  return <>{children}</>
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/agents/:id" element={<AgentDetail />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
      </Router>
    </QueryClientProvider>
  )
}

export default App
