# 활동 이력 관리 화면 — 백엔드 요청사항

`/activities`(본인용 활동 이력 관리, Figma node `920:7874` 계열)를 mock에서 API로
연동하려던 중 발견한, 현재 백엔드 스펙(`waffice-fastapi` main)으로는 Figma 디자인을
그대로 구현할 수 없는 지점을 정리한다. 아래 두 항목이 해결되기 전까지 화면 연동은 보류한다.

## 1. 요청 목록 응답에 `activity_id`가 없음

- 관련 API: `GET /requests` (`app/routes/requests.py`, `app/schemas/request.py`)
- 활동 이력 상세 다이얼로그(Figma `920:8757`/`920:9075`)에는 해당 활동에 걸린
  "관련 요청" 미니 테이블(요청구분/요청일시/요청대상자/요청상태)이 있다. 이걸 채우려면
  "이 activity_id에 연결된 승인 요청들"을 조회할 수 있어야 한다.
- 그런데 `ApprovalRequestListItem`(목록 응답)은
  `{id, requester, request_kind, status, created_at, reviewed_at}`만 반환하고
  `activity_id`는 상세 응답 `ApprovalRequestDetail.body.activity_id`에만 있다.
- 즉 현재 API로는 "내가 보낸 요청 전체를 `scope=sent`로 가져온 뒤, 각각을
  `GET /requests/{id}`로 다시 조회해서 `body.activity_id`를 비교"하는 N+1 방식만
  가능하다. 본인 요청 수가 적으면 동작은 하지만 비효율적이고, 목록 필터링
  (`GET /requests?activity_id=`) 자체도 불가능하다.
- 요청:
  - `ApprovalRequestListItem`에 `activity_id: int | null` 필드 추가, 또는
  - `GET /requests`에 `activity_id` 쿼리 파라미터 필터 추가

## 2. "추가완료/수정완료" 상태를 구분할 방법이 없음

- Figma 활동 이력 테이블(`920:7874`)은 기록 상태를 **추가 요청중 / 추가 완료 /
  수정 요청중 / 수정 완료** 4가지로 구분한다. 정회원은 활동 이력을 직접 추가/수정하지
  못하고, 운영진(팀장)이 승인해야 반영되는 구조이기 때문에 이 구분이 필요하다.
- 그런데 `ActivityDetail.status`(`ActivityStatus`)는 `active | inactive` 두 값뿐이며,
  이는 "현재 활동 중인지"를 나타내는 값이지 "요청 처리 결과가 추가였는지 수정이었는지"와
  무관하다. 즉 승인된 activity 레코드만 봐서는 그것이 방금 새로 생성된 것인지, 기존
  레코드가 수정된 것인지 API 응답만으로 구분할 수 없다.
- pending 상태(추가 요청중/수정 요청중)는 항목 1이 해결되면 관련 `ApprovalRequestDetail`의
  `body.request_kind`(`create`/`update`)로 구분 가능하지만, **완료 상태(추가완료/수정완료)의
  구분은 별도 필드 없이는 불가능**하다.
- 요청: 다음 중 하나
  - `ActivityDetail`에 최근 승인 이력 요약(예: `last_approved_request_kind`) 추가, 또는
  - 활동 이력 자체에 "생성 시각과 마지막 수정 시각이 다른가"로 유추 가능하도록
    `created_at`/`updated_at`을 승인 시점 기준으로 갱신 (현재 이미 존재하는 필드일 수
    있음 — 승인 시 `updated_at`이 실제로 바뀌는지 백엔드 쪽 확인 필요)

## 3. `position` 필드 의미 불일치 (요청 생성 시 처리 방식 확정)

- `ActivityDetail.position`(실제 활동, `GET /users/me/activities`)은 자유 텍스트
  (`str`, 최대 100자, 예: "백엔드 엔지니어")인 반면, 승인 요청 생성 시 보내는
  `ActivityPayload.position`(`POST /requests`의 `after.position`)은 백엔드 스키마상
  `MemberRole`(`"leader" | "member"`) enum이다. 두 값의 의미가 다르다
  (프로젝트 내 역할 구분 vs 자유 직책명).
- 확정된 임시 처리: 요청 생성 시 `after.position`은 항상 `"member"` 고정값으로 보내고,
  프론트 폼의 자유 텍스트(직책/활동 내용)는 `description` 필드에 담는다.
- 근본적으로는 `ActivityPayload.position`도 `ActivityCreateRequest.position`처럼
  자유 텍스트(`str`)로 통일하는 것이 맞아 보임 — 위 1, 2번과 함께 백엔드에 확인 요청.

## 진행 방침

위 항목 해결 전까지 `/activities` 화면은 기존 mock(`activity-history.mock.ts`,
`activity-history-view.tsx` 등) 그대로 유지한다. `useMyActivities`,
`useCreateRequest`/`useUpdateRequest`/`useDeleteRequest` 등 필요한 훅은 이미
구현되어 있으므로, 백엔드 스펙이 정리되는 대로 mock을 실제 쿼리로 교체하면 된다.

## 2026-07-26 업데이트 — PR #36에서 위 3가지 요청사항 전부 구현됨 (아직 OPEN)

- `waffice-fastapi` PR #36("✨ feat: 활동 이력 관리 API 및 전체 활동 페이지네이션 추가",
  브랜치 `agent/activity-history-management`)가 위 1·2·3번 요청사항을 모두 반영해서
  이미 올라와 있다. 아직 머지 전(OPEN)이므로 화면 연동은 계속 보류하되, 머지되면
  바로 진행 가능하도록 PR 내용을 기록해둔다.
- PR #36 요약:
  - `GET /users/me/activities` — 실제 활동과 승인 대기 요청을 통합 반환. 상태값을
    `create_pending`(추가 요청중) / `update_pending`(수정 요청중) / `active`(반영된 활동)
    3가지로 제공 → **항목 2 해결**. 아직 activity 레코드가 없는 추가 요청은
    `id=null`, `pending_request_id`를 가진 가상 활동 행으로 반환됨.
  - `GET /activities`(신규) — 운영진이 전체 사용자의 실제 활동을 조회. 활동 ID 기준
    커서 페이지네이션, 응답에 사용자/프로젝트 정보 포함 → 운영진용 "활동 이력 관리"
    화면(920:7874)에 필요했던 통합 조회 API가 이걸로 해결됨.
  - `GET /requests`에 `activity_id` 쿼리 필터 추가, 목록 응답에 `activity_id`,
    `target_user_id`, `reviewers`, `after` 추가 → **항목 1 해결**. 상세 조회 없이
    "관련 요청" 테이블 구성 가능.
  - 승인 요청의 `position`을 `leader | member` enum에서 최대 100자 자유 문자열로
    변경 → **항목 3 해결**. `"member"` 고정 임시처리 제거하고 실제 자유 텍스트를
    그대로 보낼 수 있게 됨.
  - 활동 추가 요청 승인 시 생성된 activity ID를 승인요청의 `body.activity_id`에 기록.
- PR 본문의 caveat: `activity_id` 필터는 기존 `approval_requests.body` JSON 필드를
  사용하며 별도 DB 컬럼/인덱스는 없음. 이 PR 이전에 이미 승인된 create 요청은
  `body.activity_id`가 `null`일 수 있고 자동 백필되지 않음.
- **요청: PR #36을 main에 머지해달라.** 머지되면 `/activities`(본인용)와 운영진용
  "활동 이력 관리"(920:7874, `GET /activities` 사용), "나에게 온 요청" 화면을 한 번에
  API 연동 착수한다.

## 2026-07-26 업데이트 2 — 프론트 코드는 PR #36 스펙을 미리 반영, 머지는 별도 대기

- 사용자 요청에 따라 화면 연동(mock→실제)은 보류하되, PR #36이 머지되면 바로 쓸 수
  있도록 타입/API 클라이언트/훅 레이어는 미리 그 스펙으로 작성해뒀다. 아직 실제
  배포 백엔드가 이 필드/엔드포인트를 서빙하지 않으므로, 지금 실행하면 필드 누락
  또는 404가 날 수 있다 — 실제 화면 연결은 머지 확인 후 진행한다.
- 미리 반영한 내용:
  - `src/types/activity.ts`: `ActivityHistoryStatus`, `ActivityHistoryItem`,
    `ActivityHistoryAdminItem` 추가
  - `src/types/request.ts`: `ApprovalRequestListItem`에 `target_user_id`,
    `activity_id`, `reviewers`, `after` 추가. `ActivityPayload`/`ActivityPatchPayload`의
    `position`을 `MemberRole` enum → 자유 문자열(`string`)로 변경(항목 3 임시처리였던
    `"member"` 고정값 로직은 이후 화면 연동 시 제거 예정)
  - `src/lib/api/users.ts`: `getMyActivities()` 반환 타입을 `ActivityHistoryItem[]`로
    갱신, `getActivities(cursor, limit)`(신규, `GET /activities`) 추가
  - `src/lib/api/requests.ts`: `listRequests()`에 `activityId` 필터 파라미터 추가
  - `src/hooks/use-members.ts`: `useMyActivities` 반환 타입 갱신,
    `useActivities(cursor, limit)`(신규, 운영진 전용 가드 포함) 추가
  - `src/hooks/use-requests.ts`: `useRequests()`에 `activityId` 옵션 추가
