import type { ApiResponse } from "@/types/common"
import type { MyPageProfileUpdateRequest, UserDetail } from "@/types/user"
import type { ApiClient } from "./client"

export function createMypageApi(client: ApiClient) {
	return {
		uploadProfileImage(file: File): Promise<ApiResponse<UserDetail>> {
			const formData = new FormData()
			formData.append("file", file)

			return client.request<ApiResponse<UserDetail>>("/profile-image/upload", {
				method: "POST",
				body: formData,
			})
		},

		updateMyProfile(request: MyPageProfileUpdateRequest): Promise<ApiResponse<UserDetail>> {
			return client.request<ApiResponse<UserDetail>>("/users/me", {
				method: "PATCH",
				body: JSON.stringify(request),
			})
		},
	}
}
