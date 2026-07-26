import type {
	ActivityHistoryAdminItem,
	ActivityHistoryStatus,
	ApprovalRequestListItem,
} from "@/types"

/** 운영진 "활동 이력 관리" 화면의 통합 행. GET /activities(active/update_pending)와
 * GET /requests(request_kind=create, status=pending)를 한 테이블로 합치기 위한 뷰 모델. */
export interface AdminActivityRow {
	key: string
	activityId: number | null
	pendingRequestId: number | null
	userId: number
	userName: string
	projectName: string | null
	position: string
	startDate: number
	endDate: number | null
	description: string | null
	status: ActivityHistoryStatus
}

export function adminActivityItemToRow(item: ActivityHistoryAdminItem): AdminActivityRow {
	return {
		key: `activity-${item.id}`,
		activityId: item.id,
		pendingRequestId: item.pending_request_id,
		userId: item.user.id,
		userName: item.user.name,
		projectName: item.project_name,
		position: item.position,
		startDate: item.start_date,
		endDate: item.end_date,
		description: item.description,
		status: item.status,
	}
}

/** create pending 요청(아직 activity 레코드가 없는 추가 요청)을 행으로 변환한다.
 * 요청자 본인의 활동 추가 요청만 다루므로 requester를 활동 주체로 사용한다. */
export function pendingCreateRequestToRow(
	request: ApprovalRequestListItem,
	projectNameById: Map<number, string>,
): AdminActivityRow | null {
	if (!request.after) return null

	return {
		key: `request-${request.id}`,
		activityId: null,
		pendingRequestId: request.id,
		userId: request.requester.id,
		userName: request.requester.name,
		projectName: projectNameById.get(request.after.project_id) ?? null,
		position: request.after.position,
		startDate: request.after.start_date,
		endDate: request.after.end_date ?? null,
		description: request.after.description ?? null,
		status: "create_pending" as ActivityHistoryStatus,
	}
}

export function sortAdminActivityRows(rows: AdminActivityRow[]): AdminActivityRow[] {
	return [...rows].sort((a, b) => {
		if (b.startDate !== a.startDate) return b.startDate - a.startDate
		return (b.endDate ?? Number.POSITIVE_INFINITY) - (a.endDate ?? Number.POSITIVE_INFINITY)
	})
}
