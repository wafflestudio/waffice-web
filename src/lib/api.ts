import type {
	ApiResponse,
	ApproveRequest,
	CursorPage,
	HistoryDetail,
	Member,
	MemberCreate,
	MemberUpdate,
	Project,
	ProjectCreate,
	ProjectUpdate,
	User,
	UserDetail,
	UserHistory,
	UserHistoryCreate,
	UserPendingCreate,
	UserUpdateRequest,
} from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class ApiClient {
	private baseUrl: string

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl
	}

	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`
		const response = await fetch(url, {
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				"X-Requested-With": "XMLHttpRequest",
				...options.headers,
			},
			...options,
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`)
		}

		return response.json()
	}

	// ============================================================================
	// User Management API (Admin)
	// ============================================================================

	/**
	 * Get list of pending users awaiting approval (Admin only)
	 */
	async getPendingUsers(): Promise<ApiResponse<UserDetail[]>> {
		return this.request<ApiResponse<UserDetail[]>>("/users/pending")
	}

	/**
	 * Get all users with pagination (Admin only)
	 */
	async getUsers(cursor?: number, limit = 20): Promise<ApiResponse<CursorPage<UserDetail>>> {
		const params = new URLSearchParams()
		if (cursor) params.append("cursor", cursor.toString())
		params.append("limit", limit.toString())
		return this.request<ApiResponse<CursorPage<UserDetail>>>(`/users?${params.toString()}`)
	}

	/**
	 * Get specific user details (Admin only)
	 */
	async getUser(userId: number): Promise<ApiResponse<UserDetail>> {
		return this.request<ApiResponse<UserDetail>>(`/users/${userId}`)
	}

	/**
	 * Approve a pending user and set their qualification level (Admin only)
	 */
	async approveUser(userId: number, request: ApproveRequest): Promise<ApiResponse<UserDetail>> {
		return this.request<ApiResponse<UserDetail>>(`/users/${userId}/approve`, {
			method: "POST",
			body: JSON.stringify(request),
		})
	}

	/**
	 * Update user information (Admin only)
	 */
	async updateUserAdmin(
		userId: number,
		request: UserUpdateRequest,
	): Promise<ApiResponse<UserDetail>> {
		return this.request<ApiResponse<UserDetail>>(`/users/${userId}`, {
			method: "PATCH",
			body: JSON.stringify(request),
		})
	}

	/**
	 * Delete user (soft delete, Admin only)
	 */
	async deleteUser(userId: number): Promise<ApiResponse<null>> {
		return this.request<ApiResponse<null>>(`/users/${userId}`, {
			method: "DELETE",
		})
	}

	/**
	 * Get user's activity history (Admin only)
	 */
	async getUserHistory(userId: number): Promise<ApiResponse<HistoryDetail[]>> {
		return this.request<ApiResponse<HistoryDetail[]>>(`/users/${userId}/history`)
	}

	// ============================================================================
	// Legacy User API (Deprecated - use above methods instead)
	// ============================================================================
	async createPendingUser(user: UserPendingCreate): Promise<void> {
		return this.request<void>("/api/user/create", {
			method: "POST",
			body: JSON.stringify(user),
		})
	}

	async enrollUser(payload: Record<string, unknown>): Promise<void> {
		return this.request<void>("/api/user/enroll", {
			method: "POST",
			body: JSON.stringify(payload),
		})
	}

	async denyUser(payload: Record<string, unknown>): Promise<void> {
		return this.request<void>("/api/user/deny", {
			method: "POST",
			body: JSON.stringify(payload),
		})
	}

	async getUserInfo(userid: number): Promise<User> {
		return this.request<User>(`/api/user/info?userid=${userid}`)
	}

	async getAllUsers(): Promise<User[]> {
		return this.request<User[]>("/api/user/all")
	}

	async updateUser(payload: Record<string, unknown>): Promise<void> {
		return this.request<void>("/api/user/update", {
			method: "POST",
			body: JSON.stringify(payload),
		})
	}

	async userAccess(payload: Record<string, unknown>): Promise<void> {
		return this.request<void>("/api/user/access", {
			method: "POST",
			body: JSON.stringify(payload),
		})
	}

	// User History API (from OpenAPI spec)
	async createUserHistory(userHistory: UserHistoryCreate): Promise<void> {
		return this.request<void>("/api/userhist/create", {
			method: "POST",
			body: JSON.stringify(userHistory),
		})
	}

	async getUserHistoryInfo(id: number): Promise<UserHistory> {
		return this.request<UserHistory>(`/api/userhist/info?id=${id}`)
	}

	async getAllUserHistories(): Promise<UserHistory[]> {
		return this.request<UserHistory[]>("/api/userhist/all")
	}

	// Legacy Member API (TODO: Replace with proper OpenAPI endpoints when available)
	async getMembers(skip = 0, limit = 100): Promise<Member[]> {
		// TODO: This endpoint is not yet in OpenAPI spec - using mock/placeholder
		console.warn("getMembers: Using legacy endpoint - not in OpenAPI spec yet")
		return this.request<Member[]>(`/members?skip=${skip}&limit=${limit}`)
	}

	async getMember(id: number): Promise<Member> {
		// TODO: This endpoint is not yet in OpenAPI spec - using mock/placeholder
		console.warn("getMember: Using legacy endpoint - not in OpenAPI spec yet")
		return this.request<Member>(`/members/${id}`)
	}

	async createMember(member: MemberCreate): Promise<Member> {
		// TODO: This endpoint is not yet in OpenAPI spec - using mock/placeholder
		console.warn("createMember: Using legacy endpoint - not in OpenAPI spec yet")
		return this.request<Member>("/members", {
			method: "POST",
			body: JSON.stringify(member),
		})
	}

	async updateMember(id: number, member: MemberUpdate): Promise<Member> {
		// TODO: This endpoint is not yet in OpenAPI spec - using mock/placeholder
		console.warn("updateMember: Using legacy endpoint - not in OpenAPI spec yet")
		return this.request<Member>(`/members/${id}`, {
			method: "PUT",
			body: JSON.stringify(member),
		})
	}

	async deleteMember(id: number): Promise<void> {
		// TODO: This endpoint is not yet in OpenAPI spec - using mock/placeholder
		console.warn("deleteMember: Using legacy endpoint - not in OpenAPI spec yet")
		return this.request<void>(`/members/${id}`, {
			method: "DELETE",
		})
	}

	// Project API (TODO: Not yet in OpenAPI spec - using mock/placeholder endpoints)
	async getProjects(skip = 0, limit = 100): Promise<Project[]> {
		console.warn("getProjects: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<Project[]>(`/projects?skip=${skip}&limit=${limit}`)
	}

	async getProject(id: number): Promise<Project> {
		console.warn("getProject: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<Project>(`/projects/${id}`)
	}

	async createProject(project: ProjectCreate): Promise<Project> {
		console.warn("createProject: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<Project>("/projects", {
			method: "POST",
			body: JSON.stringify(project),
		})
	}

	async updateProject(id: number, project: ProjectUpdate): Promise<Project> {
		console.warn("updateProject: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<Project>(`/projects/${id}`, {
			method: "PUT",
			body: JSON.stringify(project),
		})
	}

	async deleteProject(id: number): Promise<void> {
		console.warn("deleteProject: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<void>(`/projects/${id}`, {
			method: "DELETE",
		})
	}
}

export const apiClient = new ApiClient(API_BASE_URL)
