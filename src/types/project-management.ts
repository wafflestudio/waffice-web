import type { ProjectListItem, ProjectStatus } from "./project"

export type ProjectManagementStatusFilter = "전체" | ProjectStatus
export type ProjectManagementViewMode = "admin" | "member"

export type ProjectManagementRow = ProjectListItem

export interface ProjectCreateFormValues {
	name: string
	status: ProjectStatus | ""
	description: string
}
