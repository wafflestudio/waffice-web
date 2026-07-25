// UI 전용 레거시 타입 — API 응답은 UserDetail 사용
import type { CurrentProject } from "./project"
import type { UserDetail, Website } from "./user"

export type EnrollmentStatus = "학부생" | "휴학생" | "졸업생" | "대학원생"
export type AccessRight = "운영진" | "팀장"

export interface Member {
	id: number
	name: string
	email: string
	phone?: string
	github_username?: string
	slack_id?: string
	generation?: string
	role?: string
	affiliation?: EnrollmentStatus
	access_rights?: AccessRight[]
	current_projects?: CurrentProject[]
	user?: UserDetail
	status: "active" | "inactive" | "suspended"
	join_date: string
	created_at: string
	updated_at: string
	student_id?: string
	department?: string
}

export interface MemberCreate {
	name: string
	email: string
	phone?: string
	github_username?: string
	slack_id?: string
	generation?: string
	role?: string
	status?: "active" | "inactive" | "suspended"
	affiliation?: EnrollmentStatus
	access_rights?: AccessRight[]
	student_id?: string
	department?: string
	websites?: Website[] | null
}

export interface MemberUpdate {
	name?: string
	email?: string
	phone?: string
	github_username?: string
	slack_id?: string
	generation?: string
	role?: string
	affiliation?: EnrollmentStatus
	access_rights?: AccessRight[]
	student_id?: string
	department?: string
	websites?: Website[] | null
	join_date?: string
	created_at?: string
	status?: "active" | "inactive" | "suspended"
}
