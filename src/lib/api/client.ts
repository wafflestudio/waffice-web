import type { RowValidationError } from "@/types"

const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const API_BASE_URL =
	typeof window !== "undefined" && window.location.hostname === "localhost"
		? "/api/proxy"
		: EXTERNAL_API_URL

/**
 * API 에러 응답의 `data.errors` (행 단위 검증 오류 배열)를 보존하는 Error.
 * 명부 업로드처럼 하나의 요청이 여러 오류를 함께 반환하는 엔드포인트에서,
 * 상위 message 문자열 하나로는 개별 오류를 구분해 보여줄 수 없어 필요함.
 */
export class ApiError extends Error {
	rowErrors?: RowValidationError[]

	constructor(message: string, rowErrors?: RowValidationError[]) {
		super(message)
		this.name = "ApiError"
		this.rowErrors = rowErrors
	}
}

const extractRowErrors = (errorData: unknown): RowValidationError[] | undefined => {
	const errors = (errorData as { data?: { errors?: unknown } } | undefined)?.data?.errors
	return Array.isArray(errors) ? (errors as RowValidationError[]) : undefined
}

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
			throw new ApiError(
				errorData.message || `API Error: ${response.status} ${response.statusText}`,
				extractRowErrors(errorData),
			)
		}

		return response.json()
	}

	async requestBlob(endpoint: string, options: RequestInit = {}): Promise<Blob> {
		const url = `${this.baseUrl}${endpoint}`
		const headers = new Headers(options.headers)

		if (!(options.body instanceof FormData) && options.body && !headers.has("Content-Type")) {
			headers.set("Content-Type", "application/json")
		}

		const response = await fetch(url, {
			credentials: "include",
			...options,
			headers,
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new ApiError(
				errorData.message || `API Error: ${response.status} ${response.statusText}`,
				extractRowErrors(errorData),
			)
		}

		return response.blob()
	}
}
