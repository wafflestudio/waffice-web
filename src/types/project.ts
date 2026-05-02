import type { Member } from "./member"

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
