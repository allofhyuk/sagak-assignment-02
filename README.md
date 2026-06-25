# sagak-assignment-02

과제 요구사항을 기반으로 건강검진 인증 - 결과 조회를 확인하는 대시보드를 구현했습니다.

- 서비스 로그인(화면 구현, 일반 텍스트 입력으로 대시보드 진입, 가상의 token 로직만 구현)
- 간편인증 후 본인 검진 결과를 받

## 실행

```bash
npm install
npm run dev
npm run build
npm run lint     # oxlint
```

`.env` 설정이 필요합니다.

```
VITE_API_KEY=발급받은_키        # 필수. x-api-key 헤더로 전송
```

## 1. 구조

레이어 구분: 네트워크(`lib`) / API 호출·응답 타입/파싱(`api`) / 상태(`store`) / 화면(`pages`, `components`)으로 나눴습니다.

```
src/
├─ api/
│  ├─ nhis.ts          # 건강검진 조회 API (1차 요청 / 2차 확인)
│  └─ nhis.model.ts    # 타입, 옵션, 응답 파싱, 상태 판정 로직
├─ lib/
│  ├─ http.ts          # 공통 axios 인스턴스 (x-api-key, 에러 정규화)
│  └─ session.ts       # 세션 식별자(id) 발급
├─ store/
│  ├─ authStore.ts     # 서비스 로그인 상태 (토큰, persist)
│  └─ checkupStore.ts  # 간편인증 흐름 + 결과 (sessionStorage 캐시)
├─ routes/
│  └─ ProtectedRoute.tsx
├─ pages/
│  ├─ LoginPage.tsx
│  └─ HomePage.tsx     # 게이트 → 모달 → 결과
├─ components/
│  ├─ Layout.tsx              # 사이드바 레이아웃
│  ├─ Modal.tsx / Button.tsx  # 공용 UI
│  ├─ CheckupAuthModal.tsx    # 간편인증 입력/대기 모달
│  ├─ CheckupResult.tsx       # 검진 기록 리스트 + 상세
│  ├─ BodyMeasureSection.tsx  # 신체측정 카드 + 차트
│  └─ LineChart.tsx           # 공용 라인 차트
├─ mocks/
│  └─ checkupResult.ts # 응답 예시 (개발용)
├─ App.tsx             # 라우팅
└─ main.tsx
```

## 2. 의존성

| 분류       | 패키지                       |
| ---------- | ---------------------------- |
| 프레임워크 | React 19, Vite 7, TypeScript |
| 라우팅     | react-router-dom             |
| 상태관리   | zustand (persist)            |
| 네트워크   | axios                        |
| 시각화     | chart.js, react-chartjs-2    |
| 스타일     | Tailwind CSS v4              |
| 알림       | sonner (토스트)              |

## 3. 유저 플로우

```
로그인(mock)
   └─ 미인증 시 /login 으로 가드

홈 (건강검진 내역)
   ├─ 결과 없음 → 잠금 화면 → [확인하기]
   └─ 결과 있음 → 검진 결과 + [업데이트]

간편인증 모달
   1) 인증수단 / 이름 / 생년월일 / 휴대폰 / 통신사 입력 → [인증하기]
   2) 휴대폰에서 간편인증 (4분 30초 제한) → [인증 완료]
   3) 2차 확인 성공 → 결과 수신 → 모달 닫힘

결과 화면
   ├─ 좌측: 검진 기록 리스트 (일반/암/구강, 일반만 선택 가능)
   └─ 우측: 선택 회차의 전체소견 + 신체측정 카드 + 추이 차트

결과는 sessionStorage에 캐시되어 새로고침해도 유지되고,
[업데이트]로 다시 인증하면 갱신됩니다. 로그아웃 시 캐시는 삭제됩니다.
```

## 4. 과제 주안점

- **공통 네트워크 레이어**
  axios 인스턴스 한 곳에서 `x-api-key` 부착, 에러를 `ApiError`로 정규화, 성공 토스트 처리.

- **도메인별 상태 분리**
  로그인(`authStore`)과 검진 흐름(`checkupStore`)을 별도 스토어로. 토큰은 localStorage, 검진 결과는 sessionStorage에 persist.

- **간편인증 2단계 흐름**
  1차 요청 → 응답의 `multiFactorInfo` 보관 → 휴대폰 인증 후 2차 확인. 만료(4분 30초)와 "본인인증 미완료" 에러를 고려.

- **건강 상태 시각화**
  측정값을 참고치(정상A / 질환의심)와 비교해 정상·주의·위험으로 색상 표시. chart.js로 검진일별 추이를 그리고, 카드 선택으로 지표를 바꿉니다.

- **실 응답 데이터 대응**
  `resultList`(전체 검진)와 `overviewList`(신체측정)는 길이가 다르고 같은 날 일반/암/구강이 섞입니다. 신체측정은 일반검진에만 있어, 일반 회차만 날짜로 매칭하고 나머지는 선택 불가로 처리.

- **성능**
  차트는 공용 컴포넌트로 분리하고 `memo` + `useMemo`로 선택한 지표가 바뀔 때만 다시 그리도록 했습니다.
