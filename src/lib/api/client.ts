const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const API_BASE_URL =
	typeof window !== "undefined" && window.location.hostname === "localhost"
		? "/api/proxy"
		: EXTERNAL_API_URL

export class ApiClient {
	constructor(public readonly baseUrl: string) {}

	async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`
		const headers = new Headers(options.headers)

		if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
			headers.set("Content-Type", "application/json")
		}
		if (!headers.has("X-Requested-With")) {
			headers.set("X-Requested-With", "XMLHttpRequest")
		}

		const response = await fetch(url, {
			credentials: "include",
			...options,
			headers,
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`)
		}

		return response.json()
	}

	async requestBlob(endpoint: string, options: RequestInit = {}): Promise<Blob> {
		const url = `${this.baseUrl}${endpoint}`
		const response = await fetch(url, {
			credentials: "include",
			...options,
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`)
		}

		return response.blob()
	}
}
