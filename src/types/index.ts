// User types (from OpenAPI)
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

// Extended user info for admin endpoints
export interface UserWithProfile {
	id: number
	google_id: string
	email?: string
	name?: string
	type?: "programmer" | "designer" | (string & {})
	privilege?: "associate" | "regular" | "active" | (string & {})
	admin?: number
	profile_major?: string | null
	profile_cardinal?: string | null
	profile_position?: string | null
	receive_email?: boolean
	ctime?: number
	atime?: number
}

export interface UserListResponse {
	ok: boolean
	users: UserWithProfile[]
}

// Legacy Member types (for backwards compatibility until full migration)
export interface Member {
	id: number
	name: string
	email: string
	phone?: string
	github_username?: string
	slack_id?: string
	generation?: string
	role?: string
	affiliation?: string
	status: "active" | "inactive" | "suspended"
	join_date: string
	created_at: string
	updated_at: string
}

export interface MemberCreate {
	name: string
	email: string
	phone?: string
	status?: "active" | "inactive" | "suspended"
}

export interface MemberUpdate {
	name?: string
	email?: string
	phone?: string
	github_username?: string
	slack_id?: string
	generation?: string
	role?: string
	affiliation?: string
	join_date?: string
	created_at?: string
	status?: "active" | "inactive" | "suspended"
}

// Project types
export interface Project {
	id: number
	name: string
	description?: string
	budget?: number
	status: "planning" | "active" | "completed" | "cancelled"
	created_at: string
	updated_at: string
	members: Member[]
}

export interface ProjectCreate {
	name: string
	description?: string
	budget?: number
	status?: "planning" | "active" | "completed" | "cancelled"
	member_ids: number[]
}

export interface ProjectUpdate {
	name?: string
	description?: string
	budget?: number
	status?: "planning" | "active" | "completed" | "cancelled"
	member_ids?: number[]
}
