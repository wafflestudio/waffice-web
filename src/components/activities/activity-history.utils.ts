import type { ActivityHistoryItem, ActivityHistoryStatus } from "@/types"

export const ACTIVITY_STATUS_LABELS: Record<ActivityHistoryStatus, string> = {
	create_pending: "추가 요청중",
	update_pending: "수정 요청중",
	active: "기록완료",
}

export const ACTIVITY_STATUS_STYLES: Record<ActivityHistoryStatus, string> = {
	create_pending: "bg-[#f0975e]",
	update_pending: "bg-[#ffd21f]",
	active: "bg-[#7aee7f]",
}

/** unix seconds -> "YYYY.MM.DD". CalendarDateField가 사용하는 표시 포맷과 동일하다. */
export function unixToDateInput(value: number | null): string {
	if (value == null) return ""

	const date = new Date(value * 1000)
	if (Number.isNaN(date.getTime())) return ""

	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
		date.getDate(),
	).padStart(2, "0")}`
}

/** "YYYY.MM.DD" -> unix seconds(정오 기준, 타임존 경계 문제를 피한다). 형식이 어긋나면 null. */
export function dateInputToUnix(value: string): number | null {
	const match = value.match(/^(\d{4})\.(\d{2})\.(\d{2})$/)
	if (!match) return null

	const [, year, month, day] = match
	const date = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0)
	if (Number.isNaN(date.getTime())) return null

	return Math.floor(date.getTime() / 1000)
}

export function sortActivityHistoryItems(items: ActivityHistoryItem[]) {
	return [...items].sort((a, b) => {
		if (b.start_date !== a.start_date) return b.start_date - a.start_date
		return (b.end_date ?? Number.POSITIVE_INFINITY) - (a.end_date ?? Number.POSITIVE_INFINITY)
	})
}

/** 화면/요청 폼에서 activity id를 참조할 때 실제 activity와 가상(pending-only) 행을 구분해 하나의 key로 합친다. */
export function activityHistoryItemKey(item: ActivityHistoryItem): string {
	return item.id != null ? `activity-${item.id}` : `pending-${item.pending_request_id}`
}
