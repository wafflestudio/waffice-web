import type { UserBrief } from "./user"

export type HistoryAction =
	| "qualification_changed"
	| "admin_granted"
	| "admin_revoked"
	| "project_joined"
	| "project_left"
	| "project_role_changed"

export interface HistoryDetail {
	id: number
	action: HistoryAction
	payload: Record<string, unknown>
	actor: UserBrief | null
	created_at: number // Unix timestamp
}

// Legacy History types (deprecated)
export type UserHistoryType = "join" | "left" | "discipline" | "project_join" | "project_left"

export interface UserHistoryCreate {
	userid: number
	type: UserHistoryType
	description?: string | null
	curr_privilege?: string | null
	curr_time_stop?: number | null
	prev_privilege?: string | null
	prev_time_stop?: number | null
}

export interface UserHistory {
	id: number
	userid: number
	type: UserHistoryType
	description?: string | null
	curr_privilege?: string | null
	curr_time_stop?: number | null
	prev_privilege?: string | null
	prev_time_stop?: number | null
	created_at?: string
}
