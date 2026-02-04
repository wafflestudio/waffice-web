import type {
	AuthResponse,
	DevSigninRequest,
	GoogleTokenRequest,
	GoogleTokenResponse,
	SigninRequest,
	SignupRequest,
} from "@/types"

const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
// Use proxy in development to avoid CORS/cookie issues
const API_BASE_URL =
	typeof window !== "undefined" && window.location.hostname === "localhost"
		? "/api/proxy"
		: EXTERNAL_API_URL

class AuthClient {
	private baseUrl: string
	private externalUrl: string

	constructor(baseUrl: string, externalUrl: string) {
		this.baseUrl = baseUrl
		this.externalUrl = externalUrl
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
			const errorBody = await response.text()
			throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`)
		}

		return response.json()
	}

	// Google OAuth URL needs the external URL (browser redirect, not fetch)
	getGoogleAuthUrl(redirectUri: string): string {
		const params = new URLSearchParams({ redirect_uri: redirectUri })
		return `${this.externalUrl}/auth/google?${params.toString()}`
	}

	async exchangeCodeForToken(request: GoogleTokenRequest): Promise<GoogleTokenResponse> {
		return this.request<GoogleTokenResponse>("/auth/google/token", {
			method: "POST",
			body: JSON.stringify(request),
		})
	}

	async signin(request: SigninRequest): Promise<AuthResponse> {
		return this.request<AuthResponse>("/auth/signin", {
			method: "POST",
			body: JSON.stringify(request),
		})
	}

	async signup(request: SignupRequest): Promise<AuthResponse> {
		return this.request<AuthResponse>("/auth/signup", {
			method: "POST",
			body: JSON.stringify(request),
		})
	}

	async devSignin(request: DevSigninRequest): Promise<AuthResponse> {
		return this.request<AuthResponse>("/auth/signin-dev", {
			method: "POST",
			body: JSON.stringify(request),
		})
	}

	async getMe(): Promise<AuthResponse> {
		return this.request<AuthResponse>("/auth/me")
	}

	async logout(): Promise<void> {
		await this.request<{ ok: boolean }>("/auth/logout", { method: "POST" })
	}
}

export const authClient = new AuthClient(API_BASE_URL, EXTERNAL_API_URL)
