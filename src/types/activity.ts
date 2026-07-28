import type { UserBrief } from "./user"

export type ActivityStatus = "active" | "inactive"

export interface ActivityDetail {
	id: number
	user_id: number
	project_id: number | null
	project_name: string | null
	position: string
	start_date: number
	end_date: number | null
	status: ActivityStatus
	description: string | null
	created_at: number
	updated_at: number
}

export interface ActivityCreateRequest {
	project_id: number
	position: string
	start_date: number
	end_date?: number | null
	status?: ActivityStatus
	description?: string | null
}

export interface ActivityUpdateRequest {
	project_id?: number | null
	position?: string | null
	start_date?: number | null
	end_date?: number | null
	status?: ActivityStatus | null
	description?: string | null
}

/** "추가 요청중" / "수정 요청중" / "반영된 활동(기록완료)" / "거절된 추가·수정 요청". */
export type ActivityHistoryStatus = "create_pending" | "update_pending" | "active" | "rejected"

/** GET /users/me/activities 항목. 실제 활동과 승인 대기 중인 추가 요청을 통합해 반환한다.
 * 아직 activity 레코드가 없는 추가 요청은 id=null, pending_request_id를 가진 가상 행이다. */
export interface ActivityHistoryItem {
	id: number | null
	pending_request_id: number | null
	user_id: number
	project_id: number | null
	project_name: string | null
	position: string
	start_date: number
	end_date: number | null
	status: ActivityHistoryStatus
	description: string | null
	created_at: number
	updated_at: number
}

/** GET /activities(운영진 전용) 항목 — ActivityHistoryItem에 활동 주체(user) 정보가 추가된다. */
export interface ActivityHistoryAdminItem extends ActivityHistoryItem {
	user: UserBrief
}
