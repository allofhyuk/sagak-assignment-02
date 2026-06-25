export type LoginTypeLevel = '1' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13'
export type Telecom = '0' | '1' | '2'
export type InquiryType = '0' | '1' | '3' | '4'
export type IsContinue = '0' | '1'

export interface CheckupRequest {
  id: string
  loginTypeLevel: LoginTypeLevel
  legalName: string
  birthdate: string // YYYYMMDD
  phoneNo: string
  telecom: Telecom
  startDate: string // yyyy
  endDate: string
  inquiryType: InquiryType
}

// 1차 응답으로 받아 2차 확인에 그대로 돌려준다
export interface MultiFactorInfo {
  jobIndex: number
  threadIndex: number
  transactionId: string
  multiFactorTimestamp: number
}

export type CheckupResponse = unknown

// 간편인증 만료 시간 (4분 30초)
export const SIMPLE_AUTH_TTL_MS = 270_000

// 1차 응답 data에서 추가 인증 정보를 꺼낸다 (없으면 추가 인증 불필요)
export function extractMultiFactorInfo(res: CheckupResponse): MultiFactorInfo | null {
  if (!res || typeof res !== 'object') return null
  const data = (res as Record<string, unknown>).data as Record<string, unknown> | undefined
  const src = (data?.multiFactorInfo as Record<string, unknown>) ?? data
  if (!src || typeof src !== 'object' || !('transactionId' in src)) return null
  return {
    jobIndex: Number(src.jobIndex),
    threadIndex: Number(src.threadIndex),
    transactionId: String(src.transactionId),
    multiFactorTimestamp: Number(src.multiFactorTimestamp),
  }
}

export const LOGIN_TYPE_OPTIONS: { value: LoginTypeLevel; label: string }[] = [
  { value: '1', label: '카카오톡' },
  { value: '3', label: '삼성패스' },
  { value: '4', label: '국민은행(국민인증서)' },
  { value: '5', label: '통신사(PASS)' },
  { value: '6', label: '네이버' },
  { value: '7', label: '신한은행(신한인증서)' },
  { value: '8', label: '토스' },
  { value: '9', label: '뱅크샐러드' },
  { value: '10', label: '하나은행(하나인증서)' },
  { value: '11', label: 'NH모바일인증서' },
  { value: '12', label: '우리은행(우리인증서)' },
  { value: '13', label: '카카오뱅크' },
]

export const TELECOM_OPTIONS: { value: Telecom; label: string }[] = [
  { value: '0', label: 'SKT (알뜰폰 포함)' },
  { value: '1', label: 'KT (알뜰폰 포함)' },
  { value: '2', label: 'LG U+ (알뜰폰 포함)' },
]

// 2차 응답 (건강검진 결과)
export interface CheckupOverview {
  checkupDate?: string
  height?: string
  weight?: string
  waist?: string
  BMI?: string
  vision?: string
  hearing?: string
  bloodPressure?: string
  proteinuria?: string
  hemoglobin?: string
  fastingBloodGlucose?: string
  totalCholesterol?: string
  HDLCholesterol?: string
  triglyceride?: string
  LDLCholesterol?: string
  serumCreatinine?: string
  GFR?: string
  AST?: string
  ALT?: string
  yGPT?: string
  chestXrayResult?: string
  osteoporosis?: string
  evaluation?: string // 종합판정
}

export interface CheckupReference extends Partial<Record<keyof CheckupOverview, string>> {
  refType: string // 단위 / 정상A / 정상B / 질환의심
}

export interface CheckupResultItem {
  caseType?: string
  checkupType?: string
  checkupDate?: string
  organizationName?: string
  pdfData?: string // base64
  questionnaire?: unknown[]
}

export interface CheckupResultData {
  patientName?: string
  overviewList: CheckupOverview[]
  referenceList: CheckupReference[]
  resultList: CheckupResultItem[]
}

// "18.5-24.9", "100미만", "60이상" 같은 참고치 문자열을 {min,max}로
function parseReferenceRange(s?: string): { min?: number; max?: number } {
  if (!s) return {}
  const c = s.replace(/\s/g, '')
  const range = c.match(/(\d+\.?\d*)[-~](\d+\.?\d*)/)
  if (range) return { min: Number(range[1]), max: Number(range[2]) }
  const num = c.match(/\d+\.?\d*/)
  if (!num) return {}
  const v = Number(num[0])
  if (/미만|이하/.test(c)) return { max: v }
  if (/이상|초과/.test(c)) return { min: v }
  return {}
}

export type HealthStatus = 'normal' | 'caution' | 'danger'

function inRange(v: number, r: { min?: number; max?: number }): boolean {
  if (r.min == null && r.max == null) return false
  if (r.min != null && v < r.min) return false
  if (r.max != null && v > r.max) return false
  return true
}

// 측정값을 정상A / 질환의심 참고치와 비교해 상태 판정
export function evaluateMetricStatus(
  value: string | undefined,
  normalA: string | undefined,
  danger: string | undefined,
): HealthStatus {
  const v = parseFloat(String(value ?? ''))
  if (!Number.isFinite(v)) return 'normal'
  if (danger && inRange(v, parseReferenceRange(danger))) return 'danger'
  if (normalA) return inRange(v, parseReferenceRange(normalA)) ? 'normal' : 'caution'
  return 'normal'
}

export const BODY_METRICS: { key: keyof CheckupOverview; label: string }[] = [
  { key: 'BMI', label: '체질량지수' },
  { key: 'height', label: '신장' },
  { key: 'weight', label: '체중' },
  { key: 'waist', label: '허리둘레' },
]

export function parseCheckupResult(res: CheckupResponse): CheckupResultData | null {
  if (!res || typeof res !== 'object') return null
  const data = (res as Record<string, unknown>).data
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  return {
    patientName: typeof d.patientName === 'string' ? d.patientName : undefined,
    overviewList: Array.isArray(d.overviewList) ? (d.overviewList as CheckupOverview[]) : [],
    referenceList: Array.isArray(d.referenceList) ? (d.referenceList as CheckupReference[]) : [],
    resultList: Array.isArray(d.resultList) ? (d.resultList as CheckupResultItem[]) : [],
  }
}
