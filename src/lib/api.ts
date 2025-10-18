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

	// Member API
	async getMembers(skip = 0, limit = 100): Promise<Member[]> {
		return this.request<Member[]>(`/members?skip=${skip}&limit=${limit}`)
	}

	async getMember(id: number): Promise<Member> {
		return this.request<Member>(`/members/${id}`)
	}

	async createMember(member: MemberCreate): Promise<Member> {
		return this.request<Member>("/members", {
			method: "POST",
			body: JSON.stringify(member),
		})
	}

	async updateMember(id: number, member: MemberUpdate): Promise<Member> {
		return this.request<Member>(`/members/${id}`, {
			method: "PUT",
			body: JSON.stringify(member),
		})
	}

	async deleteMember(id: number): Promise<void> {
		return this.request<void>(`/members/${id}`, {
			method: "DELETE",
		})
	}

	// Project API
	async getProjects(skip = 0, limit = 100): Promise<Project[]> {
		return this.request<Project[]>(`/projects?skip=${skip}&limit=${limit}`)
	}

	async getProject(id: number): Promise<Project> {
		return this.request<Project>(`/projects/${id}`)
	}

	async createProject(project: ProjectCreate): Promise<Project> {
		return this.request<Project>("/projects", {
			method: "POST",
			body: JSON.stringify(project),
		})
	}

	async updateProject(id: number, project: ProjectUpdate): Promise<Project> {
		return this.request<Project>(`/projects/${id}`, {
			method: "PUT",
			body: JSON.stringify(project),
		})
	}

	async deleteProject(id: number): Promise<void> {
		return this.request<void>(`/projects/${id}`, {
			method: "DELETE",
		})
	}

	// Expense Claim API
	async getExpenseClaims(skip = 0, limit = 100): Promise<ExpenseClaim[]> {
		return this.request<ExpenseClaim[]>(`/expense-claims?skip=${skip}&limit=${limit}`)
	}

	async getExpenseClaim(id: number): Promise<ExpenseClaim> {
		return this.request<ExpenseClaim>(`/expense-claims/${id}`)
	}

	async createExpenseClaim(claim: ExpenseClaimCreate, memberId: number): Promise<ExpenseClaim> {
		return this.request<ExpenseClaim>(`/expense-claims?member_id=${memberId}`, {
			method: "POST",
			body: JSON.stringify(claim),
		})
	}

	async updateExpenseClaim(id: number, claim: ExpenseClaimUpdate): Promise<ExpenseClaim> {
		return this.request<ExpenseClaim>(`/expense-claims/${id}`, {
			method: "PUT",
			body: JSON.stringify(claim),
		})
	}

	async approveExpenseClaim(id: number, reviewerId: number, reviewNotes?: string): Promise<void> {
		return this.request<void>(`/expense-claims/${id}/approve`, {
			method: "PUT",
			body: JSON.stringify({ reviewer_id: reviewerId, review_notes: reviewNotes }),
		})
	}

	async rejectExpenseClaim(id: number, reviewerId: number, reviewNotes?: string): Promise<void> {
		return this.request<void>(`/expense-claims/${id}/reject`, {
			method: "PUT",
			body: JSON.stringify({ reviewer_id: reviewerId, review_notes: reviewNotes }),
		})
	}

	async deleteExpenseClaim(id: number): Promise<void> {
		return this.request<void>(`/expense-claims/${id}`, {
			method: "DELETE",
		})
	}

	// Transaction API
	async getTransactions(skip = 0, limit = 100): Promise<Transaction[]> {
		return this.request<Transaction[]>(`/transactions?skip=${skip}&limit=${limit}`)
	}

	async getTransaction(id: number): Promise<Transaction> {
		return this.request<Transaction>(`/transactions/${id}`)
	}

	async createTransaction(transaction: TransactionCreate): Promise<Transaction> {
		return this.request<Transaction>("/transactions", {
			method: "POST",
			body: JSON.stringify(transaction),
		})
	}

	async updateTransaction(id: number, transaction: TransactionUpdate): Promise<Transaction> {
		return this.request<Transaction>(`/transactions/${id}`, {
			method: "PUT",
			body: JSON.stringify(transaction),
		})
	}

	async deleteTransaction(id: number): Promise<void> {
		return this.request<void>(`/transactions/${id}`, {
			method: "DELETE",
		})
	}

	async getAccountBalance(): Promise<AccountBalance> {
		return this.request<AccountBalance>("/transactions/summary/balance")
	}
}

export const apiClient = new ApiClient(API_BASE_URL)
