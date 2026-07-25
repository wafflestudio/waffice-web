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

## 3. 프로젝트 목록/일괄 수정 API — PR #23 `feat/get-projects-list`, main 머지 완료 (2026-07-25)

- `waffice-fastapi` PR #23(`feat: 프로젝트 멤버 관리 기능 개선 및 예외 처리 추가`)이 main에 머지됨.
- main에 실제로 존재하며 프론트에 반영 완료:
  - `GET /projects` 응답이 `ProjectListItem{id, name, leader_names, member_count, active_member_names, status}`로 변경
  - `PUT /projects/{project_id}/members/bulk` — xlsx/csv 업로드로 팀원 전체 교체 (`useReplaceProjectMembers`)
  - `GET /projects/{project_id}/members/template` — 업로드용 템플릿 다운로드 (`useDownloadProjectMemberTemplate`)
- 위 3개는 정상 동작 확인됨. **다만 `feat/project-more`(항목 5)는 별개 브랜치이며 아직 main에
  없다** — 아래 5번 항목이 이 프로젝트 상세 화면의 실제 장애 원인이니 최우선으로 볼 것.

## 4. 팀원 추가 시 회원 검색

- Figma의 "팀원 추가" 다이얼로그는 이름으로 회원을 검색해 선택하는 UI를 요구한다.
- `POST /projects/{project_id}/members`는 `user_id`를 직접 받으므로, 프론트는
  `GET /users?name=` (기존 회원 목록 API)로 검색 후 `user_id`를 선택하는 방식으로 구현했다.
- 임시회원(`is_temporary`)도 프로젝트 멤버로 추가 가능하다는 것은 `feat/get-projects-list`
  브랜치에서 확인됨(`TemporaryMemberProjectError` 가드 제거). 단, `feat/project-more` 브랜치의
  `add_project_member`에는 이 가드가 아직 남아있어 — 두 브랜치가 함께 머지될 때 조정이 필요한
  충돌 지점 중 하나.

## 5. [진행 중 장애] 프로젝트 상세 팀원 조회 404 — `feat/project-more` 브랜치가 아직 main에 없음

- **2026-07-26 재현 확인**: 프로젝트 상세 화면에서 "활동 팀원" 목록이 아예 뜨지 않음.
  팀원 추가(`POST /projects/{id}/members`)는 정상 동작하지만, 목록 조회가 실패함.
- **원인**: 프론트(`useProjectMembers` 훅, `src/lib/api/projects.ts`의 `getProjectMembers`)는
  `GET /projects/{project_id}/members`를 호출하도록 구현되어 있는데, 이 엔드포인트는
  `origin/feat/project-more` 브랜치에만 있고 **main에는 아직 머지되지 않았다**
  (`app/routes/projects.py` main 버전에는 해당 라우트 자체가 없음, 2026-07-26 기준
  `waffice-fastapi` 클론에서 직접 확인). 그 결과 실제 배포 환경에서 이 요청은 404가 나고
  화면에는 빈 목록만 표시된다.
- 현재 main 기준 실제 팀원 데이터는 `GET /projects/{project_id}`(`ProjectDetail.members`)
  응답 안에만 존재한다.
- `origin/feat/project-more`에 구현되어 있고(머지되면 프론트가 다시 전환할 사항):
  - `GET /projects/{project_id}` 응답에서 `members` 필드 제거, 팀원은
    `GET /projects/{project_id}/members`로 분리 — 커서 페이지네이션(`cursor`, `limit`),
    `status`(`active`/`inactive`) 필터, `keyword`(이름/포지션/이메일/github 부분일치) 검색 지원
  - `MemberDetail.user`에 `github_username` 추가(`ProjectMemberUser`), `activity_status`
    (`"active"|"inactive"`)를 서버가 계산해서 내려줌
- 프론트는 이미 `feat/project-more` 스펙을 가정하고 구현되어 있음(`useProjectMembers`,
  `getProjectMembers`, `project-detail-view.tsx`의 팀원 섹션). **요청: `feat/project-more`를
  main에 우선 머지해달라.** 머지 전까지는 프론트를 임시로 `ProjectDetail.members` 방식으로
  되돌리지 않기로 함(사용자 확인, 2026-07-26) — 백엔드 머지를 기다린다.
- **2026-07-26 확인**: `waffice-fastapi` PR #24("feat: 프로젝트 멤버 목록 페이지네이션 및
  필터링 기능 추가", `feat/project-more`)가 정확히 이 기능이며 아직 OPEN 상태.
  PR 설명에 `GET /projects/{id}` / `GET /projects/{id}/members` 분리, 키워드 검색
  (이름/이메일/포지션/github ID) 지원이 명시되어 있어 프론트 구현과 정합함 — 이 PR을
  머지해달라고 요청하면 된다.
- **주의**: `feat/project-more`와 `feat/get-projects-list`(항목 3, 이미 머지됨)를 실제로
  병합해보면 `app/routes/projects.py`, `app/schemas/project.py` 등에서 충돌이 난다
  (직접 확인함). 머지 시 `ProjectDetail`/`TemporaryMemberProjectError` 가드 등 스키마가
  브랜치 상태와 달라질 수 있으니 재확인 필요.
