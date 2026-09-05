import type { Website } from "./user"

export type ProjectStatus = "active" | "maintenance" | "ended"

export type MemberRole = "leader" | "member"

/** GET /projects/{id}/members가 반환하는 개별 멤버십의 활동 상태 (서버 계산값). */
export type MemberActivityStatus = "active" | "inactive"

export interface CurrentProject {
	id: number
	name: string
}

export interface ProjectMemberUser {
	id: number
	name: string
	email: string | null
	avatar_url: string | null
	github_username: string | null
}

export interface MemberDetail {
	id: number
	user: ProjectMemberUser
	role: MemberRole
	position: string | null
	joined_at: string | null
	left_at: string | null
	/** 서버 계산값: left_at이 없으면 active, 있으면 inactive. */
	activity_status: MemberActivityStatus
}

export interface ProjectBrief {
	id: number
	name: string
	status: ProjectStatus
	started_at: string
	created_at: number
}

export interface ProjectListItem {
	id: number
	name: string
	leader_names: string[]
	member_count: number
	active_member_names: string[]
	status: ProjectStatus
}

/** GET /projects/{id} 응답. 팀원은 더 이상 포함하지 않는다 — GET /projects/{id}/members로 별도 조회. */
export interface ProjectDetail extends ProjectBrief {
	description: string | null
	ended_at: string | null
	websites: Website[] | null
}

export interface MemberInput {
	user_id: number
	role: MemberRole
	position?: string | null
}

export interface ProjectCreateRequest {
	name: string
	description?: string | null
	status?: ProjectStatus
	started_at: string
	ended_at?: string | null
	websites?: Website[] | null
	members: MemberInput[]
}

export interface ProjectUpdateRequest {
	name?: string | null
	description?: string | null
	status?: ProjectStatus | null
	started_at?: string | null
	ended_at?: string | null
	websites?: Website[] | null
}

export interface MemberUpdateRequest {
	role?: MemberRole | null
	position?: string | null
	joined_at?: string | null
	left_at?: string | null
}
