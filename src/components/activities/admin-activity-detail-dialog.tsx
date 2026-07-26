"use client"

import { ActivityDialogRow } from "@/components/activities/activity-dialog-row"
import {
	ACTIVITY_STATUS_LABELS,
	ACTIVITY_STATUS_STYLES,
	unixToDateInput,
} from "@/components/activities/activity-history.utils"
import type { AdminActivityRow } from "@/components/activities/admin-activity-history.utils"
import {
	REQUEST_KIND_LABELS,
	REQUEST_STATUS_LABELS,
	unixToDateLabel,
} from "@/components/activities/request-history.utils"
import { DesignDialogContent } from "@/components/ui/design-dialog"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import { DotStatusBadge } from "@/components/ui/status-badge"
import { useRequestDetail, useRequests } from "@/hooks/use-requests"
import type { ApprovalRequestListItem } from "@/types"

interface AdminActivityDetailDialogProps {
	row: AdminActivityRow | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onSelectRequest: (requestId: number) => void
	onRequestDelete: (row: AdminActivityRow) => void
}

export function AdminActivityDetailDialog({
	row,
	open,
	onOpenChange,
	onSelectRequest,
	onRequestDelete,
}: AdminActivityDetailDialogProps) {
	const relatedRequestsQuery = useRequests({
		scope: "received",
		activityId: row?.activityId ?? undefined,
		enabled: row?.activityId != null,
	})
	// activity 레코드가 아직 없는 create-pending 행은 activityId로 조회할 수 없으므로,
	// pendingRequestId로 그 요청 하나를 직접 가져와 "관련 요청" 한 건으로 보여준다.
	const pendingRequestQuery = useRequestDetail(
		row?.activityId == null ? (row?.pendingRequestId ?? null) : null,
	)

	if (!row) return null

	const relatedRequests: ApprovalRequestListItem[] =
		row.activityId != null
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
					활동 이력 상세
				</DialogTitle>

				<div className="mt-[50px] flex w-full flex-col gap-[40px]">
					<ActivityDialogRow label="활동 팀원">
						<p className="pt-[2px] text-[14px] text-black-900">{row.userName}</p>
					</ActivityDialogRow>

					<ActivityDialogRow label="활동 프로젝트">
						<p className="pt-[2px] text-[14px] text-black-900">{row.projectName ?? "-"}</p>
					</ActivityDialogRow>

					<ActivityDialogRow label="활동 기간">
						<p className="pt-[2px] text-[14px] text-black-900">
							{unixToDateInput(row.startDate)} ~ {unixToDateInput(row.endDate) || "현재"}
						</p>
					</ActivityDialogRow>

					<ActivityDialogRow label="활동 내용">
						<div className="min-h-[70px] rounded-[5px] border border-black-300 px-[16px] py-[10px] text-[14px] tracking-[-0.28px] text-black-900">
							{row.description ?? row.position}
						</div>
					</ActivityDialogRow>

					<ActivityDialogRow label="기록 상태">
						<DotStatusBadge dotClassName={ACTIVITY_STATUS_STYLES[row.status]} className="pt-[2px]">
							{ACTIVITY_STATUS_LABELS[row.status]}
						</DotStatusBadge>
					</ActivityDialogRow>

					<ActivityDialogRow label="관련 요청">
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
									<button
										type="button"
										key={request.id}
										onClick={() => onSelectRequest(request.id)}
										className="grid h-[50px] w-full grid-cols-4 border-black-300 border-b text-left text-[14px] transition-colors hover:bg-black-100 focus-visible:bg-peach-100 focus-visible:outline-none"
									>
										<div className="flex items-center px-[20px]">
											{REQUEST_KIND_LABELS[request.request_kind]}
										</div>
										<div className="flex items-center px-[20px]">
											{unixToDateLabel(request.created_at)}
										</div>
										<div className="flex items-center truncate px-[20px]">
											{request.requester.name}
										</div>
										<div className="flex items-center px-[20px]">
											{REQUEST_STATUS_LABELS[request.status]}
										</div>
									</button>
								))
							) : (
								<div className="flex h-[50px] items-center justify-center border-black-300 border-b text-[14px] text-black-600">
									관련 요청이 없습니다.
								</div>
							)}
						</div>
					</ActivityDialogRow>

					{row.activityId != null && (
						<ActivityDialogRow label="활동이력 삭제">
							<button
								type="button"
								onClick={() => onRequestDelete(row)}
								className="h-[32px] rounded-[3px] bg-black-500 px-[16px] text-[14px] font-semibold text-white hover:bg-black-600"
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
