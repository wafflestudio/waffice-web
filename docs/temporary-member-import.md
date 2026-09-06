# 활동회원 명부 갱신 연동

## 현재 백엔드 API

`POST /users/active-roster/preview`, `POST /users/active-roster/apply`

- 요청: `multipart/form-data`, 필드 `file`(필수), `reference_date`(선택, unix epoch — 자격 변경 기준일)
- 지원 파일: `.xlsx`, `.csv`
- 동작: 업로드된 명부와 현재 활동회원(ACTIVE) 명단의 diff를 계산한다.
  - 신규 매칭/미매칭 회원 → 활동회원으로 승격(미매칭은 임시회원으로 먼저 생성)
  - 기존 명부에 있었지만 새 명부에 없는 활동회원 → 정회원으로 강등
  - 양쪽에 모두 있는 회원 → 자격 유지
  - 준회원·대기 회원이 매칭되면 전체 업로드를 차단(오류 응답)
- `preview`는 DB에 아무것도 쓰지 않고 집계 카운트만 반환한다. `apply`는 같은 파일로 실제 반영한다.

## 적용 플로우

1. 관리자가 `활동회원 명부 일괄 갱신` 모달에서 `자격 변경 기준일`과 `.xlsx` 파일을 선택한다.
2. 확인을 누르면 `POST /users/active-roster/preview`를 호출한다.
3. 준회원/대기 회원 포함, 헤더 누락 등 오류가 있으면 그 응답의 메시지를 오류 토스트로 보여주고 모달을 닫는다.
4. 오류가 없으면 "갱신 전 결과 확인" 모달에 집계(정회원→활동회원, 활동회원→정회원, 활동회원 유지)를 보여준다.
5. 그 모달에서 확인하면 같은 파일과 기준일로 `POST /users/active-roster/apply`를 호출해 실제로 반영한다.

## 프론트 준비 상태

- `ActiveRosterCounts`, `ActiveRosterPreview`, `ActiveRosterApplyResult` DTO 추가 (`src/types/user.ts`)
- `apiClient.previewActiveRoster(file, referenceDate)` / `applyActiveRoster(file, referenceDate)` 추가
- `usePreviewActiveRoster()` / `useApplyActiveRoster()` mutation 추가
- `ActiveRosterConfirmDialog` — "갱신 전 결과 확인" 모달 추가
- `members/page.tsx`를 preview → 확인 모달 → apply 흐름으로 연결

## 이전 구현(폐기)

이전에는 `POST /users/temporary`(단순 임시회원 일괄 생성, diff/자격 변경 없음)를 그대로 호출했다.
`useImportTemporaryMembers()`와 관련 DTO(`TemporaryMemberImportResult` 등)는 이 엔드포인트 자체가
백엔드에 남아 있어 코드도 남겨뒀지만, 활동회원 명부 갱신 모달과는 더 이상 연결되어 있지 않다.
