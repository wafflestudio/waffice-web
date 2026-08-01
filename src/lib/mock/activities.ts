import type { ActivityHistoryItem } from "@/types"

const DAY = 24 * 60 * 60

/** 내 활동이력(GET /users/me/activities) mock — 백엔드 ActivityHistoryItem[]와 동일한 형태. */
export function buildMockMyActivities(): ActivityHistoryItem[] {
	const now = Math.floor(Date.now() / 1000)

	return [
		{
			id: 1,
			pending_request_id: null,
			user_id: 1,
			project_id: 1,
			project_name: "인터널 프로덕트(WAFFICE)",
			position: "백엔드 엔지니어",
			start_date: now - 180 * DAY,
			end_date: now - 30 * DAY,
			status: "active",
			description: "백엔드 엔지니어",
			created_at: now - 180 * DAY,
			updated_at: now - 30 * DAY,
		},
		{
			id: 2,
			pending_request_id: null,
			user_id: 1,
			project_id: 1,
			project_name: "인터널 프로덕트(WAFFICE)",
			position: "백엔드 엔지니어",
			start_date: now - 29 * DAY,
			end_date: null,
			status: "active",
			description: "백엔드 엔지니어",
			created_at: now - 29 * DAY,
			updated_at: now - 29 * DAY,
		},
		{
			id: 3,
			pending_request_id: 101,
			user_id: 1,
			project_id: 1,
			project_name: "인터널 프로덕트(WAFFICE)",
			position: "백엔드 엔지니어",
			start_date: now - 29 * DAY,
			end_date: null,
			status: "update_pending",
			description: "백엔드 엔지니어, 배포 파이프라인 개선 작업 추가",
			created_at: now - 29 * DAY,
			updated_at: now - 2 * DAY,
		},
		{
			id: null,
			pending_request_id: 102,
			user_id: 1,
			project_id: 2,
			project_name: "SNUTT",
			position: "풀스택 엔지니어",
			start_date: now,
			end_date: null,
			status: "create_pending",
			description:
				"풀스택 엔지니어로 프론트와 백엔드를 모두 작업하였으며, 팀 knowledge base 정리 프로젝트를 주도함.",
			created_at: now - 1 * DAY,
			updated_at: now - 1 * DAY,
		},
	]
}
