import type { ActivityHistoryRecord } from "@/types"

// TODO(API): 활동 이력 요청 API가 확정되면 이 fixture를 `/users/me/activities`와
// 요청 상태/요청 이력 응답을 조합한 query 결과로 교체한다.
export const MOCK_ACTIVITY_HISTORY: ActivityHistoryRecord[] = [
	{
		id: 1,
		startDate: "2025.03.01",
		endDate: "2025.08.31",
		projectName: "인터널 프로덕트(WAFFICE)",
		description: "백엔드 엔지니어",
		status: "추가 완료",
		requests: [],
	},
	{
		id: 2,
		startDate: "2025.09.01",
		endDate: null,
		projectName: "인터널 프로덕트(WAFFICE)",
		description: "백엔드 엔지니어",
		status: "수정 완료",
		requests: [],
	},
	{
		id: 3,
		startDate: "2025.09.01",
		endDate: null,
		projectName: "인터널 프로덕트(WAFFICE)",
		description: "백엔드 엔지니어",
		status: "수정 요청중",
		requests: [
			{
				id: 1,
				kind: "수정 요청",
				requestedAt: "2025.10.01",
				target: "홍길동",
				status: "승인대기중",
			},
		],
	},
	{
		id: 4,
		startDate: "2026.03.01",
		endDate: null,
		projectName: "인터널 프로덕트(WAFFICE)",
		description:
			"풀스택 엔지니어로 프론트와 백엔드를 모두 작업하였으며, 팀 knowledge Base 정리 프로젝트를 주도함.",
		status: "추가 요청중",
		requests: [
			{
				id: 2,
				kind: "추가 요청",
				requestedAt: "2026.03.01",
				target: "김팀장",
				status: "승인대기중",
			},
		],
	},
]

export const ACTIVITY_PROJECT_OPTIONS = ["인터널 프로덕트(WAFFICE)", "SNUTT"] as const

export const ACTIVITY_REQUEST_TARGET_OPTIONS = ["김팀장(WAFFICE)", "와플스튜디오 운영팀"] as const
