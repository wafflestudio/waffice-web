import type { GraduationStatus, NotificationChannel, Qualification } from "./common"

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
	graduation_status: GraduationStatus
	is_admin: boolean
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
	created_at: number
}

export interface UserBrief {
	id: number
	name: string
	email: string
	avatar_url: string | null
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
	is_admin?: boolean | null
	generation?: string | null
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
