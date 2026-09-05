import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/providers/auth-provider"
import { useMockMode } from "@/hooks/use-mock-mode"
import { apiClient } from "@/lib/api"
import { buildMockMyActivities } from "@/lib/mock/activities"
import { canManageMembers } from "@/lib/permissions"
import type {
	ActivityCreateRequest,
	ActivityHistoryAdminItem,
	ActivityHistoryItem,
	ActivityUpdateRequest,
	ApiResponse,
	AuditLogDetail,
	CursorPage,
	Member,
	Page,
	Qualification,
	TemporaryMemberImportResult,
	UserDetail,
	UserUpdateRequest,
} from "@/types"

export const memberQueryKeys = {
	all: ["members"] as const,
	pending: () => [...memberQueryKeys.all, "pending"] as const,
	users: (cursor?: number, limit = 100, name = "") =>
		[...memberQueryKeys.all, "users", cursor, limit, name] as const,
	memberList: (cursor?: number, limit = 100, name = "") =>
		[...memberQueryKeys.all, "member-list", cursor, limit, name] as const,
	user: (userId: number) => [...memberQueryKeys.all, "user", userId] as const,
	auditLog: (userId: number) => [...memberQueryKeys.all, "audit-log", userId] as const,
	activities: (userId: number) => [...memberQueryKeys.all, "activities", userId] as const,
	myActivities: () => [...memberQueryKeys.all, "me", "activities"] as const,
	allActivities: (page = 1, size = 20) =>
		[...memberQueryKeys.all, "all-activities", page, size] as const,
}

export const qualificationToRole = (qualification: Qualification): string => {
	switch (qualification) {
		case "active":
			return "활동회원"
		case "regular":
			return "정회원"
		case "associate":
			return "준회원"
		case "pending":
			return "가입 대기"
		default:
			return "가입 대기"
	}
}

export const roleToQualification = (role: string): Qualification => {
	switch (role) {
		case "활동회원":
			return "active"
		case "정회원":
			return "regular"
		case "준회원":
			return "associate"
		default:
			return "pending"
	}
}

export const userRoleFlagsToAccessRights = (
	user: Pick<UserDetail, "is_admin" | "is_leader">,
): Member["access_rights"] => [
	...(user.is_admin ? (["운영진"] as const) : []),
	...(user.is_leader ? (["팀장"] as const) : []),
]

export const userDetailToMember = (user: UserDetail): Member => ({
	id: user.id,
	name: user.name,
	email: user.contact_email || user.email || "",
	phone: user.phone || undefined,
	github_username: user.github_username || undefined,
	slack_id: user.slack_id || undefined,
	generation: user.generation,
	role: qualificationToRole(user.qualification),
	affiliation: user.graduation_status,
	access_rights: userRoleFlagsToAccessRights(user),
	current_projects: user.current_projects ?? [],
	student_id: user.student_id || undefined,
	department: user.department || undefined,
	is_temporary: user.is_temporary,
	user,
	status: user.qualification === "pending" ? "inactive" : "active",
	join_date: new Date(user.created_at * 1000).toISOString(),
	created_at: new Date(user.created_at * 1000).toISOString(),
	updated_at: new Date(user.created_at * 1000).toISOString(),
})

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

interface UseMembersQueryOptions {
	enabled?: boolean
	name?: string
}

export function usePendingUsers(enabled = true) {
	return useQuery<UserDetail[], Error>({
		queryKey: memberQueryKeys.pending(),
		queryFn: async () =>
			getResponseData(
				await apiClient.getPendingUsers(),
				"가입 대기 회원을 불러오는데 실패했습니다.",
			),
		enabled,
	})
}

export function useUsers(cursor?: number, limit = 100, options: UseMembersQueryOptions = {}) {
	const name = options.name?.trim() ?? ""

	return useQuery<CursorPage<UserDetail>, Error>({
		queryKey: memberQueryKeys.users(cursor, limit, name),
		queryFn: async () =>
			getResponseData(
				await apiClient.getUsers(cursor, limit, name),
				"회원 목록을 불러오는데 실패했습니다.",
			),
		placeholderData: keepPreviousData,
		enabled: options.enabled ?? true,
	})
}

export function useMembers(cursor?: number, limit = 100, options: UseMembersQueryOptions = {}) {
	const name = options.name?.trim() ?? ""

	return useQuery<Member[], Error>({
		queryKey: memberQueryKeys.memberList(cursor, limit, name),
		queryFn: async () => {
			const users = getResponseData(
				await apiClient.getUsers(cursor, limit, name),
				"회원 목록을 불러오는데 실패했습니다.",
			)
			return users.items
				.filter((user) => user.qualification !== "pending" || user.is_temporary)
				.map(userDetailToMember)
		},
		placeholderData: keepPreviousData,
		enabled: options.enabled ?? true,
	})
}

export function useMember(userId: number | null) {
	return useQuery<UserDetail, Error>({
		queryKey:
			userId == null ? [...memberQueryKeys.all, "user", null] : memberQueryKeys.user(userId),
		queryFn: async () => {
			if (userId == null) throw new Error("회원 ID가 없습니다.")
			return getResponseData(
				await apiClient.getUser(userId),
				"회원 정보를 불러오는데 실패했습니다.",
			)
		},
		enabled: userId != null,
	})
}

export function useUpdateUserAdmin() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userId, data }: { userId: number; data: UserUpdateRequest }) =>
			getResponseData(
				await apiClient.updateUserAdmin(userId, data),
				"회원 정보 업데이트에 실패했습니다.",
			),
		onSuccess: (_user, variables) => {
			queryClient.invalidateQueries({ queryKey: memberQueryKeys.all })
			queryClient.invalidateQueries({ queryKey: memberQueryKeys.user(variables.userId) })
		},
	})
}

export function useImportTemporaryMembers() {
	const queryClient = useQueryClient()

	return useMutation<TemporaryMemberImportResult, Error, File>({
		mutationFn: async (file) =>
			getResponseData(
				await apiClient.importTemporaryMembers(file),
				"임시회원 명부를 처리하는 데 실패했습니다.",
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: memberQueryKeys.all })
		},
	})
}

export function useUserAuditLog(userId: number | null) {
	return useQuery<AuditLogDetail[], Error>({
		queryKey:
			userId == null
				? [...memberQueryKeys.all, "audit-log", null]
				: memberQueryKeys.auditLog(userId),
		queryFn: async () => {
			if (userId == null) throw new Error("회원 ID가 없습니다.")
			return getResponseData(
				await apiClient.getUserAuditLog(userId),
				"회원 감사 로그를 불러오는데 실패했습니다.",
			)
		},
		enabled: userId != null,
	})
}

/** GET /users/{id}/activities는 Admin 전용(has_admin_access) — 운영진/회장이 아니면 호출하지 않는다. */
export function useUserActivities(userId: number | null) {
	const { user } = useAuth()
	const canView = canManageMembers(user)

	return useQuery({
		queryKey:
			userId == null
				? [...memberQueryKeys.all, "activities", null]
				: memberQueryKeys.activities(userId),
		queryFn: async () => {
			if (userId == null) throw new Error("회원 ID가 없습니다.")
			return getResponseData(
				await apiClient.getUserActivities(userId),
				"회원 활동이력을 불러오는데 실패했습니다.",
			)
		},
		enabled: userId != null && canView,
	})
}

export function useMyActivities() {
	const { enabled: mockEnabled } = useMockMode()

	return useQuery<ActivityHistoryItem[], Error>({
		queryKey: [...memberQueryKeys.myActivities(), mockEnabled],
		queryFn: async () => {
			if (mockEnabled) return buildMockMyActivities()
			return getResponseData(
				await apiClient.getMyActivities(),
				"내 활동이력을 불러오는데 실패했습니다.",
			)
		},
	})
}

/** GET /activities — 운영진 전용 전체 회원 활동 통합 조회.
 * PR #36(agent/activity-history-management, 2026-07-26 기준 미머지) 이후 사용 가능. */
export function useActivities(page = 1, size = 20) {
	const { user } = useAuth()
	const canView = canManageMembers(user)

	return useQuery<Page<ActivityHistoryAdminItem>, Error>({
		queryKey: memberQueryKeys.allActivities(page, size),
		queryFn: async () =>
			getResponseData(
				await apiClient.getActivities(page, size),
				"전체 활동이력을 불러오는데 실패했습니다.",
			),
		enabled: canView,
	})
}

/** POST /users/{id}/activities는 Admin 전용 — 호출 전 프론트에서도 권한을 확인해 불필요한 403을 막는다. */
export function useCreateUserActivity() {
	const queryClient = useQueryClient()
	const { user } = useAuth()

	return useMutation({
		mutationFn: async ({ userId, data }: { userId: number; data: ActivityCreateRequest }) => {
			if (!canManageMembers(user)) throw new Error("회원 활동이력을 추가할 권한이 없습니다.")
			return getResponseData(
				await apiClient.createUserActivity(userId, data),
				"회원 활동이력 추가에 실패했습니다.",
			)
		},
		onSuccess: (_activity, variables) => {
			queryClient.invalidateQueries({ queryKey: memberQueryKeys.activities(variables.userId) })
		},
	})
}

/** PATCH /users/{id}/activities/{activity_id}는 Admin 전용. */
export function useUpdateUserActivity() {
	const queryClient = useQueryClient()
	const { user } = useAuth()

	return useMutation({
		mutationFn: async ({
			userId,
			activityId,
			data,
		}: {
			userId: number
			activityId: number
			data: ActivityUpdateRequest
		}) => {
			if (!canManageMembers(user)) throw new Error("회원 활동이력을 수정할 권한이 없습니다.")
			return getResponseData(
				await apiClient.updateUserActivity(userId, activityId, data),
				"회원 활동이력 수정에 실패했습니다.",
			)
		},
		onSuccess: (_activity, variables) => {
			queryClient.invalidateQueries({ queryKey: memberQueryKeys.activities(variables.userId) })
		},
	})
}

/** DELETE /users/{id}/activities/{activity_id}는 Admin 전용. */
export function useDeleteUserActivity() {
	const queryClient = useQueryClient()
	const { user } = useAuth()

	return useMutation({
		mutationFn: async ({ userId, activityId }: { userId: number; activityId: number }) => {
			if (!canManageMembers(user)) throw new Error("회원 활동이력을 삭제할 권한이 없습니다.")
			return assertSuccessfulResponse(
				await apiClient.deleteUserActivity(userId, activityId),
				"회원 활동이력 삭제에 실패했습니다.",
			)
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: memberQueryKeys.activities(variables.userId) })
		},
	})
}
