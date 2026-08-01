import type { ActivityStatus } from "./activity"
import type { ProjectBrief } from "./project"
import type { UserBrief } from "./user"

/** GET /requests 전용 커서 페이지. next_cursor는 단순 id 기반이면 숫자, 복합 keyset 커서면
 * (JS Number 정밀도 손실을 피하기 위한) 불투명 숫자 문자열이다 — 그대로 다음 요청에 전달해야 한다. */
export interface RequestCursorPage<T> {
	items: T[]
	next_cursor?: number | string | null
}

// === 활동이력 승인 요청(approval request) API 스키마 ===
// waffice-fastapi app/routes/requests.py, app/schemas/request.py 기준 (PR #43 반영).

export type RequestKind = "create" | "update" | "delete"
export type RequestScope = "received" | "sent" | "all"
export type RequestStatus = "pending" | "approved" | "rejected"
export type RequestStatusFilter = RequestStatus | "all"
export type RequestKindFilter = RequestKind | "all"
/** 승인 대상. project_leader: 해당 프로젝트 팀장, operations: 운영진. */
export type ReviewTarget = "project_leader" | "operations"

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
	review_target?: ReviewTarget
	target_user_id?: number | null
	activity_id?: number | null
	after?: ActivityPayload | null
	reason: string
}

export interface ApprovalRequestUpdateRequest {
	reason?: string | null
	after?: ActivityPayload | null
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
	review_target: ReviewTarget
	reviewers: RequestReviewerDetail[]
	status: RequestStatus
	body: ApprovalRequestBody
	review_comment: string | null
	created_at: number
	updated_at: number
	reviewed_at: number | null
}
