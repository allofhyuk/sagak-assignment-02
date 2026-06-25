/** axios 공통 인스턴스 — x-api-key 부착, 에러 정규화, 성공 토스트 */
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'

/** 요청별 옵션 (axios config의 meta로 전달) */
export interface RequestMeta {
  /** 성공 시 띄울 토스트 메시지 */
  successMessage?: string
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    meta?: RequestMeta
  }
}

/** 정규화된 공통 에러 */
export interface ApiError {
  status: number | null
  message: string
  /** 서버 원본 에러 바디 */
  data: unknown
}

export const http = axios.create({
  // dev 프록시 경로 (CORS 회피)
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/candiy/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 요청: x-api-key 부착
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const apiKey = import.meta.env.VITE_API_KEY
  if (apiKey) {
    config.headers.set('x-api-key', apiKey)
  }
  return config
})

// 응답: 성공 토스트 + 에러 정규화
http.interceptors.response.use(
  (response) => {
    const successMessage = response.config.meta?.successMessage
    if (successMessage) {
      toast.success(successMessage)
    }
    return response
  },
  (error: AxiosError) => Promise.reject(normalizeError(error)),
)

function normalizeError(error: AxiosError): ApiError {
  if (error.response) {
    const data = error.response.data as { message?: string } | undefined
    return {
      status: error.response.status,
      message: data?.message ?? defaultMessage(error.response.status),
      data: error.response.data,
    }
  }
  if (error.code === 'ECONNABORTED') {
    return { status: null, message: '요청 시간이 초과되었습니다.', data: null }
  }
  return { status: null, message: '네트워크 연결을 확인해주세요.', data: null }
}

function defaultMessage(status: number): string {
  switch (status) {
    case 400:
      return '잘못된 요청입니다.'
    case 401:
      return '인증이 만료되었습니다. 다시 로그인해주세요.'
    case 403:
      return '권한이 없습니다.'
    case 404:
      return '대상을 찾을 수 없습니다.'
    case 500:
      return '서버 오류가 발생했습니다.'
    default:
      return `요청에 실패했습니다. (${status})`
  }
}
