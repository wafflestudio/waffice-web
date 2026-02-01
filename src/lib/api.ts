import type {
	ApiResponse,
	AuthResult,
	AuthStatus,
	GoogleTokenRequest,
	Member,
	MemberCreate,
	MemberUpdate,
	Project,
	ProjectCreate,
	ProjectUpdate,
	SigninRequest,
	SignupRequest,
	User,
	UserHistory,
	UserHistoryCreate,
	UserPendingCreate,
} from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class ApiClient {
	private baseUrl: string

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl
	}

	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`

		let response: Response
		try {
			response = await fetch(url, {
				headers: {
					"Content-Type": "application/json",
					"X-Requested-With": "XMLHttpRequest", // Required for CSRF protection
					...options.headers,
				},
				credentials: "include", // Include cookies for auth
				...options,
			})
		} catch (err) {
			// Network error or CORS issue
			console.error("Network error:", err)
			const errorMsg = err instanceof Error ? err.message : "Unknown error"
			throw new Error(
				`네트워크 오류: 서버에 연결할 수 없습니다. CORS 설정을 확인해주세요. (${errorMsg})`,
			)
		}

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`)
		}

		return response.json()
	}

	// ============================================================================
	// Auth API
	// ============================================================================

	/**
	 * Initiates Google OAuth login by redirecting to Google's consent page
	 * @param redirectUri - The callback URL where Google will send the authorization code
	 */
	getGoogleAuthUrl(redirectUri: string): string {
		const params = new URLSearchParams({ redirect_uri: redirectUri })
		return `${this.baseUrl}/auth/google?${params.toString()}`
	}

	/**
	 * Exchanges Google authorization code for auth_token
	 * @param request - Contains the authorization code and redirect_uri
	 * @returns AuthStatus with status ("new" | "pending" | "active") and auth_token
	 */
	async exchangeGoogleToken(request: GoogleTokenRequest): Promise<ApiResponse<AuthStatus>> {
		return this.request<ApiResponse<AuthStatus>>("/auth/google/token", {
			method: "POST",
			body: JSON.stringify(request),
		})
	}

	/**
	 * Sign in existing user with auth_token (for status: "active")
	 * @param request - Contains the auth_token
	 * @returns AuthResult with user details and sets HttpOnly cookie
	 */
	async signin(request: SigninRequest): Promise<ApiResponse<AuthResult>> {
		return this.request<ApiResponse<AuthResult>>("/auth/signin", {
			method: "POST",
			body: JSON.stringify(request),
		})
	}

	/**
	 * Complete signup for new user (for status: "new")
	 * @param request - Contains auth_token and user details
	 * @returns AuthResult with user details and sets HttpOnly cookie
	 */
	async signup(request: SignupRequest): Promise<ApiResponse<AuthResult>> {
		return this.request<ApiResponse<AuthResult>>("/auth/signup", {
			method: "POST",
			body: JSON.stringify(request),
		})
	}

	/**
	 * Get current authentication status
	 * @returns Current user's profile and status
	 */
	async getAuthStatus(): Promise<ApiResponse<AuthResult>> {
		return this.request<ApiResponse<AuthResult>>("/auth/me")
	}

	/**
	 * Logout current user
	 */
	async logout(): Promise<ApiResponse<null>> {
		return this.request<ApiResponse<null>>("/auth/logout", {
			method: "POST",
		})
	}

	// User API (from OpenAPI spec)
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
