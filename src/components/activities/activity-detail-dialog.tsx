"use client"

import { useEffect, useState } from "react"
import { ActivityDialogRow } from "@/components/activities/activity-dialog-row"
import { CalendarDateField } from "@/components/ui/calendar"
import { DesignDialogContent } from "@/components/ui/design-dialog"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import { DotStatusBadge } from "@/components/ui/status-badge"
import type { ActivityHistoryRecord, ActivityRecordStatus } from "@/types"

const STATUS_STYLES: Record<ActivityRecordStatus, string> = {
	"추가 완료": "bg-[#7aee7f]",
	"수정 완료": "bg-[#7aee7f]",
	"수정 요청중": "bg-[#ffd21f]",
	"추가 요청중": "bg-[#f0975e]",
}

interface ActivityDetailDialogProps {
	record: ActivityHistoryRecord | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onRequestEdit: (record: ActivityHistoryRecord) => void
	onRequestDelete: (record: ActivityHistoryRecord) => void
}

export function ActivityDetailDialog({
	record,
	open,
	onOpenChange,
	onRequestEdit,
	onRequestDelete,
}: ActivityDetailDialogProps) {
	const [startDate, setStartDate] = useState(record?.startDate ?? "")
	const [endDate, setEndDate] = useState(record?.endDate ?? "")

	useEffect(() => {
		setStartDate(record?.startDate ?? "")
		setEndDate(record?.endDate ?? "")
	}, [record])

	if (!record) return null

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DesignDialogContent
				showDesignClose
				className="max-h-[calc(100vh-32px)] w-[calc(100vw-32px)] max-w-[calc(100vw-32px)] overflow-x-hidden overflow-y-auto rounded-[12px] border-0 px-[24px] py-[40px] sm:!w-[1000px] sm:!max-w-[1000px] sm:px-[100px]"
				closeClassName="fixed top-[15px] right-[15px]"
			>
				<DialogTitle className="text-[28px] font-medium leading-normal text-black-900">
					활동 이력 상세
				</DialogTitle>

				<div className="mt-[50px] flex w-full flex-col gap-[40px]">
					<ActivityDialogRow label="활동 프로젝트">
						<p className="pt-[2px] text-[14px] text-black-900">{record.projectName}</p>
					</ActivityDialogRow>

					<ActivityDialogRow label="활동 기간">
						<div className="flex items-center gap-[5px]">
							<CalendarDateField
								value={startDate || "YYYY.MM.DD"}
								onChange={setStartDate}
								className="h-[42px] w-[140px] rounded-[6px] text-[14px]"
							/>
							<span className="text-[15px] text-black-300">-</span>
							<CalendarDateField
								value={endDate || "YYYY.MM.DD"}
								onChange={setEndDate}
								className="h-[42px] w-[140px] rounded-[6px] text-[14px]"
							/>
						</div>
					</ActivityDialogRow>

					<ActivityDialogRow label="활동 내용">
						<div className="min-h-[70px] rounded-[5px] border border-black-300 px-[16px] py-[10px] text-[14px] tracking-[-0.28px] text-black-900">
							{record.description}
						</div>
					</ActivityDialogRow>

					<ActivityDialogRow label="기록 상태">
						<DotStatusBadge dotClassName={STATUS_STYLES[record.status]} className="pt-[2px]">
							{record.status}
						</DotStatusBadge>
					</ActivityDialogRow>

					<ActivityDialogRow label="관련 요청">
						<div className="flex flex-col gap-[20px]">
							<button
								type="button"
								onClick={() =>
									onRequestEdit({
										...record,
										startDate,
										endDate: endDate || null,
									})
								}
								className="h-[36px] w-fit rounded-[3px] bg-peach-300 px-[16px] text-[14px] font-semibold text-white hover:bg-peach-500"
							>
								수정 요청하기
							</button>
							<div className="w-full overflow-hidden bg-white">
								<div className="grid h-[40px] grid-cols-4 border-black-300 border-y bg-black-100 text-[14px] font-medium tracking-[-0.28px]">
									{["요청 구분", "요청 일시", "요청 대상자", "요청 상태"].map((title) => (
										<div key={title} className="flex items-center px-[20px]">
											{title}
										</div>
									))}
								</div>
								{record.requests.length > 0 ? (
									record.requests.map((request) => (
										<div
											key={request.id}
											className="grid h-[50px] grid-cols-4 border-black-300 border-b text-[14px]"
										>
											<div className="flex items-center px-[20px]">{request.kind}</div>
											<div className="flex items-center px-[20px]">{request.requestedAt}</div>
											<div className="flex items-center px-[20px]">{request.target}</div>
											<div className="flex items-center px-[20px]">{request.status}</div>
										</div>
									))
								) : (
									<div className="flex h-[50px] items-center justify-center border-black-300 border-b text-[14px] text-black-600">
										관련 요청이 없습니다.
									</div>
								)}
							</div>
						</div>
					</ActivityDialogRow>

					<ActivityDialogRow label="활동이력 삭제">
						<button
							type="button"
							onClick={() => onRequestDelete(record)}
							className="h-[36px] rounded-[3px] bg-[#ffeaea] px-[16px] text-[14px] font-semibold text-[#f44949] hover:bg-[#ffdada]"
						>
							활동이력 삭제
						</button>
					</ActivityDialogRow>
				</div>

				<div className="mt-[40px] flex justify-end gap-[10px]">
					<DialogActionButton variant="cancel" onClick={() => onOpenChange(false)}>
						취소
					</DialogActionButton>
					<DialogActionButton onClick={() => onOpenChange(false)}>확인</DialogActionButton>
				</div>
			</DesignDialogContent>
		</Dialog>
	)
}
