const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const API_BASE_URL =
	typeof window !== "undefined" && window.location.hostname === "localhost"
		? "/api/proxy"
		: EXTERNAL_API_URL

export class ApiClient {
	constructor(public readonly baseUrl: string) {}

	async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
}
