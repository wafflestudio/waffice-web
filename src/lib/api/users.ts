import type {
	ActivityCreateRequest,
	ActivityDetail,
	ActivityHistoryAdminItem,
	ActivityHistoryItem,
	ActivityUpdateRequest,
} from "@/types/activity"
import type { ApiResponse, CursorPage } from "@/types/common"
import type { AuditLogDetail, HistoryDetail } from "@/types/history"
import type {
	ApproveRequest,
	TemporaryMemberImportResult,
	UserDetail,
	UserUpdateRequest,
} from "@/types/user"
import type { ApiClient } from "./client"

export function createUsersApi(client: ApiClient) {
	return {
		getPendingUsers(): Promise<ApiResponse<UserDetail[]>> {
			return client.request<ApiResponse<UserDetail[]>>("/users/pending")
		},

		importTemporaryMembers(file: File): Promise<ApiResponse<TemporaryMemberImportResult>> {
			const formData = new FormData()
			formData.append("file", file)

			return client.request<ApiResponse<TemporaryMemberImportResult>>("/users/temporary", {
				method: "POST",
				body: formData,
			})
		},

		getUsers(
			cursor?: number,
			limit = 20,
			name?: string,
		): Promise<ApiResponse<CursorPage<UserDetail>>> {
			const params = new URLSearchParams()
			if (cursor) params.append("cursor", cursor.toString())
			params.append("limit", limit.toString())
			if (name?.trim()) params.append("name", name.trim())
			return client.request<ApiResponse<CursorPage<UserDetail>>>(`/users?${params.toString()}`)
		},

		getUser(userId: number): Promise<ApiResponse<UserDetail>> {
			return client.request<ApiResponse<UserDetail>>(`/users/${userId}`)
		},

		approveUser(userId: number, request: ApproveRequest): Promise<ApiResponse<UserDetail>> {
			return client.request<ApiResponse<UserDetail>>(`/users/${userId}/approve`, {
				method: "POST",
				body: JSON.stringify(request),
			})
		},

		updateUserAdmin(userId: number, request: UserUpdateRequest): Promise<ApiResponse<UserDetail>> {
			return client.request<ApiResponse<UserDetail>>(`/users/${userId}`, {
				method: "PATCH",
				body: JSON.stringify(request),
			})
		},

		deleteUser(userId: number): Promise<ApiResponse<null>> {
			return client.request<ApiResponse<null>>(`/users/${userId}`, {
				method: "DELETE",
			})
		},

		getUserAuditLog(userId: number): Promise<ApiResponse<AuditLogDetail[]>> {
			return client.request<ApiResponse<AuditLogDetail[]>>(`/users/${userId}/audit-log`)
		},

		getUserHistory(userId: number): Promise<ApiResponse<HistoryDetail[]>> {
			console.warn("getUserHistory() is deprecated. Use getUserAuditLog() instead.")
			return client.request<ApiResponse<HistoryDetail[]>>(`/users/${userId}/audit-log`)
		},

		getUserActivities(userId: number): Promise<ApiResponse<ActivityDetail[]>> {
			return client.request<ApiResponse<ActivityDetail[]>>(`/users/${userId}/activities`)
		},

		/** PR #36(agent/activity-history-management, 2026-07-26 기준 미머지) 이후 응답 스키마.
		 * 실제 활동과 승인 대기 중인 추가 요청을 통합해 ActivityHistoryItem[]로 반환한다. */
		getMyActivities(): Promise<ApiResponse<ActivityHistoryItem[]>> {
			return client.request<ApiResponse<ActivityHistoryItem[]>>("/users/me/activities")
		},

		createUserActivity(
			userId: number,
			request: ActivityCreateRequest,
		): Promise<ApiResponse<ActivityDetail>> {
			return client.request<ApiResponse<ActivityDetail>>(`/users/${userId}/activities`, {
				method: "POST",
				body: JSON.stringify(request),
			})
		},

		updateUserActivity(
			userId: number,
			activityId: number,
			request: ActivityUpdateRequest,
		): Promise<ApiResponse<ActivityDetail>> {
			return client.request<ApiResponse<ActivityDetail>>(
				`/users/${userId}/activities/${activityId}`,
				{
					method: "PATCH",
					body: JSON.stringify(request),
				},
			)
		},

		deleteUserActivity(userId: number, activityId: number): Promise<ApiResponse<null>> {
			return client.request<ApiResponse<null>>(`/users/${userId}/activities/${activityId}`, {
				method: "DELETE",
			})
		},

		/** GET /activities — 운영진 전용, 전체 회원 활동 통합 조회.
		 * PR #36(agent/activity-history-management, 2026-07-26 기준 미머지)에서 신규 추가. */
		getActivities(
			cursor?: number,
			limit = 20,
		): Promise<ApiResponse<CursorPage<ActivityHistoryAdminItem>>> {
			const params = new URLSearchParams()
			if (cursor) params.append("cursor", cursor.toString())
			params.append("limit", limit.toString())
			return client.request<ApiResponse<CursorPage<ActivityHistoryAdminItem>>>(
				`/activities?${params.toString()}`,
			)
		},
	}
}
