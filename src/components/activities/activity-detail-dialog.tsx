"use client"

import { ActivityDialogRow } from "@/components/activities/activity-dialog-row"
import {
	ACTIVITY_STATUS_LABELS,
	ACTIVITY_STATUS_STYLES,
	unixToDateInput,
} from "@/components/activities/activity-history.utils"
import { DesignDialogContent } from "@/components/ui/design-dialog"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import { DotStatusBadge } from "@/components/ui/status-badge"
import { useRequestDetail, useRequests } from "@/hooks/use-requests"
import type { ActivityHistoryItem, ApprovalRequestListItem } from "@/types"

const REQUEST_KIND_LABELS = {
	create: "추가 요청",
	update: "수정 요청",
	delete: "삭제 요청",
} as const

const REQUEST_STATUS_LABELS = {
	pending: "승인대기중",
	approved: "승인",
	rejected: "반려",
} as const

function formatRequestedAt(unixSeconds: number) {
	const date = new Date(unixSeconds * 1000)
	if (Number.isNaN(date.getTime())) return "-"
	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
		date.getDate(),
	).padStart(2, "0")}`
}

interface ActivityDetailDialogProps {
	record: ActivityHistoryItem | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onRequestEdit: (record: ActivityHistoryItem) => void
	onRequestDelete: (record: ActivityHistoryItem) => void
}

export function ActivityDetailDialog({
	record,
	open,
	onOpenChange,
	onRequestEdit,
	onRequestDelete,
}: ActivityDetailDialogProps) {
	const relatedRequestsQuery = useRequests({
		scope: "sent",
		status: "all",
		activityId: record?.id ?? undefined,
		enabled: record?.id != null,
	})
	// activity 레코드가 아직 없는 create-pending 행은 activityId로 조회할 수 없으므로,
	// pendingRequestId로 그 요청 하나를 직접 가져와 "관련 요청" 한 건으로 보여준다.
	const pendingRequestQuery = useRequestDetail(
		record?.id == null ? (record?.pending_request_id ?? null) : null,
	)
	const canRequestEdit = record?.id != null
	const canRequestDelete = record?.id != null

	if (!record) return null

	const relatedRequests: ApprovalRequestListItem[] =
		record.id != null
			? (relatedRequestsQuery.data?.items ?? [])
			: pendingRequestQuery.data
				? [
						{
							id: pendingRequestQuery.data.id,
							requester: pendingRequestQuery.data.requester,
							target_user_id: pendingRequestQuery.data.body.target_user_id,
							activity_id: pendingRequestQuery.data.body.activity_id,
							reviewers: pendingRequestQuery.data.reviewers,
							request_kind: pendingRequestQuery.data.body.request_kind,
							after: pendingRequestQuery.data.body.after,
							status: pendingRequestQuery.data.status,
							created_at: pendingRequestQuery.data.created_at,
							reviewed_at: pendingRequestQuery.data.reviewed_at,
						},
					]
				: []

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DesignDialogContent
				showDesignClose
				className="max-h-[calc(100vh-32px)] w-[calc(100vw-32px)] max-w-[calc(100vw-32px)] overflow-x-hidden overflow-y-auto rounded-[12px] border-0 px-[24px] py-[40px] sm:!w-[1000px] sm:!max-w-[1000px] sm:px-[100px]"
				closeClassName="fixed top-[15px] right-[15px]"
			>
				<DialogTitle className="text-[28px] font-medium leading-normal text-black-900">
					활동이력 상세
				</DialogTitle>

				<div className="mt-[50px] flex w-full flex-col gap-[40px]">
					<ActivityDialogRow label="활동 프로젝트">
						<p className="pt-[2px] text-[14px] text-black-900">{record.project_name ?? "-"}</p>
					</ActivityDialogRow>

					<ActivityDialogRow label="활동 기간">
						<p className="pt-[2px] text-[14px] text-black-900">
									{unixToDateInput(record.start_date)} ~{" "}
									{unixToDateInput(record.end_date) || "현재"}
						</p>
					</ActivityDialogRow>

					<ActivityDialogRow label="활동 내용">
						<div className="min-h-[70px] rounded-[5px] border border-black-300 px-[16px] py-[10px] text-[14px] tracking-[-0.28px] text-black-900">
							{record.description}
						</div>
					</ActivityDialogRow>

					<ActivityDialogRow label="기록 상태">
						<DotStatusBadge
							dotClassName={ACTIVITY_STATUS_STYLES[record.status]}
							className="pt-[2px]"
						>
							{ACTIVITY_STATUS_LABELS[record.status]}
						</DotStatusBadge>
					</ActivityDialogRow>

					<ActivityDialogRow label="관련 요청">
						<div className="flex flex-col gap-[20px]">
							{canRequestEdit && (
								<button
									type="button"
									onClick={() => onRequestEdit(record)}
									className="h-[36px] w-fit rounded-[3px] bg-peach-300 px-[16px] text-[14px] font-semibold text-white hover:bg-peach-500"
								>
									수정 요청하기
								</button>
							)}
							<div className="w-full overflow-hidden bg-white">
								<div className="grid h-[40px] grid-cols-4 border-black-300 border-y bg-black-100 text-[14px] font-medium tracking-[-0.28px]">
									{["요청 구분", "요청 일시", "요청 대상자", "요청 상태"].map((title) => (
										<div key={title} className="flex items-center px-[20px]">
											{title}
										</div>
									))}
								</div>
								{relatedRequests.length > 0 ? (
									relatedRequests.map((request) => (
										<div
											key={request.id}
											className="grid h-[50px] grid-cols-4 border-black-300 border-b text-[14px]"
										>
											<div className="flex items-center px-[20px]">
												{REQUEST_KIND_LABELS[request.request_kind]}
											</div>
											<div className="flex items-center px-[20px]">
												{formatRequestedAt(request.created_at)}
											</div>
											<div className="flex items-center truncate px-[20px]">
														{request.reviewers.map((reviewer) => reviewer.user.name).join(", ") ||
															"-"}
											</div>
											<div className="flex items-center px-[20px]">
												{REQUEST_STATUS_LABELS[request.status]}
											</div>
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

					{canRequestDelete && (
						<ActivityDialogRow label="활동이력 삭제">
							<button
								type="button"
								onClick={() => onRequestDelete(record)}
								className="h-[36px] rounded-[3px] bg-[#ffeaea] px-[16px] text-[14px] font-semibold text-[#f44949] hover:bg-[#ffdada]"
							>
								활동이력 삭제
							</button>
						</ActivityDialogRow>
					)}
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
