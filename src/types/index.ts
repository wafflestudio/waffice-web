// ============================================================================
// Common Types
// ============================================================================

export type Qualification = "pending" | "associate" | "regular" | "active"

export interface CursorPage<T> {
	items: T[]
	next_cursor?: number | null
}

export interface ApiResponse<T> {
	ok: boolean
	data?: T | null
	error?: string | null
	message?: string | null
}

// ============================================================================
// Auth Types
// ============================================================================

export type AuthStatus = "new" | "pending" | "active"

export interface GoogleTokenRequest {
	code: string
	redirect_uri: string
}

export interface GoogleTokenResponse {
	ok: boolean
	data: {
		status: AuthStatus
		auth_token: string
	}
}

export interface SigninRequest {
	auth_token: string
}

export interface SignupRequest {
	auth_token: string
	name: string
	phone?: string
	affiliation?: string
	bio?: string
	github_username?: string
}

export interface DevSigninRequest {
	email: string
	name: string
	is_admin: boolean
	qualification: "pending" | "associate" | "regular" | "active"
}

export interface Token {
	access_token: string
	token_type: string
}

export interface UserDetail {
	id: number
	email: string
	name: string
	generation: string
	qualification: Qualification
	is_admin: boolean
	phone: string | null
	affiliation: string | null
	bio: string | null
	avatar_url: string | null
	github_username: string | null
	slack_id: string | null
	websites: Website[] | null
	created_at: number // Unix timestamp
}

export interface AuthResult {
	status: AuthStatus
	user: UserDetail
}

export interface AuthResponse {
	ok: boolean
	data: AuthResult
}

// ============================================================================
// User Types
// ============================================================================

export interface Website {
	url: string
	type: string // e.g., "github", "linkedin", "portfolio", "blog"
	description?: string | null
}

export interface UserBrief {
	id: number
	name: string
	email: string
	avatar_url: string | null
}

export interface ApproveRequest {
	qualification: "associate" | "regular" | "active" // Cannot be "pending"
}

export interface ProfileUpdateRequest {
	phone?: string | null
	affiliation?: string | null
	bio?: string | null
	avatar_url?: string | null
	github_username?: string | null
	slack_id?: string | null
	websites?: Website[] | null
}

export interface UserUpdateRequest extends ProfileUpdateRequest {
	name?: string | null
	qualification?: Qualification | null
	is_admin?: boolean | null
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

// ============================================================================
// History Types
// ============================================================================

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

// Legacy Member types (for backwards compatibility until full migration)
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
