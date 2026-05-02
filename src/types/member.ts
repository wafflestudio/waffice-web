// UI 전용 레거시 타입 — API 응답은 UserDetail 사용
export type EnrollmentStatus = "학부생" | "휴학생" | "졸업생"
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
	status: "active" | "inactive" | "suspended"
	join_date: string
	created_at: string
	updated_at: string
}

export interface MemberCreate {
	name: string
	email: string
	phone?: string
	github_username?: string
	slack_id?: string
	status?: "active" | "inactive" | "suspended"
	affiliation?: EnrollmentStatus
	access_rights?: AccessRight[]
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
	join_date?: string
	created_at?: string
	status?: "active" | "inactive" | "suspended"
}
