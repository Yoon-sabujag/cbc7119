import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Staff } from '../types'

interface AuthStore {
  token: string | null
  staff: Staff | null
  isAuthenticated: boolean
  login: (token: string, staff: Staff) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      staff: null,
      isAuthenticated: false,
      login:  (token, staff) => set({ token, staff, isAuthenticated: true }),
      logout: () => set({ token: null, staff: null, isAuthenticated: false }),
    }),
    { name: 'cha-bio-auth', partialize: (s) => ({ token: s.token, staff: s.staff, isAuthenticated: s.isAuthenticated }) }
  )
)
