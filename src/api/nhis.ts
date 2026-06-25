import { http } from '../lib/http'
import type { CheckupRequest, CheckupResponse, IsContinue, MultiFactorInfo } from './nhis.model'

// 1차 요청 (간편인증 푸시)
export function requestCheckup(payload: CheckupRequest): Promise<CheckupResponse> {
  return http
    .post<CheckupResponse>('/nhis/checkup', payload, {
      meta: { successMessage: '간편인증 요청을 보냈습니다. 휴대폰에서 인증을 완료해주세요.' },
    })
    .then((res) => res.data)
}

// 2차 확인 (1차 파라미터 + isContinue + multiFactorInfo)
export function confirmCheckup(
  base: CheckupRequest,
  multiFactorInfo: MultiFactorInfo,
  isContinue: IsContinue = '1',
): Promise<CheckupResponse> {
  return http
    .post<CheckupResponse>('/nhis/checkup', { ...base, isContinue, multiFactorInfo })
    .then((res) => res.data)
}
