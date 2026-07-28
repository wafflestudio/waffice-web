import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type {
	ApiResponse,
	ApprovalRejectRequest,
	ApprovalRequestCreateRequest,
	ApprovalRequestDetail,
	ApprovalRequestListItem,
	ApprovalRequestUpdateRequest,
	ApprovalReviewRequest,
	ApprovalReviewWithEditsRequest,
	RequestCursorPage,
	RequestKindFilter,
	RequestScope,
	RequestStatusFilter,
} from "@/types"

export const requestQueryKeys = {
	all: ["requests"] as const,
	list: (options: {
		scope?: RequestScope
		status?: RequestStatusFilter
		requestKind?: RequestKindFilter
		cursor?: string
		limit?: number
	}) => [...requestQueryKeys.all, "list", options] as const,
	detail: (requestId: number) => [...requestQueryKeys.all, "detail", requestId] as const,
}

function getResponseOrThrow<T>(response: ApiResponse<T>, fallbackMessage: string): T {
	if (!response.ok) {
		throw new Error(response.message || fallbackMessage)
	}

	return response.data as T
}

interface UseRequestsOptions {
	scope?: RequestScope
	status?: RequestStatusFilter
	requestKind?: RequestKindFilter
	activityId?: number
	cursor?: string
	limit?: number
	enabled?: boolean
}

/** GET /requests — 기본값은 scope=received&status=pending (LNB "나에게 온 요청"과 동일). */
export function useRequests({ enabled = true, ...options }: UseRequestsOptions = {}) {
	return useQuery<RequestCursorPage<ApprovalRequestListItem>, Error>({
		queryKey: requestQueryKeys.list(options),
		queryFn: async () =>
			getResponseOrThrow(
				await apiClient.listRequests(options),
				"요청 목록을 불러오는데 실패했습니다.",
			),
		enabled,
	})
}

export function useRequestDetail(requestId: number | null) {
	return useQuery<ApprovalRequestDetail, Error>({
		queryKey:
			requestId == null
				? [...requestQueryKeys.all, "detail", null]
				: requestQueryKeys.detail(requestId),
		queryFn: async () => {
			if (requestId == null) throw new Error("요청 ID가 없습니다.")
			return getResponseOrThrow(
				await apiClient.getRequest(requestId),
				"요청 상세 정보를 불러오는데 실패했습니다.",
			)
		},
		enabled: requestId != null,
	})
}

export function useCreateRequest() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (request: ApprovalRequestCreateRequest) =>
			getResponseOrThrow(await apiClient.createRequest(request), "요청 생성에 실패했습니다."),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: requestQueryKeys.all })
		},
	})
}

export function useUpdateRequest() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			requestId,
			data,
		}: {
			requestId: number
			data: ApprovalRequestUpdateRequest
		}) =>
			getResponseOrThrow(
				await apiClient.updateRequest(requestId, data),
				"요청 수정에 실패했습니다.",
			),
		onSuccess: (_request, variables) => {
			queryClient.invalidateQueries({ queryKey: requestQueryKeys.all })
			queryClient.invalidateQueries({ queryKey: requestQueryKeys.detail(variables.requestId) })
		},
	})
}

export function useDeleteRequest() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (requestId: number) =>
			getResponseOrThrow(await apiClient.deleteRequest(requestId), "요청 삭제에 실패했습니다."),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: requestQueryKeys.all })
		},
	})
}

export function useApproveRequest() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ requestId, data }: { requestId: number; data?: ApprovalReviewRequest }) =>
			getResponseOrThrow(
				await apiClient.approveRequest(requestId, data),
				"요청 승인에 실패했습니다.",
			),
		onSuccess: (_request, variables) => {
			queryClient.invalidateQueries({ queryKey: requestQueryKeys.all })
			queryClient.invalidateQueries({ queryKey: requestQueryKeys.detail(variables.requestId) })
		},
	})
}

export function useApproveRequestWithEdits() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			requestId,
			data,
		}: {
			requestId: number
			data: ApprovalReviewWithEditsRequest
		}) =>
			getResponseOrThrow(
				await apiClient.approveRequestWithEdits(requestId, data),
				"요청 승인에 실패했습니다.",
			),
		onSuccess: (_request, variables) => {
			queryClient.invalidateQueries({ queryKey: requestQueryKeys.all })
			queryClient.invalidateQueries({ queryKey: requestQueryKeys.detail(variables.requestId) })
		},
	})
}

export function useRejectRequest() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ requestId, data }: { requestId: number; data: ApprovalRejectRequest }) =>
			getResponseOrThrow(
				await apiClient.rejectRequest(requestId, data),
				"요청 거부에 실패했습니다.",
			),
		onSuccess: (_request, variables) => {
			queryClient.invalidateQueries({ queryKey: requestQueryKeys.all })
			queryClient.invalidateQueries({ queryKey: requestQueryKeys.detail(variables.requestId) })
		},
	})
}
