import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'

// axios config의 meta로 넘기는 요청별 옵션
export interface RequestMeta {
  successMessage?: string
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    meta?: RequestMeta
  }
}

export interface ApiError {
  status: number | null
  message: string
  data: unknown
}

export const http = axios.create({
  // 직접 호출 테스트 (CORS 허용 여부 확인용). 안 되면 '/api/candiy/v1'로 되돌리기
  baseURL: 'https://api.candiy.io/v1',
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
