import type { ProjectStatus } from "./project"

export type ProjectDetailViewMode = "admin" | "leader"

// TODO(API): 백엔드에 상태 변경 이력 엔드포인트가 생기면 mock 대신 API 응답을 사용한다.
// docs/project-management-backend-requests.md 1번 참고.
export interface ProjectStatusHistory {
	status: ProjectStatus
	startDate: string
	endDate: string
}
