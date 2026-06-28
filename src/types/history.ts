import type { UserBrief } from "./user"

export type AuditLogAction =
	| "qualification_changed"
	| "admin_granted"
	| "admin_revoked"
	| "project_joined"
	| "project_left"
	| "project_role_changed"

export interface AuditLogDetail {
	id: number
	action: AuditLogAction
	payload: Record<string, unknown>
	actor: UserBrief | null
	created_at: number // Unix timestamp
}

// Backward-compatible aliases. 나중에 사용처 정리하면서 제거하면 됨.
export type HistoryAction = AuditLogAction
export type HistoryDetail = AuditLogDetail
