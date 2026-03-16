import { create } from 'zustand'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthState {
  user: SupabaseUser | null
  companyId: string | null | undefined  // undefined = ainda carregando
  setUser: (user: SupabaseUser | null) => void
  setCompanyId: (companyId: string | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  companyId: undefined,  // undefined = ainda carregando
  setUser: (user) => set({ user }),
  setCompanyId: (companyId) => set({ companyId }),
}))
