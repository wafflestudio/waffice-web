import type { ApiResponse, CursorPage } from "@/types/common"
import type { HistoryDetail } from "@/types/history"
import type { ApproveRequest, UserDetail, UserUpdateRequest } from "@/types/user"
import type { ApiClient } from "./client"

export function createUsersApi(client: ApiClient) {
	return {
		getPendingUsers(): Promise<ApiResponse<UserDetail[]>> {
			return client.request<ApiResponse<UserDetail[]>>("/users/pending")
		},

		getUsers(cursor?: number, limit = 20): Promise<ApiResponse<CursorPage<UserDetail>>> {
			const params = new URLSearchParams()
			if (cursor) params.append("cursor", cursor.toString())
			params.append("limit", limit.toString())
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

		getUserHistory(userId: number): Promise<ApiResponse<HistoryDetail[]>> {
			return client.request<ApiResponse<HistoryDetail[]>>(`/users/${userId}/history`)
		},
	}
}
