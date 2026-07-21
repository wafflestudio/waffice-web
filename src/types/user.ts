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
	graduation_status: GraduationStatus
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
