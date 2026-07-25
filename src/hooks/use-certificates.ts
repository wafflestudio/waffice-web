import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { ApiResponse, SignatureDetail } from "@/types"

export const certificateQueryKeys = {
	all: ["certificates"] as const,
	mySignature: () => [...certificateQueryKeys.all, "my-signature"] as const,
}

function getResponseOrThrow<T>(response: ApiResponse<T>, fallbackMessage: string): T {
	if (!response.ok) {
		throw new Error(response.message || fallbackMessage)
	}

	return response.data as T
}

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
