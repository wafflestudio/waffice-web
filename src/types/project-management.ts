export type ProjectManagementStatus = "활성화" | "유지보수" | "종결"
export type ProjectManagementStatusFilter = "전체" | ProjectManagementStatus
export type ProjectManagementViewMode = "admin" | "member"
export type ProjectCreateStatus = "활동" | "종결" | "말소" | "제명"

export interface ProjectManagementLink {
	label: string
	count: number
	url?: string
}

export interface ProjectManagementRow {
	id: number
	name: string
	leader: string
	memberCount: number
	members: string[]
	links: ProjectManagementLink[]
	status: ProjectManagementStatus
}

export interface ProjectCreateFormValues {
	name: string
	status: ProjectCreateStatus | ""
	description: string
}
