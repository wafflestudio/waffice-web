import type { ActivityStatus } from "./activity"
import type { ProjectBrief } from "./project"
import type { UserBrief } from "./user"

// === 활동 이력 승인 요청(approval request) API 스키마 ===
// waffice-fastapi app/routes/requests.py, app/schemas/request.py 기준.
// position/ApprovalRequestListItem 확장 필드는 PR #36
// (agent/activity-history-management, 2026-07-26 기준 미머지) 스펙을 미리 반영한 것.
// 머지되면 그대로 쓸 수 있고, 머지 전에는 백엔드가 이 필드들을 내려주지 않을 수 있다.

export type RequestKind = "create" | "update" | "delete"
export type RequestScope = "received" | "sent" | "all"
export type RequestStatus = "pending" | "approved" | "rejected"
export type RequestStatusFilter = RequestStatus | "all"
export type RequestKindFilter = RequestKind | "all"

export interface ActivityPayload {
	project_id: number
	/** PR #36 이전에는 MemberRole("leader"|"member") enum, 이후에는 자유 텍스트(최대 100자). */
	position: string
	start_date: number
	end_date?: number | null
	status?: ActivityStatus
	description?: string | null
}

export interface ActivityPatchPayload {
	position?: string | null
	start_date?: number | null
	end_date?: number | null
	status?: ActivityStatus | null
	description?: string | null
}

export interface RequestReviewBody {
	reviewer_patch?: Record<string, unknown> | null
	final?: Record<string, unknown> | null
	diff?: Record<string, unknown> | null
}

export interface ApprovalRequestBody {
	request_kind: RequestKind
	target_user_id: number
	activity_id: number | null
	before: Record<string, unknown> | null
	after: ActivityPayload | null
	reason: string
	review: RequestReviewBody
}

export interface ApprovalRequestCreateRequest {
	request_kind: RequestKind
	target_user_id?: number | null
	activity_id?: number | null
	after?: ActivityPayload | null
	reason: string
	reviewer_ids?: number[]
}

export interface ApprovalRequestUpdateRequest {
	reason?: string | null
	after?: ActivityPayload | null
	reviewer_ids?: number[] | null
}

export interface ApprovalReviewRequest {
	comment?: string | null
}

export interface ApprovalReviewWithEditsRequest {
	comment: string
	reviewer_patch: ActivityPatchPayload
}

export interface ApprovalRejectRequest {
	comment: string
}

export interface RequestReviewerDetail {
	id: number
	user: UserBrief
}

/** PR #36 이후 target_user_id/activity_id/reviewers/after가 목록 응답에도 포함된다
 * (그 전에는 id/requester/request_kind/status/created_at/reviewed_at만 존재). */
export interface ApprovalRequestListItem {
	id: number
	requester: UserBrief
	target_user_id: number
	activity_id: number | null
	reviewers: RequestReviewerDetail[]
	request_kind: RequestKind
	after: ActivityPayload | null
	status: RequestStatus
	created_at: number
	reviewed_at: number | null
}

export interface ApprovalRequestDetail {
	id: number
	requester: UserBrief
	project: ProjectBrief | null
	reviewed_by: UserBrief | null
	reviewers: RequestReviewerDetail[]
	status: RequestStatus
	body: ApprovalRequestBody
	review_comment: string | null
	created_at: number
	updated_at: number
	reviewed_at: number | null
}
