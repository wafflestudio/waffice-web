export type Qualification = "pending" | "associate" | "regular" | "active"

export type GraduationStatus = "학부생" | "졸업생" | "휴학생" | "대학원생"

export type NotificationChannel = "email" | "sms" | "both"

export type UserRole = "member" | "leader" | "admin" | "admin_and_leader"
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
