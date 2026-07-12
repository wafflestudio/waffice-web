export type Qualification = "pending" | "associate" | "regular" | "active"

export type GraduationStatus = "학부생" | "졸업생" | "휴학생" | "대학원생"

export type NotificationChannel = "email" | "sms" | "both"

export type UserRole = "member" | "leader" | "admin" | "admin_and_leader"

export type UserLnbRole = "regular" | "leader" | "waffle_leader" | "operations"

export interface UserRoleFlags {
	is_regular_member: boolean
	is_team_leader: boolean
	is_waffle_leader: boolean
	is_operations_member: boolean
}
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
