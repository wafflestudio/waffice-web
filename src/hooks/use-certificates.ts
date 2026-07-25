import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type {
	ApiResponse,
	CertificateOptions,
	CertificateSummary,
	CursorPage,
	DraftCertificateCreate,
	SignatureDetail,
} from "@/types"

export const certificateQueryKeys = {
	all: ["certificates"] as const,
	mySignature: () => [...certificateQueryKeys.all, "my-signature"] as const,
	myList: (cursor?: string, limit = 20) =>
		[...certificateQueryKeys.all, "my-list", cursor, limit] as const,
}

function getResponseOrThrow<T>(response: ApiResponse<T>, fallbackMessage: string): T {
	if (!response.ok) {
		throw new Error(response.message || fallbackMessage)
	}

	return response.data as T
}

// === President: 서명 등록/조회 (PR #17) ===

/** GET /certificates/signature/me — 서명이 없으면 data: null(정상 응답)이 온다. */
export function useMySignature() {
	return useQuery<SignatureDetail | null, Error>({
		queryKey: certificateQueryKeys.mySignature(),
		queryFn: async () =>
			getResponseOrThrow(await apiClient.getMySignature(), "서명 정보를 불러오는데 실패했습니다."),
	})
}

export function useUpsertMySignature() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (file: File) =>
			getResponseOrThrow(await apiClient.upsertMySignature(file), "서명 등록에 실패했습니다."),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: certificateQueryKeys.mySignature() })
		},
	})
}

// === Member: 미리보기/발급/내 이력/다운로드 (PR #18, #20) ===

/** POST /certificates/preview — 저장되지 않는 PDF 미리보기(mutation으로 노출: 클릭 시 실행). */
export function usePreviewCertificate() {
	return useMutation({
		mutationFn: async (options: CertificateOptions) => apiClient.previewCertificate(options),
	})
}

export function useIssueCertificate() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (options: CertificateOptions) =>
			getResponseOrThrow(
				await apiClient.issueCertificate(options),
				"활동증명서 발급에 실패했습니다.",
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: certificateQueryKeys.all })
		},
	})
}

export function useMyCertificates(cursor?: string, limit = 20) {
	return useQuery<CursorPage<CertificateSummary>, Error>({
		queryKey: certificateQueryKeys.myList(cursor, limit),
		queryFn: async () =>
			getResponseOrThrow(
				await apiClient.listMyCertificates(cursor, limit),
				"활동증명서 이력을 불러오는데 실패했습니다.",
			),
	})
}

export function useDownloadCertificate() {
	return useMutation({
		mutationFn: async (certificateId: number) => apiClient.downloadCertificate(certificateId),
	})
}

// === Staff/admin: 초안 생성/미리보기 (PR #18) ===

export function usePreviewDraftCertificate() {
	return useMutation({
		mutationFn: async (request: DraftCertificateCreate) =>
			apiClient.previewDraftCertificate(request),
	})
}

export function useCreateDraftCertificate() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (request: DraftCertificateCreate) =>
			getResponseOrThrow(
				await apiClient.createDraftCertificate(request),
				"활동증명서 초안 생성에 실패했습니다.",
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: certificateQueryKeys.all })
		},
	})
}

// === President: 원본 등록 (PR #21) ===

export function useRegisterCertificateOriginal() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ certificateId, file }: { certificateId: number; file: File }) =>
			getResponseOrThrow(
				await apiClient.registerCertificateOriginal(certificateId, file),
				"활동증명서 원본 등록에 실패했습니다.",
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: certificateQueryKeys.all })
		},
	})
}
