import type { ApiResponse, CursorPage } from "@/types/common"
import type {
	MemberActivityStatus,
	MemberDetail,
	MemberInput,
	MemberUpdateRequest,
	ProjectCreateRequest,
	ProjectDetail,
	ProjectListItem,
	ProjectUpdateRequest,
} from "@/types/project"
import type { ApiClient } from "./client"

export function createProjectsApi(client: ApiClient) {
	return {
		getProjects(cursor?: number, limit = 20): Promise<ApiResponse<CursorPage<ProjectListItem>>> {
			const params = new URLSearchParams()
			if (cursor) params.append("cursor", cursor.toString())
			params.append("limit", limit.toString())
			return client.request<ApiResponse<CursorPage<ProjectListItem>>>(
				`/projects?${params.toString()}`,
			)
		},

		getProject(projectId: number): Promise<ApiResponse<ProjectDetail>> {
			return client.request<ApiResponse<ProjectDetail>>(`/projects/${projectId}`)
		},

		getProjectMembers(
			projectId: number,
			options: {
				cursor?: number
				limit?: number
				status?: MemberActivityStatus
				keyword?: string
			} = {},
		): Promise<ApiResponse<CursorPage<MemberDetail>>> {
			const { cursor, limit = 20, status, keyword } = options
			const params = new URLSearchParams()
			if (cursor) params.append("cursor", cursor.toString())
			params.append("limit", limit.toString())
			if (status) params.append("status", status)
			if (keyword?.trim()) params.append("keyword", keyword.trim())
			return client.request<ApiResponse<CursorPage<MemberDetail>>>(
				`/projects/${projectId}/members?${params.toString()}`,
			)
		},

		getMyProjects(): Promise<ApiResponse<ProjectListItem[]>> {
			return client.request<ApiResponse<ProjectListItem[]>>("/users/me/projects")
		},

		createProject(request: ProjectCreateRequest): Promise<ApiResponse<ProjectDetail>> {
			return client.request<ApiResponse<ProjectDetail>>("/projects", {
				method: "POST",
				body: JSON.stringify(request),
			})
		},

		updateProject(
			projectId: number,
			request: ProjectUpdateRequest,
		): Promise<ApiResponse<ProjectDetail>> {
			return client.request<ApiResponse<ProjectDetail>>(`/projects/${projectId}`, {
				method: "PATCH",
				body: JSON.stringify(request),
			})
		},

		deleteProject(projectId: number): Promise<ApiResponse<null>> {
			return client.request<ApiResponse<null>>(`/projects/${projectId}`, {
				method: "DELETE",
			})
		},

		addProjectMember(projectId: number, request: MemberInput): Promise<ApiResponse<ProjectDetail>> {
			return client.request<ApiResponse<ProjectDetail>>(`/projects/${projectId}/members`, {
				method: "POST",
				body: JSON.stringify(request),
			})
		},

		updateProjectMember(
			projectId: number,
			userId: number,
			request: MemberUpdateRequest,
		): Promise<ApiResponse<ProjectDetail>> {
			return client.request<ApiResponse<ProjectDetail>>(
				`/projects/${projectId}/members/${userId}`,
				{
					method: "PATCH",
					body: JSON.stringify(request),
				},
			)
		},

		removeProjectMember(projectId: number, userId: number): Promise<ApiResponse<ProjectDetail>> {
			return client.request<ApiResponse<ProjectDetail>>(
				`/projects/${projectId}/members/${userId}`,
				{
					method: "DELETE",
				},
			)
		},

		getProjectMemberTemplate(projectId: number): Promise<Blob> {
			return client.requestBlob(`/projects/${projectId}/members/template`)
		},

		replaceProjectMembers(projectId: number, file: File): Promise<ApiResponse<ProjectDetail>> {
			const formData = new FormData()
			formData.append("file", file)

			return client.request<ApiResponse<ProjectDetail>>(`/projects/${projectId}/members/bulk`, {
				method: "PUT",
				body: formData,
			})
		},
	}
}
