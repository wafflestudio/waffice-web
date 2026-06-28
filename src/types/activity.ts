export type ActivityStatus = "active" | "inactive"

export interface ActivityDetail {
	id: number
	user_id: number
	project_id: number | null
	project_name: string | null
	position: string
	start_date: number
	end_date: number | null
	status: ActivityStatus
	description: string | null
	created_at: number
	updated_at: number
}

export interface ActivityCreateRequest {
	project_id: number
	position: string
	start_date: number
	end_date?: number | null
	status?: ActivityStatus
	description?: string | null
}

export interface ActivityUpdateRequest {
	project_id?: number | null
	position?: string | null
	start_date?: number | null
	end_date?: number | null
	status?: ActivityStatus | null
	description?: string | null
}
