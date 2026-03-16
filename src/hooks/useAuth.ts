import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const { user, companyId, setUser, setCompanyId } = useAuthStore()
  const navigate = useNavigate()

  // Auth state é gerenciado pelo AuthProvider no App.tsx
  // Este hook apenas expõe o estado e as actions

  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
    return { error }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return {
    user,
    companyId,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
  }
}
