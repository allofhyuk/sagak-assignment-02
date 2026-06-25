/** 서비스 로그인 제어 스토어 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  isAuthenticated: () => boolean
  /** mock 로그인 — id로 토큰 발급 */
  login: (id: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: () => !!get().token,
      login: (id) => set({ token: `mock-token-${id}` }),
      logout: () => set({ token: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ token: s.token }),
    },
  ),
)
