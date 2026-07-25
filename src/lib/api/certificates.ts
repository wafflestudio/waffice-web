import type { SignatureDetail } from "@/types/certificate"
import type { ApiResponse } from "@/types/common"
import type { ApiClient } from "./client"

export function createCertificatesApi(client: ApiClient) {
	return {
		getMySignature(): Promise<ApiResponse<SignatureDetail | null>> {
			return client.request<ApiResponse<SignatureDetail | null>>("/certificates/signature/me")
		},

		upsertMySignature(file: File): Promise<ApiResponse<SignatureDetail>> {
			const formData = new FormData()
			formData.append("file", file)

			return client.request<ApiResponse<SignatureDetail>>("/certificates/signature/me", {
				method: "PUT",
				body: formData,
			})
		},
	}
}
