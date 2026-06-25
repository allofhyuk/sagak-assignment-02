const SESSION_ID_KEY = 'nhis-session-id'

// 세션당 한 번 발급해서 재사용
export function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_ID_KEY)
  if (!id) {
    id = `id-${crypto.randomUUID()}`
    sessionStorage.setItem(SESSION_ID_KEY, id)
  }
  return id
}
