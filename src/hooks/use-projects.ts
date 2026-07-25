import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMockMode } from "@/hooks/use-mock-mode"
import { apiClient } from "@/lib/api"
import {
	buildMockMyProjects,
	buildMockProjectDetail,
	buildMockProjectListPage,
	buildMockProjectMembersPage,
} from "@/lib/mock/projects"
import type {
	ApiResponse,
	CursorPage,
	MemberActivityStatus,
	MemberDetail,
	MemberInput,
	MemberUpdateRequest,
	ProjectCreateRequest,
	ProjectDetail,
	ProjectListItem,
	ProjectUpdateRequest,
} from "@/types"

export const projectQueryKeys = {
	all: ["projects"] as const,
	list: (cursor?: number, limit = 20) => [...projectQueryKeys.all, "list", cursor, limit] as const,
	detail: (projectId: number) => [...projectQueryKeys.all, "detail", projectId] as const,
	members: (
		projectId: number,
		options: {
			cursor?: number
			limit?: number
			status?: MemberActivityStatus
			keyword?: string
		} = {},
	) => [...projectQueryKeys.all, "members", projectId, options] as const,
	mine: () => [...projectQueryKeys.all, "mine"] as const,
}

function getResponseData<T>(response: ApiResponse<T>, fallbackMessage: string): T {
	if (!response.ok || response.data == null) {
		throw new Error(response.message || fallbackMessage)
	}

	return response.data
}

function assertSuccessfulResponse<T>(response: ApiResponse<T>, fallbackMessage: string): T | null {
	if (!response.ok) {
		throw new Error(response.message || fallbackMessage)
	}

	return response.data ?? null
}

export function useProjects(cursor?: number, limit = 20) {
	const { enabled: mockEnabled } = useMockMode()

	return useQuery<CursorPage<ProjectListItem>, Error>({
		queryKey: [...projectQueryKeys.list(cursor, limit), mockEnabled],
		queryFn: async () => {
			if (mockEnabled) return buildMockProjectListPage()
			return getResponseData(
				await apiClient.getProjects(cursor, limit),
				"프로젝트 목록을 불러오는데 실패했습니다.",
			)
		},
	})
}

export function useProject(projectId: number | null) {
	const { enabled: mockEnabled } = useMockMode()

	return useQuery<ProjectDetail, Error>({
		queryKey: [
			...(projectId == null
				? [...projectQueryKeys.all, "detail", null]
				: projectQueryKeys.detail(projectId)),
			mockEnabled,
		],
		queryFn: async () => {
			if (projectId == null) throw new Error("프로젝트 ID가 없습니다.")
			if (mockEnabled) return buildMockProjectDetail(projectId)
			return getResponseData(
				await apiClient.getProject(projectId),
				"프로젝트 정보를 불러오는데 실패했습니다.",
			)
		},
		enabled: projectId != null,
	})
}

interface UseProjectMembersOptions {
	cursor?: number
	limit?: number
	status?: MemberActivityStatus
	keyword?: string
}

/** GET /projects/{id}/members — 팀원 페이지네이션/검색. project.members는 더 이상 쓰지 않는다. */
export function useProjectMembers(
	projectId: number | null,
	options: UseProjectMembersOptions = {},
) {
	const { enabled: mockEnabled } = useMockMode()
	const { cursor, limit = 20, status, keyword } = options

	return useQuery<CursorPage<MemberDetail>, Error>({
		queryKey: [
			...(projectId == null
				? [...projectQueryKeys.all, "members", null]
				: projectQueryKeys.members(projectId, { cursor, limit, status, keyword })),
			mockEnabled,
		],
		queryFn: async () => {
			if (projectId == null) throw new Error("프로젝트 ID가 없습니다.")
			if (mockEnabled) return buildMockProjectMembersPage(projectId, { status, keyword })
			return getResponseData(
				await apiClient.getProjectMembers(projectId, { cursor, limit, status, keyword }),
				"팀원 목록을 불러오는데 실패했습니다.",
			)
		},
		enabled: projectId != null,
	})
}

export function useMyProjects() {
	const { enabled: mockEnabled } = useMockMode()

	return useQuery<ProjectListItem[], Error>({
		queryKey: [...projectQueryKeys.mine(), mockEnabled],
		queryFn: async () => {
			if (mockEnabled) return buildMockMyProjects()
			return getResponseData(
				await apiClient.getMyProjects(),
				"내 프로젝트 목록을 불러오는데 실패했습니다.",
			)
		},
	})
}

export function useCreateProject() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (request: ProjectCreateRequest) =>
			getResponseData(await apiClient.createProject(request), "프로젝트 생성에 실패했습니다."),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
		},
	})
}

export function useUpdateProject() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ projectId, data }: { projectId: number; data: ProjectUpdateRequest }) =>
			getResponseData(
				await apiClient.updateProject(projectId, data),
				"프로젝트 정보 업데이트에 실패했습니다.",
			),
		onSuccess: (_project, variables) => {
			queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
			queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(variables.projectId) })
		},
	})
}

export function useDeleteProject() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (projectId: number) =>
			assertSuccessfulResponse(
				await apiClient.deleteProject(projectId),
				"프로젝트 삭제에 실패했습니다.",
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
		},
	})
}

export function useAddProjectMember() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ projectId, data }: { projectId: number; data: MemberInput }) =>
			getResponseData(
				await apiClient.addProjectMember(projectId, data),
				"팀원 추가에 실패했습니다.",
			),
		onSuccess: (_project, variables) => {
			queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(variables.projectId) })
			queryClient.invalidateQueries({
				queryKey: [...projectQueryKeys.all, "members", variables.projectId],
			})
			queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
		},
	})
}

export function useUpdateProjectMember() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			projectId,
			userId,
			data,
		}: {
			projectId: number
			userId: number
			data: MemberUpdateRequest
		}) =>
			getResponseData(
				await apiClient.updateProjectMember(projectId, userId, data),
				"팀원 정보 수정에 실패했습니다.",
			),
		onSuccess: (_project, variables) => {
			queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(variables.projectId) })
			queryClient.invalidateQueries({
				queryKey: [...projectQueryKeys.all, "members", variables.projectId],
			})
		},
	})
}

export function useRemoveProjectMember() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ projectId, userId }: { projectId: number; userId: number }) =>
			getResponseData(
				await apiClient.removeProjectMember(projectId, userId),
				"팀원 삭제에 실패했습니다.",
			),
		onSuccess: (_project, variables) => {
			queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(variables.projectId) })
			queryClient.invalidateQueries({
				queryKey: [...projectQueryKeys.all, "members", variables.projectId],
			})
			queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
		},
	})
}

export function useReplaceProjectMembers() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ projectId, file }: { projectId: number; file: File }) =>
			getResponseData(
				await apiClient.replaceProjectMembers(projectId, file),
				"팀원 일괄 수정에 실패했습니다.",
			),
		onSuccess: (_project, variables) => {
			queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(variables.projectId) })
			queryClient.invalidateQueries({
				queryKey: [...projectQueryKeys.all, "members", variables.projectId],
			})
			queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
		},
	})
}

export function useDownloadProjectMemberTemplate() {
	return useMutation({
		mutationFn: async (projectId: number) => apiClient.getProjectMemberTemplate(projectId),
	})
}
