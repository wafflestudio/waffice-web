import type {
	AccountBalance,
	ExpenseClaim,
	ExpenseClaimCreate,
	ExpenseClaimUpdate,
	Member,
	MemberCreate,
	MemberUpdate,
	Project,
	ProjectCreate,
	ProjectUpdate,
	Transaction,
	TransactionCreate,
	TransactionUpdate,
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
		const response = await fetch(url, {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		})

		if (!response.ok) {
			throw new Error(`API Error: ${response.status} ${response.statusText}`)
		}

		return response.json()
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

	// Expense Claim API (TODO: Not yet in OpenAPI spec - using mock/placeholder endpoints)
	async getExpenseClaims(skip = 0, limit = 100): Promise<ExpenseClaim[]> {
		console.warn("getExpenseClaims: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<ExpenseClaim[]>(`/expense-claims?skip=${skip}&limit=${limit}`)
	}

	async getExpenseClaim(id: number): Promise<ExpenseClaim> {
		console.warn("getExpenseClaim: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<ExpenseClaim>(`/expense-claims/${id}`)
	}

	async createExpenseClaim(claim: ExpenseClaimCreate, memberId: number): Promise<ExpenseClaim> {
		console.warn("createExpenseClaim: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<ExpenseClaim>(`/expense-claims?member_id=${memberId}`, {
			method: "POST",
			body: JSON.stringify(claim),
		})
	}

	async updateExpenseClaim(id: number, claim: ExpenseClaimUpdate): Promise<ExpenseClaim> {
		console.warn("updateExpenseClaim: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<ExpenseClaim>(`/expense-claims/${id}`, {
			method: "PUT",
			body: JSON.stringify(claim),
		})
	}

	async approveExpenseClaim(id: number, reviewerId: number, reviewNotes?: string): Promise<void> {
		console.warn("approveExpenseClaim: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<void>(`/expense-claims/${id}/approve`, {
			method: "PUT",
			body: JSON.stringify({ reviewer_id: reviewerId, review_notes: reviewNotes }),
		})
	}

	async rejectExpenseClaim(id: number, reviewerId: number, reviewNotes?: string): Promise<void> {
		console.warn("rejectExpenseClaim: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<void>(`/expense-claims/${id}/reject`, {
			method: "PUT",
			body: JSON.stringify({ reviewer_id: reviewerId, review_notes: reviewNotes }),
		})
	}

	async deleteExpenseClaim(id: number): Promise<void> {
		console.warn("deleteExpenseClaim: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<void>(`/expense-claims/${id}`, {
			method: "DELETE",
		})
	}

	// Transaction API (TODO: Not yet in OpenAPI spec - using mock/placeholder endpoints)
	async getTransactions(skip = 0, limit = 100): Promise<Transaction[]> {
		console.warn("getTransactions: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<Transaction[]>(`/transactions?skip=${skip}&limit=${limit}`)
	}

	async getTransaction(id: number): Promise<Transaction> {
		console.warn("getTransaction: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<Transaction>(`/transactions/${id}`)
	}

	async createTransaction(transaction: TransactionCreate): Promise<Transaction> {
		console.warn("createTransaction: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<Transaction>("/transactions", {
			method: "POST",
			body: JSON.stringify(transaction),
		})
	}

	async updateTransaction(id: number, transaction: TransactionUpdate): Promise<Transaction> {
		console.warn("updateTransaction: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<Transaction>(`/transactions/${id}`, {
			method: "PUT",
			body: JSON.stringify(transaction),
		})
	}

	async deleteTransaction(id: number): Promise<void> {
		console.warn("deleteTransaction: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<void>(`/transactions/${id}`, {
			method: "DELETE",
		})
	}

	async getAccountBalance(): Promise<AccountBalance> {
		console.warn("getAccountBalance: Not in OpenAPI spec yet - using mock endpoint")
		return this.request<AccountBalance>("/transactions/summary/balance")
	}
}

export const apiClient = new ApiClient(API_BASE_URL)
