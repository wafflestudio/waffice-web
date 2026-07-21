export type ActivityRecordStatus = "추가 요청중" | "추가 완료" | "수정 요청중" | "수정 완료"

export type ActivityRequestKind = "추가 요청" | "수정 요청"

export interface ActivityRequestHistory {
	id: number
	kind: ActivityRequestKind
	requestedAt: string
	target: string
	status: "승인대기중" | "승인" | "반려"
	note?: string
}

export interface ActivityHistoryRecord {
	id: number
	startDate: string
	endDate: string | null
	projectName: string
	description: string
	status: ActivityRecordStatus
	requests: ActivityRequestHistory[]
}

export interface ActivityRequestFormValues {
	projectName: string
	requestTarget: string
	startDate: string
	endDate: string
	isEndDateUnknown: boolean
	description: string
	note: string
}
