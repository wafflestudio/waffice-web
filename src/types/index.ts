// ============================================================================
// Core Enums
// ============================================================================

export type Qualification = "pending" | "associate" | "regular" | "active"
export type ProjectStatus = "active" | "maintenance" | "ended"
export type MemberRole = "leader" | "member"
export type HistoryAction =
	| "qualification_changed"
	| "admin_granted"
	| "admin_revoked"
	| "project_joined"
	| "project_left"
	| "project_role_changed"

// ============================================================================
// Common Types
// ============================================================================

export interface Website {
	url: string
	type: string // e.g., "github", "linkedin", "portfolio", "blog"
	description?: string | null
}

export interface CursorPage<T> {
	items: T[]
	next_cursor?: number | null
}

// ============================================================================
// Auth Types
// ============================================================================

export interface GoogleTokenRequest {
	code: string
	redirect_uri: string
}

export interface AuthStatus {
	status: "new" | "pending" | "active"
	auth_token: string
}

export interface SigninRequest {
	auth_token: string
}

export interface SignupRequest {
	auth_token: string
	name: string
	phone?: string | null
	affiliation?: string | null
	bio?: string | null
	github_username?: string | null
}

export interface AuthResult {
	status: "pending" | "active"
	user: UserDetail
}

// ============================================================================
// User Types
// ============================================================================

export interface UserBrief {
	id: number
	name: string
	email: string
	avatar_url: string | null
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

export interface ApproveRequest {
	qualification: Qualification // Cannot be "pending"
}

// ============================================================================
// History Types
// ============================================================================

export interface HistoryDetail {
	id: number
	action: HistoryAction
	payload: Record<string, unknown>
	actor: UserBrief | null
	created_at: number // Unix timestamp
}

// ============================================================================
// Project Types
// ============================================================================

export interface ProjectBrief {
	id: number
	name: string
	status: ProjectStatus
	started_at: string // ISO date string
	created_at: number // Unix timestamp
}

export interface MemberDetail {
	id: number
	user: UserBrief
	role: MemberRole
	position: string | null
	joined_at: string | null // ISO date string
	left_at: string | null // ISO date string
}

export interface ProjectDetail {
	id: number
	name: string
	status: ProjectStatus
	started_at: string // ISO date string
	created_at: number // Unix timestamp
	description: string | null
	ended_at: string | null // ISO date string
	websites: Website[] | null
	members: MemberDetail[]
}

export interface MemberInput {
	user_id: number
	role: MemberRole
	position?: string | null
}

export interface ProjectCreateRequest {
	name: string
	description?: string | null
	status?: ProjectStatus
	started_at: string // ISO date string
	ended_at?: string | null
	websites?: Website[] | null
	members: MemberInput[]
}

export interface ProjectUpdateRequest {
	name?: string | null
	description?: string | null
	status?: ProjectStatus | null
	started_at?: string | null
	ended_at?: string | null
	websites?: Website[] | null
}

export interface MemberUpdateRequest {
	role?: MemberRole | null
	position?: string | null
}

// ============================================================================
// Upload Types
// ============================================================================

export interface PresignedUrlRequest {
	filename: string
	content_type: string
}

export interface PresignedUrlResponse {
	upload_url: string
	file_url: string
}

// ============================================================================
// API Response Wrapper
// ============================================================================

export interface ApiResponse<T> {
	ok: boolean
	data?: T | null
	error?: string | null
	message?: string | null
}
