import type { ApiResponse } from "@/types/common"
import type {
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
			activityId?: number
			/** 불투명 커서. next_cursor에서 받은 값을 숫자로 변환하지 않고 그대로 전달해야 한다. */
			cursor?: string
			limit?: number
		}): Promise<ApiResponse<RequestCursorPage<ApprovalRequestListItem>>> {
			const { scope, status, requestKind, activityId, cursor, limit = 20 } = options
			const params = new URLSearchParams()
			if (scope) params.append("scope", scope)
			if (status) params.append("status", status)
			if (requestKind) params.append("request_kind", requestKind)
			if (activityId != null) params.append("activity_id", activityId.toString())
			if (cursor) params.append("cursor", cursor)
			params.append("limit", limit.toString())
			return client.request<ApiResponse<RequestCursorPage<ApprovalRequestListItem>>>(
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
