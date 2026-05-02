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
