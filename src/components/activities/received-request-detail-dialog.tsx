"use client"

import { useState } from "react"
import { ActivityDialogRow } from "@/components/activities/activity-dialog-row"
import {
	REQUEST_KIND_LABELS,
	REQUEST_STATUS_DOT_STYLES,
	REQUEST_STATUS_LABELS,
	unixToDateLabel,
} from "@/components/activities/request-history.utils"
import { DesignDialogContent } from "@/components/ui/design-dialog"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import { DotStatusBadge } from "@/components/ui/status-badge"
import type { ApprovalRequestDetail } from "@/types"

interface ReceivedRequestDetailDialogProps {
	request: ApprovalRequestDetail | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onApprove: (request: ApprovalRequestDetail) => void
	onReject: (request: ApprovalRequestDetail, comment: string) => void
	submitting?: boolean
}

export function ReceivedRequestDetailDialog({
	request,
	open,
	onOpenChange,
	onApprove,
	onReject,
	submitting = false,
}: ReceivedRequestDetailDialogProps) {
	const [showRejectInput, setShowRejectInput] = useState(false)
	const [rejectComment, setRejectComment] = useState("")

	if (!request) return null

	const isPending = request.status === "pending"
	const requesterLabel = request.project
		? `${request.requester.name}(${request.project.name})`
		: request.requester.name

	const closeAndReset = (nextOpen: boolean) => {
		if (!nextOpen) {
			setShowRejectInput(false)
			setRejectComment("")
		}
		onOpenChange(nextOpen)
	}

	return (
		<Dialog open={open} onOpenChange={closeAndReset}>
			<DesignDialogContent
				showDesignClose
				className="max-h-[calc(100vh-32px)] w-[calc(100vw-32px)] max-w-[calc(100vw-32px)] overflow-x-hidden overflow-y-auto rounded-[12px] border-0 px-[24px] py-[40px] sm:!w-[1000px] sm:!max-w-[1000px] sm:px-[100px]"
				closeClassName="fixed top-[15px] right-[15px]"
			>
				<DialogTitle className="text-[28px] font-medium leading-normal text-black-900">
					요청 상세
				</DialogTitle>

				<div className="mt-[50px] flex w-full flex-col gap-[40px]">
					<ActivityDialogRow label="요청 구분">
						<p className="pt-[2px] text-[14px] text-black-900">
							{REQUEST_KIND_LABELS[request.body.request_kind]}
						</p>
					</ActivityDialogRow>

					<ActivityDialogRow label="요청자">
						<p className="pt-[2px] text-[14px] text-black-900">{requesterLabel}</p>
					</ActivityDialogRow>

					<ActivityDialogRow label="활동 기간">
						<p className="pt-[2px] text-[14px] text-black-900">
							{unixToDateLabel(request.body.after?.start_date)} ~{" "}
							{unixToDateLabel(request.body.after?.end_date)}
						</p>
					</ActivityDialogRow>

					<ActivityDialogRow label="활동 내용">
						<div className="min-h-[70px] rounded-[5px] border border-black-300 px-[16px] py-[10px] text-[14px] tracking-[-0.28px] text-black-900">
							{request.body.after?.description || "-"}
						</div>
					</ActivityDialogRow>

					<ActivityDialogRow label="요청 비고">
						<div className="min-h-[70px] rounded-[5px] border border-black-300 px-[16px] py-[10px] text-[14px] tracking-[-0.28px] text-black-900">
							{request.body.reason || "-"}
						</div>
					</ActivityDialogRow>

					<ActivityDialogRow label="요청 상태">
						<DotStatusBadge
							dotClassName={REQUEST_STATUS_DOT_STYLES[request.status]}
							className="pt-[2px]"
						>
							{REQUEST_STATUS_LABELS[request.status]}
						</DotStatusBadge>
					</ActivityDialogRow>

					{showRejectInput && (
						<ActivityDialogRow label="거부 사유">
							<textarea
								value={rejectComment}
								onChange={(event) => setRejectComment(event.target.value)}
								placeholder="거부 사유를 입력해주세요."
								className="min-h-[70px] w-full resize-none rounded-[5px] border border-black-300 px-[16px] py-[10px] text-[14px] tracking-[-0.28px] text-black-900 outline-none focus:border-peach-300"
							/>
						</ActivityDialogRow>
					)}
				</div>

				{isPending && (
					<div className="mt-[40px] flex justify-end gap-[10px]">
						{showRejectInput ? (
							<>
								<DialogActionButton variant="cancel" onClick={() => setShowRejectInput(false)}>
									취소
								</DialogActionButton>
								<DialogActionButton
									variant="danger"
									disabled={submitting || rejectComment.trim().length === 0}
									onClick={() => onReject(request, rejectComment.trim())}
								>
									거부 확정
								</DialogActionButton>
							</>
						) : (
							<>
								<DialogActionButton
									variant="cancel"
									disabled={submitting}
									onClick={() => setShowRejectInput(true)}
								>
									거부
								</DialogActionButton>
								<DialogActionButton disabled={submitting} onClick={() => onApprove(request)}>
									승인
								</DialogActionButton>
							</>
						)}
					</div>
				)}
			</DesignDialogContent>
		</Dialog>
	)
}
