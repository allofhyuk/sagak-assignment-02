import { useAuthStore } from './authStore'

beforeEach(() => {
  useAuthStore.setState({ token: null })
})

describe('authStore', () => {
  it('로그인', () => {
    useAuthStore.getState().login('hong')
    expect(useAuthStore.getState().token).toBeTruthy()
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)
  })

  it('로그아웃', () => {
    useAuthStore.getState().login('hong')
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })
})
