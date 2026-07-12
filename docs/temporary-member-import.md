# 활동회원 명부 갱신 연동

## 현재 백엔드 API

`POST /users/temporary`

- 요청: `multipart/form-data`, 필드 `file`
- 지원 파일: `.xlsx`, `.csv`
- 동작: 파일을 받는 즉시 DB 미존재 회원을 임시회원으로 생성
- 응답:
  - `created`: 이번 요청에서 즉시 생성된 임시회원
  - `skipped`: 기존 학번, 파일 내 중복, 이름·학번 누락 등으로 건너뛴 행

현재 프론트 디자인은 `.xlsx`만 선택하도록 제한한다.

## 적용 플로우

별도의 preview, 임시회원 발급, 기존회원 연결 단계는 제공하지 않는다.

1. 관리자가 기존 `활동회원 명부 일괄 갱신` 모달에서 `.xlsx` 파일을 선택한다.
2. 확인을 누르면 `POST /users/temporary`를 즉시 호출한다.
3. `created` 대상은 서버에서 바로 반영된다.
4. `skipped`가 있으면 결과 팝업에 제외된 대상의 이름, 학번, 메시지만 표시한다.
5. `skipped`가 없으면 반영 인원 수를 성공 안내로 표시한다.

API 오류는 별도의 오류 토스트로 표시하며 업로드 모달을 닫지 않는다.

## 현재 제약

- 모달의 자격 변경 기준일은 현재 `POST /users/temporary` 요청 필드가 아니므로 서버에 전송되지 않는다.
- 서버는 업로드 즉시 데이터를 반영하므로 프론트에서 사전 확인이나 대상별 처리 방법 선택을 제공하지 않는다.
- API가 `.csv`도 지원하지만 현재 디자인과 파일 선택 UI는 `.xlsx`만 허용한다.

## 프론트 준비 상태

- `TemporaryMemberImportResult`, `SkippedTemporaryMember` DTO 추가
- `apiClient.importTemporaryMembers(file)` 추가
- `useImportTemporaryMembers()` mutation 추가
- `FormData` 요청일 때 `Content-Type` boundary를 브라우저가 설정하도록 API client 수정
- 기존 명부 갱신 모달을 mutation에 연결
- `skipped` 대상 결과 팝업 추가
