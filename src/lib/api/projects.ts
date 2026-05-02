import type { Member, MemberCreate, MemberUpdate } from "@/types/member"
import type { Project, ProjectCreate, ProjectUpdate } from "@/types/project"
import type { ApiClient } from "./client"

export function createProjectsApi(client: ApiClient) {
	return {
		getMembers(skip = 0, limit = 100): Promise<Member[]> {
			return client.request<Member[]>(`/members?skip=${skip}&limit=${limit}`)
		},

		getMember(id: number): Promise<Member> {
			return client.request<Member>(`/members/${id}`)
		},

		createMember(member: MemberCreate): Promise<Member> {
			return client.request<Member>("/members", {
				method: "POST",
				body: JSON.stringify(member),
			})
		},

		updateMember(id: number, member: MemberUpdate): Promise<Member> {
			return client.request<Member>(`/members/${id}`, {
				method: "PUT",
				body: JSON.stringify(member),
			})
		},

		deleteMember(id: number): Promise<void> {
			return client.request<void>(`/members/${id}`, {
				method: "DELETE",
			})
		},

		getProjects(skip = 0, limit = 100): Promise<Project[]> {
			return client.request<Project[]>(`/projects?skip=${skip}&limit=${limit}`)
		},

		getProject(id: number): Promise<Project> {
			return client.request<Project>(`/projects/${id}`)
		},

		createProject(project: ProjectCreate): Promise<Project> {
			return client.request<Project>("/projects", {
				method: "POST",
				body: JSON.stringify(project),
			})
		},

		updateProject(id: number, project: ProjectUpdate): Promise<Project> {
			return client.request<Project>(`/projects/${id}`, {
				method: "PUT",
				body: JSON.stringify(project),
			})
		},

		deleteProject(id: number): Promise<void> {
			return client.request<void>(`/projects/${id}`, {
				method: "DELETE",
			})
		},
	}
}
