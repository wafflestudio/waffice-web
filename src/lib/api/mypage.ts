import type { ApiResponse } from "@/types/common"
import type { MyPageProfileUpdateRequest, UserDetail } from "@/types/user"
import type { ApiClient } from "./client"

export function createMypageApi(client: ApiClient) {
	return {
		updateMyProfile(request: MyPageProfileUpdateRequest): Promise<ApiResponse<UserDetail>> {
			return client.request<ApiResponse<UserDetail>>("/users/me", {
				method: "PATCH",
				body: JSON.stringify(request),
			})
		},
	}
}
