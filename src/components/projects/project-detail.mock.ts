import type { ProjectStatusHistory } from "@/types"

// TODO(API): 백엔드에 상태 변경 이력 엔드포인트가 생기면 제거.
// docs/project-management-backend-requests.md 1번 참고.
export const MOCK_PROJECT_STATUS_HISTORIES: ProjectStatusHistory[] = [
	{ status: "active", startDate: "2025.10.01", endDate: "2026.10.01" },
	{ status: "maintenance", startDate: "2024.10.01", endDate: "2025.10.01" },
]
