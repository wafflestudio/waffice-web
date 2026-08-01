import type { ActivityHistoryAdminItem, ActivityHistoryStatus } from "@/types"

/** 운영진 "활동이력 관리" 화면(완료된 활동만 노출)의 행 뷰 모델. */
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

export function sortAdminActivityRows(rows: AdminActivityRow[]): AdminActivityRow[] {
	return [...rows].sort((a, b) => {
		if (b.startDate !== a.startDate) return b.startDate - a.startDate
		return (b.endDate ?? Number.POSITIVE_INFINITY) - (a.endDate ?? Number.POSITIVE_INFINITY)
	})
}
