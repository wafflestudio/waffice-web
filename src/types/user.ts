import type { GraduationStatus, NotificationChannel, Qualification } from "./common"
import type { MemberCreate, MemberUpdate } from "./member"
import type { CurrentProject } from "./project"

export interface Website {
	url: string
	type: string
	description?: string | null
}

export interface UserDetail {
	id: number
	email: string | null
	name: string
	generation: string
	qualification: Qualification
	requested_qualification: Qualification | null
	graduation_status: GraduationStatus
	privacy_policy_agreed: boolean
	terms_agreed: boolean
	email_notifications_agreed: boolean
	sms_notifications_agreed: boolean
	is_leader: boolean
	is_admin: boolean
	is_president: boolean
	phone: string | null
	affiliation: string | null
	bio: string | null
	avatar_url: string | null
	github_username: string | null
	slack_id: string | null
	websites: Website[] | null
	student_id: string | null
	department: string | null
	contact_email: string | null
	notification_channel: NotificationChannel
	is_temporary: boolean
	created_at: number
	current_projects: CurrentProject[]
}

export interface UserBrief {
	id: number
	name: string
	email: string | null
	avatar_url: string | null
}

export type TemporaryMemberSkipReason =
	| "already_exists"
	| "duplicate_in_request"
	| "missing_student_id"
	| "missing_name"
	| "invalid"

export interface SkippedTemporaryMember {
	name: string
	student_id: string
	reason: TemporaryMemberSkipReason
	message: string
}

export interface TemporaryMemberImportResult {
	created_count: number
	skipped_count: number
	created: UserBrief[]
	skipped: SkippedTemporaryMember[]
}

/** 활동회원 명부 갱신 diff 집계 (app/schemas/user.py ActiveRosterCounts). */
export interface ActiveRosterCounts {
	promoted_count: number
	demoted_count: number
	maintained_count: number
	new_temporary_count: number
}

export interface ActiveRosterPreview extends ActiveRosterCounts {
	reference_date: number
}

export interface ActiveRosterApplyResult extends ActiveRosterCounts {
	reference_date: number
	promoted: UserBrief[]
	demoted: UserBrief[]
	created_temporary: UserBrief[]
}

export interface ApproveRequest {
	qualification: Exclude<Qualification, "pending">
}

export interface ProfileUpdateRequest {
	name?: string | null
	phone?: string | null
	affiliation?: string | null
	bio?: string | null
	avatar_url?: string | null
	github_username?: string | null
	slack_id?: string | null
	websites?: Website[] | null
	graduation_status?: GraduationStatus | null
	student_id?: string | null
	department?: string | null
	contact_email?: string | null
	notification_channel?: NotificationChannel | null
}

export interface MyPageProfileUpdateRequest extends ProfileUpdateRequest {}

export interface UserUpdateRequest extends ProfileUpdateRequest {
	qualification?: Qualification | null
	// TODO(backend): 백엔드 UserUpdateRequest/AuditLog에 아직 없는 필드.
	// qualification과 함께 보내면 서버가 audit log payload에 reason으로 저장해주길 기대.
	// 필드명은 백엔드 스펙 확정 시 맞춰서 수정.
	qualification_change_reason?: string | null
	is_leader?: boolean | null
	is_admin?: boolean | null
	is_president?: boolean | null
	generation?: string | null
}

const emptyToNull = (value?: string) => (value ? value : null)

const roleToQualification = (role: string): Qualification => {
	switch (role) {
		case "활동회원":
			return "active"
		case "정회원":
			return "regular"
		case "준회원":
			return "associate"
		default:
			return "pending"
	}
}

// 회원 관리 UI 수정값을 관리자 회원 수정 API 요청 형식으로 변환한다.
export function toUserUpdateRequest(data: MemberCreate | MemberUpdate): UserUpdateRequest {
	return {
		...(data.name !== undefined && { name: emptyToNull(data.name) }),
		...(data.email !== undefined && { contact_email: emptyToNull(data.email) }),
		...(data.phone !== undefined && { phone: emptyToNull(data.phone) }),
		...(data.affiliation !== undefined && {
			graduation_status: data.affiliation || null,
		}),
		...(data.github_username !== undefined && {
			github_username: emptyToNull(data.github_username),
		}),
		...(data.slack_id !== undefined && { slack_id: emptyToNull(data.slack_id) }),
		...(data.student_id !== undefined && { student_id: emptyToNull(data.student_id) }),
		...(data.department !== undefined && { department: emptyToNull(data.department) }),
		...(data.websites !== undefined && { websites: data.websites }),
		...(data.generation !== undefined && { generation: emptyToNull(data.generation) }),
		...(data.role !== undefined && { qualification: roleToQualification(data.role) }),
		...(data.access_rights !== undefined && {
			is_leader: data.access_rights.includes("팀장"),
			is_admin: data.access_rights.includes("운영진"),
		}),
	}
}

export interface UserPendingCreate {
	google_id: string
	email: string
	name: string
	profile_picture?: string | null
}

export interface User {
	id: number
	google_id: string
	email: string
	name: string
	profile_picture?: string | null
	status: "pending" | "active" | "inactive" | "suspended"
	created_at?: string
	updated_at?: string
}
