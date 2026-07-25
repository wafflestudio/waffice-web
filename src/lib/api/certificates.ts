import type {
	CertificateDetail,
	CertificateOptions,
	CertificateSummary,
	DraftCertificateCreate,
	SignatureDetail,
} from "@/types/certificate"
import type { ApiResponse, CursorPage } from "@/types/common"
import type { ApiClient } from "./client"

export function createCertificatesApi(client: ApiClient) {
	return {
		// === President: 서명 등록/조회 (PR #17) ===
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

		// === Member: 미리보기/발급/내 이력/다운로드 (PR #18, #20) ===
		previewCertificate(options: CertificateOptions): Promise<Blob> {
			return client.requestBlob("/certificates/preview", {
				method: "POST",
				body: JSON.stringify(options),
			})
		},

		issueCertificate(options: CertificateOptions): Promise<ApiResponse<CertificateDetail>> {
			return client.request<ApiResponse<CertificateDetail>>("/certificates", {
				method: "POST",
				body: JSON.stringify(options),
			})
		},

		listMyCertificates(
			cursor?: string,
			limit = 20,
		): Promise<ApiResponse<CursorPage<CertificateSummary>>> {
			const params = new URLSearchParams()
			if (cursor) params.append("cursor", cursor)
			params.append("limit", limit.toString())
			return client.request<ApiResponse<CursorPage<CertificateSummary>>>(
				`/certificates/me?${params.toString()}`,
			)
		},

		downloadCertificate(certificateId: number): Promise<Blob> {
			return client.requestBlob(`/certificates/${certificateId}/download`)
		},

		// === Staff/admin: 초안 생성/미리보기 (PR #18) ===
		previewDraftCertificate(request: DraftCertificateCreate): Promise<Blob> {
			return client.requestBlob("/certificates/drafts/preview", {
				method: "POST",
				body: JSON.stringify(request),
			})
		},

		createDraftCertificate(
			request: DraftCertificateCreate,
		): Promise<ApiResponse<CertificateDetail>> {
			return client.request<ApiResponse<CertificateDetail>>("/certificates/drafts", {
				method: "POST",
				body: JSON.stringify(request),
			})
		},

		// === President: 원본 등록 (PR #21) ===
		registerCertificateOriginal(
			certificateId: number,
			file: File,
		): Promise<ApiResponse<CertificateDetail>> {
			const formData = new FormData()
			formData.append("file", file)

			return client.request<ApiResponse<CertificateDetail>>(
				`/certificates/${certificateId}/original`,
				{
					method: "POST",
					body: formData,
				},
			)
		},
	}
}
