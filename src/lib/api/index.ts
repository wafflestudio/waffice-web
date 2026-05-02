import { API_BASE_URL, ApiClient } from "./client"
import { createMypageApi } from "./mypage"
import { createProjectsApi } from "./projects"
import { createUsersApi } from "./users"

const client = new ApiClient(API_BASE_URL)

export const apiClient = {
	...createUsersApi(client),
	...createMypageApi(client),
	...createProjectsApi(client),
}
