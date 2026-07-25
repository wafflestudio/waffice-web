import type { ApiResponse, CursorPage } from "@/types/common"
import type {
	ApprovalRejectRequest,
	ApprovalRequestCreateRequest,
	ApprovalRequestDetail,
	ApprovalRequestListItem,
	ApprovalRequestUpdateRequest,
	ApprovalReviewRequest,
	ApprovalReviewWithEditsRequest,
	RequestKindFilter,
	RequestScope,
	RequestStatusFilter,
} from "@/types/request"
import type { ApiClient } from "./client"

export function createRequestsApi(client: ApiClient) {
	return {
		createRequest(
			request: ApprovalRequestCreateRequest,
		): Promise<ApiResponse<ApprovalRequestDetail>> {
			return client.request<ApiResponse<ApprovalRequestDetail>>("/requests", {
				method: "POST",
				body: JSON.stringify(request),
			})
		},

		listRequests(options: {
			scope?: RequestScope
			status?: RequestStatusFilter
			requestKind?: RequestKindFilter
			/** PR #36(2026-07-26 기준 미머지) 이후 지원되는 필터. 머지 전에는 백엔드가 무시한다. */
			activityId?: number
			cursor?: number
			limit?: number
		}): Promise<ApiResponse<CursorPage<ApprovalRequestListItem>>> {
			const { scope, status, requestKind, activityId, cursor, limit = 20 } = options
			const params = new URLSearchParams()
			if (scope) params.append("scope", scope)
			if (status) params.append("status", status)
			if (requestKind) params.append("request_kind", requestKind)
			if (activityId != null) params.append("activity_id", activityId.toString())
			if (cursor) params.append("cursor", cursor.toString())
			params.append("limit", limit.toString())
			return client.request<ApiResponse<CursorPage<ApprovalRequestListItem>>>(
				`/requests?${params.toString()}`,
			)
		},

		getRequest(requestId: number): Promise<ApiResponse<ApprovalRequestDetail>> {
			return client.request<ApiResponse<ApprovalRequestDetail>>(`/requests/${requestId}`)
		},

		updateRequest(
			requestId: number,
			request: ApprovalRequestUpdateRequest,
		): Promise<ApiResponse<ApprovalRequestDetail>> {
			return client.request<ApiResponse<ApprovalRequestDetail>>(`/requests/${requestId}`, {
				method: "PATCH",
				body: JSON.stringify(request),
			})
		},

		deleteRequest(requestId: number): Promise<ApiResponse<null>> {
			return client.request<ApiResponse<null>>(`/requests/${requestId}`, {
				method: "DELETE",
			})
		},

		approveRequest(
			requestId: number,
			request: ApprovalReviewRequest = {},
		): Promise<ApiResponse<ApprovalRequestDetail>> {
			return client.request<ApiResponse<ApprovalRequestDetail>>(`/requests/${requestId}/approve`, {
				method: "POST",
				body: JSON.stringify(request),
			})
		},

		approveRequestWithEdits(
			requestId: number,
			request: ApprovalReviewWithEditsRequest,
		): Promise<ApiResponse<ApprovalRequestDetail>> {
			return client.request<ApiResponse<ApprovalRequestDetail>>(
				`/requests/${requestId}/approve-with-edits`,
				{
					method: "POST",
					body: JSON.stringify(request),
				},
			)
		},

		rejectRequest(
			requestId: number,
			request: ApprovalRejectRequest,
		): Promise<ApiResponse<ApprovalRequestDetail>> {
			return client.request<ApiResponse<ApprovalRequestDetail>>(`/requests/${requestId}/reject`, {
				method: "POST",
				body: JSON.stringify(request),
			})
		},
	}
}
