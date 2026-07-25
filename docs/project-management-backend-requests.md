# 프로젝트 관리 화면 — 백엔드 요청사항

프론트를 `openapi.json` 기준으로 연동하면서 디자인(Figma)에는 있지만 현재 백엔드 스펙으로는
채울 수 없는 데이터를 정리한다. 아래 항목은 프론트에서 mock으로 임시 대체하고 있으며,
해당 API가 추가되면 교체한다.

## 1. 운영 상태 변경 이력

- Figma: `운영 상태 변경 이력` 다이얼로그 (node `142:22678`)
- 필요한 데이터: 프로젝트의 상태(활성화/유지보수/종결)별 시작일 ~ 종료일 목록
- 현재 `GET /projects/{project_id}` (`ProjectDetail`)는 현재 `status` 값 하나만 제공하고
  과거 상태 전이 이력을 제공하지 않는다.
- 요청: `ProjectStatus`가 바뀔 때마다 이력을 남기는 별도 엔드포인트
  (예: `GET /projects/{project_id}/status-history` → `[{status, started_at, ended_at}]`)
  또는 회원 감사 로그(`GET /users/{id}/audit-log`)와 유사한 프로젝트 단위 audit log.
- 현재 프론트 처리: `project-detail-view.tsx`의 다이얼로그 UI는 유지하되 이력 데이터는
  `project-detail.mock.ts`의 하드코딩된 값을 그대로 사용한다. 실제 상태 변경(저장)은
  `PATCH /projects/{project_id}`로 반영되지만, "변경 이력 보기"에 뜨는 목록 자체는
  API 연동 전까지 실제 변경 내역을 반영하지 못한다.

## 2. 관련 링크 그룹 (Released / Github / ETC)

- Figma: `관련 링크` 테이블 (node `546:22585`) — Released/Github/ETC 3개 그룹으로 묶여 있고,
  같은 `type`(예: "Web")이 여러 그룹에 중복 등장한다 (Released의 Web과 Github의 Web은 별개 링크).
- 현재 `Website` 스키마는 `{url, type, description}`뿐이라 "어느 그룹에 속하는지"를
  저장할 필드가 없다.
- 요청: `Website`에 그룹 구분 필드 추가 필요 (예: `group: "released" | "github" | "etc"`,
  또는 자유 문자열 + 프론트가 그룹 라벨을 매핑).
- 현재 프론트 처리: 그룹 구분 없이 `websites` 배열을 단일 리스트로 표시한다
  (`type` + `description`/`url`만 노출).

## 3. 프로젝트 목록/일괄 수정 API — `feat/get-projects-list` 브랜치 기준 반영 완료

- 2026-07-25 기준, GitHub PR #23·#24는 여전히 OPEN(미머지)이고 로컬 `openapi.json`도
  갱신되지 않았다. `waffice-fastapi`를 직접 클론해서 원격 브랜치 최종 상태로 확인함
  (`Coding/WaffleStudio/waffice-fastapi`, `origin/feat/get-projects-list`).
- 이 브랜치에 구현되어 있고 프론트에 반영 완료:
  - `GET /projects` 응답이 `ProjectListItem{id, name, leader_names, member_count, active_member_names, status}`로 변경
  - `PUT /projects/{project_id}/members/bulk` — xlsx/csv 업로드로 팀원 전체 교체 (`useReplaceProjectMembers`)
  - `GET /projects/{project_id}/members/template` — 업로드용 템플릿 다운로드 (`useDownloadProjectMemberTemplate`)
- **주의**: `main`에는 아직 머지되지 않았으므로 실제 배포 백엔드에는 없을 수 있다.
  머지 시점에 응답 형태가 브랜치와 달라지면 재확인 필요.

## 4. 팀원 추가 시 회원 검색

- Figma의 "팀원 추가" 다이얼로그는 이름으로 회원을 검색해 선택하는 UI를 요구한다.
- `POST /projects/{project_id}/members`는 `user_id`를 직접 받으므로, 프론트는
  `GET /users?name=` (기존 회원 목록 API)로 검색 후 `user_id`를 선택하는 방식으로 구현했다.
- 임시회원(`is_temporary`)도 프로젝트 멤버로 추가 가능하다는 것은 `feat/get-projects-list`
  브랜치에서 확인됨(`TemporaryMemberProjectError` 가드 제거). 단, `feat/project-more` 브랜치의
  `add_project_member`에는 이 가드가 아직 남아있어 — 두 브랜치가 함께 머지될 때 조정이 필요한
  충돌 지점 중 하나.

## 5. 프로젝트 상세 응답에서 팀원 분리 — `feat/project-more` 브랜치 기준 반영 완료

- `origin/feat/project-more`에서 `GET /projects/{project_id}` 응답 스키마가
  `ProjectDetail` → `ProjectPageDetail`로 바뀌고 **`members` 필드가 제거되었다.**
  팀원은 별도 엔드포인트로 분리:
  - `GET /projects/{project_id}/members` — 커서 페이지네이션(`cursor`, `limit`),
    `status`(`active`/`inactive`) 필터, `keyword`(이름/포지션/이메일/github 부분일치) 검색 지원
  - `MemberDetail.user`에 `github_username` 추가(`ProjectMemberUser`), `activity_status`
    (`"active"|"inactive"`)를 서버가 계산해서 내려줌
- 프론트 반영 내용:
  - `src/types/project.ts`: `ProjectDetail`에서 `members` 제거, `MemberDetail`에
    `activity_status`/`ProjectMemberUser(github_username)` 추가
  - `src/lib/api/projects.ts`: `getProjectMembers(projectId, {cursor, limit, status, keyword})` 추가
  - `src/hooks/use-projects.ts`: `useProjectMembers()` 훅 추가, 관련 mutation들의
    invalidate 대상에 `members` 쿼리키 포함
  - `project-detail-view.tsx`: `project.members`를 클라이언트에서 `left_at`으로 필터링하던
    로직을 `useProjectMembers(projectId, {status: "active"|"inactive"})` 서버 필터링으로 교체.
    검색어(`keyword`)는 서버 파라미터를 아직 쓰지 않고 클라이언트 필터를 유지 중
    (타이핑마다 서버 호출하는 건 과함 — 디바운스 도입 시 서버 keyword로 전환 고려)
- **주의**: `feat/project-more`와 `feat/get-projects-list`를 실제로 병합해보면
  `app/routes/projects.py`, `app/schemas/project.py` 등에서 충돌이 난다(직접 확인함).
  두 브랜치가 함께 머지될 때 `ProjectDetail`/`TemporaryMemberProjectError` 가드 등
  스키마가 지금과 달라질 수 있음.
