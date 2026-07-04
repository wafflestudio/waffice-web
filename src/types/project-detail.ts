import type { ProjectManagementStatus } from "./project-management"

export type ProjectDetailViewMode = "admin" | "leader"
export type ProjectMemberActivityStatus = "활동 중" | "비활성화"
export type ProjectLinkGroupName = "Released" | "Github" | "ETC"

export interface ProjectDetailMember {
	id: number
	name: string
	studentNumber: string
	isLeader: boolean
	position: string
	email: string
	githubId: string
	status: ProjectMemberActivityStatus
	startDate: string
	endDate: string
	endDatePending?: boolean
}

export interface ProjectDetailLink {
	id: number
	label: string
	type: string
	url: string
}

export interface ProjectDetailLinkGroup {
	name: ProjectLinkGroupName
	links: ProjectDetailLink[]
}

export interface ProjectStatusHistory {
	status: ProjectManagementStatus
	startDate: string
	endDate: string
}

export interface ProjectDetail {
	id: number
	name: string
	status: ProjectManagementStatus
	activeMembers: ProjectDetailMember[]
	pastMembers: ProjectDetailMember[]
	linkGroups: ProjectDetailLinkGroup[]
	statusHistories: ProjectStatusHistory[]
}
