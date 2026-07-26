import type { RequestKind, RequestStatus } from "@/types"

export const REQUEST_KIND_LABELS: Record<RequestKind, string> = {
	create: "추가 요청",
	update: "수정 요청",
	delete: "삭제 요청",
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
	pending: "승인 대기중",
	approved: "승인 완료",
	rejected: "반려",
}

export const REQUEST_STATUS_DOT_STYLES: Record<RequestStatus, string> = {
	pending: "bg-[#ff0000]",
	approved: "bg-[#7aee7f]",
	rejected: "bg-black-600",
}

export function unixToDateLabel(unixSeconds: number | null | undefined) {
	if (unixSeconds == null) return "-"
	const date = new Date(unixSeconds * 1000)
	if (Number.isNaN(date.getTime())) return "-"
	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
		date.getDate(),
	).padStart(2, "0")}`
}
