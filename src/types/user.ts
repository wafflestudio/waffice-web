import type { Qualification } from "./common"

export interface Website {
	url: string
	type: string
	description?: string | null
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

export interface MyPageProfileUpdateRequest extends ProfileUpdateRequest {
	name?: string | null
	generation?: string | null
	enrollment_status?: string | null
	student_id?: string | null
	major?: string | null
	school_email?: string | null
	position?: string | null
	sms_notification?: boolean | null
	email_notification?: boolean | null
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
