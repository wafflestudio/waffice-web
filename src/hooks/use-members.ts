import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type {
	ActivityCreateRequest,
	ActivityUpdateRequest,
	ApiResponse,
	AuditLogDetail,
	CursorPage,
	Member,
	Qualification,
	UserDetail,
	UserRole,
	UserUpdateRequest,
} from "@/types"

export const memberQueryKeys = {
	all: ["members"] as const,
	users: (cursor?: number, limit = 100, name = "") =>
		[...memberQueryKeys.all, "users", cursor, limit, name] as const,
	memberList: (cursor?: number, limit = 100, name = "") =>
		[...memberQueryKeys.all, "member-list", cursor, limit, name] as const,
	user: (userId: number) => [...memberQueryKeys.all, "user", userId] as const,
	auditLog: (userId: number) => [...memberQueryKeys.all, "audit-log", userId] as const,
	activities: (userId: number) => [...memberQueryKeys.all, "activities", userId] as const,
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
			return "미가입"
		default:
			return "미가입"
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

export const userRoleToAccessRights = (role: UserRole): Member["access_rights"] => {
	switch (role) {
		case "admin_and_leader":
			return ["운영진", "팀장"]
		case "admin":
			return ["운영진"]
		case "leader":
			return ["팀장"]
		case "member":
			return []
	}
}

export const accessRightsToUserRole = (accessRights: Member["access_rights"] = []): UserRole => {
	const isAdmin = accessRights.includes("운영진")
	const isLeader = accessRights.includes("팀장")

	if (isAdmin && isLeader) return "admin_and_leader"
	if (isAdmin) return "admin"
	if (isLeader) return "leader"
	return "member"
}

export const userDetailToMember = (user: UserDetail): Member => ({
	id: user.id,
	name: user.name,
	email: user.contact_email || user.email,
	phone: user.phone || undefined,
	github_username: user.github_username || undefined,
	slack_id: user.slack_id || undefined,
	generation: user.generation,
	role: qualificationToRole(user.qualification),
	affiliation: user.graduation_status,
	access_rights: userRoleToAccessRights(user.role),
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
			return users.items.filter((user) => user.qualification !== "pending").map(userDetailToMember)
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

export function useUserActivities(userId: number | null) {
	return useQuery({
		queryKey:
			userId == null
				? [...memberQueryKeys.all, "activities", null]
				: memberQueryKeys.activities(userId),
		queryFn: async () => {
			if (userId == null) throw new Error("회원 ID가 없습니다.")
			return getResponseData(
				await apiClient.getUserActivities(userId),
				"회원 활동 이력을 불러오는데 실패했습니다.",
			)
		},
		enabled: userId != null,
	})
}

export function useCreateUserActivity() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userId, data }: { userId: number; data: ActivityCreateRequest }) =>
			getResponseData(
				await apiClient.createUserActivity(userId, data),
				"회원 활동 이력 추가에 실패했습니다.",
			),
		onSuccess: (_activity, variables) => {
			queryClient.invalidateQueries({ queryKey: memberQueryKeys.activities(variables.userId) })
		},
	})
}

export function useUpdateUserActivity() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			userId,
			activityId,
			data,
		}: {
			userId: number
			activityId: number
			data: ActivityUpdateRequest
		}) =>
			getResponseData(
				await apiClient.updateUserActivity(userId, activityId, data),
				"회원 활동 이력 수정에 실패했습니다.",
			),
		onSuccess: (_activity, variables) => {
			queryClient.invalidateQueries({ queryKey: memberQueryKeys.activities(variables.userId) })
		},
	})
}

export function useDeleteUserActivity() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userId, activityId }: { userId: number; activityId: number }) =>
			assertSuccessfulResponse(
				await apiClient.deleteUserActivity(userId, activityId),
				"회원 활동 이력 삭제에 실패했습니다.",
			),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: memberQueryKeys.activities(variables.userId) })
		},
	})
}
