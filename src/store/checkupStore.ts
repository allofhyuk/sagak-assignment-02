import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { confirmCheckup, requestCheckup } from '../api/nhis'
import {
  extractMultiFactorInfo,
  SIMPLE_AUTH_TTL_MS,
  type CheckupRequest,
  type CheckupResponse,
  type MultiFactorInfo,
} from '../api/nhis.model'

type CheckupPhase = 'idle' | 'pending' | 'done'

interface CheckupState {
  phase: CheckupPhase
  loading: boolean
  error: string | null
  base: CheckupRequest | null
  multiFactorInfo: MultiFactorInfo | null
  result: CheckupResponse | null
  deadline: number | null
  requestAuth: (payload: CheckupRequest) => Promise<void>
  confirmAuth: () => Promise<void>
  cancel: () => Promise<void>
  resetFlow: () => void
  reset: () => void
}

const flowReset = {
  phase: 'idle' as CheckupPhase,
  loading: false,
  error: null,
  base: null,
  multiFactorInfo: null,
  deadline: null,
}

function message(e: unknown): string {
  return (e as { message?: string })?.message ?? '요청에 실패했습니다.'
}

export const useCheckupStore = create<CheckupState>()(
  persist(
    (set, get) => ({
      ...flowReset,
      result: null,

      requestAuth: async (payload) => {
        set({ loading: true, error: null })
        try {
          const res = await requestCheckup(payload)
          const mfi = extractMultiFactorInfo(res)
          if (mfi) {
            set({
              phase: 'pending',
              base: payload,
              multiFactorInfo: mfi,
              deadline: Date.now() + SIMPLE_AUTH_TTL_MS,
            })
          } else {
            set({ ...flowReset, phase: 'done', result: res })
          }
        } catch (e) {
          set({ error: message(e) })
        } finally {
          set({ loading: false })
        }
      },

      confirmAuth: async () => {
        const { base, multiFactorInfo } = get()
        if (!base || !multiFactorInfo) return
        set({ loading: true, error: null })
        try {
          const res = await confirmCheckup(base, multiFactorInfo, '1')
          set({ ...flowReset, phase: 'done', result: res })
        } catch (e) {
          set({ error: message(e) })
        } finally {
          set({ loading: false })
        }
      },

      cancel: async () => {
        const { base, multiFactorInfo } = get()
        if (base && multiFactorInfo) {
          try {
            await confirmCheckup(base, multiFactorInfo, '0')
          } catch {}
        }
        set({ ...flowReset })
      },

      // 결과 유지, 인증 흐름만 초기화 (업데이트 버튼용)
      resetFlow: () => set({ ...flowReset }),
      reset: () => set({ ...flowReset, result: null }),
    }),
    {
      name: 'checkup-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ result: s.result }),
    },
  ),
)
