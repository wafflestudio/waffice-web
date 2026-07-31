"use client"

import { useMemo, useState } from "react"
import { ReceivedRequestDetailDialog } from "@/components/activities/received-request-detail-dialog"
import { ReceivedRequestTable } from "@/components/activities/received-request-table"
import { Toast } from "@/components/ui/toast"
import { useProjects } from "@/hooks/use-projects"
import {
	useApproveRequest,
	useRejectRequest,
	useRequestDetail,
	useRequests,
} from "@/hooks/use-requests"
import type { ApprovalRequestDetail, ApprovalRequestListItem } from "@/types"

export function ReceivedRequestView() {
	const requestsQuery = useRequests({ scope: "received", status: "all", limit: 100 })
	const projectsQuery = useProjects(undefined, 100)
	const approveMutation = useApproveRequest()
	const rejectMutation = useRejectRequest()

	const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)
	const [toastMessage, setToastMessage] = useState("")
	const [showToast, setShowToast] = useState(false)

	const requestDetailQuery = useRequestDetail(selectedRequestId)

	const requests = requestsQuery.data?.items ?? []
	const projectNameById = useMemo(
		() => new Map((projectsQuery.data?.items ?? []).map((project) => [project.id, project.name])),
		[projectsQuery.data],
	)

	const showMessage = (message: string) => {
		setToastMessage(message)
		setShowToast(true)
	}

	const openDetail = (request: ApprovalRequestListItem) => {
		setSelectedRequestId(request.id)
	}

	const closeDetail = () => {
		setSelectedRequestId(null)
	}

	const handleApprove = (request: ApprovalRequestDetail) => {
		approveMutation.mutate(
			{ requestId: request.id },
			{
				onSuccess: () => {
					showMessage("요청을 승인했습니다.")
					closeDetail()
				},
				onError: (error) => {
					showMessage(error.message)
				},
			},
		)
	}

	const handleReject = (request: ApprovalRequestDetail, comment: string) => {
		rejectMutation.mutate(
			{ requestId: request.id, data: { comment } },
			{
				onSuccess: () => {
					showMessage("요청을 거부했습니다.")
					closeDetail()
				},
				onError: (error) => {
					showMessage(error.message)
				},
			},
		)
	}

	return (
		<>
			<div className="flex w-full flex-col gap-[40px]">
				<h1 className="text-[28px] font-semibold leading-normal text-black-900">나에게 온 요청</h1>
				<div className="flex w-full flex-col gap-[16px]">
					<h2 className="flex items-center gap-[2px] text-black-900">
						<span className="text-[18px] font-medium leading-none">전체 요청</span>
						<span className="text-[14px] font-medium leading-[1.4] tracking-[-0.28px]">
							({requests.length.toString().padStart(2, "0")})
						</span>
					</h2>
					<div className="flex w-full flex-col gap-[12px]">
						{requestsQuery.isLoading ? (
							<div className="flex h-[120px] items-center justify-center border-black-300 border-y text-[14px] text-black-600">
								불러오는 중입니다...
							</div>
						) : requestsQuery.isError ? (
							<div className="flex h-[120px] items-center justify-center border-black-300 border-y text-[14px] text-black-600">
								{requestsQuery.error.message}
							</div>
						) : (
							<ReceivedRequestTable
								requests={requests}
								projectNameById={projectNameById}
								onSelect={openDetail}
							/>
						)}
					</div>
				</div>
			</div>

			<ReceivedRequestDetailDialog
				request={requestDetailQuery.data ?? null}
				open={selectedRequestId != null}
				onOpenChange={(open) => {
					if (!open) closeDetail()
				}}
				onApprove={handleApprove}
				onReject={handleReject}
				submitting={approveMutation.isPending || rejectMutation.isPending}
			/>

			<Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
		</>
	)
}
