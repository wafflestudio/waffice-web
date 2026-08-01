"use client"

import { useMemo, useState } from "react"
import { AdminActivityDeleteDialog } from "@/components/activities/admin-activity-delete-dialog"
import { AdminActivityDetailDialog } from "@/components/activities/admin-activity-detail-dialog"
import type { AdminActivityRow } from "@/components/activities/admin-activity-history.utils"
import {
	adminActivityItemToRow,
	sortAdminActivityRows,
} from "@/components/activities/admin-activity-history.utils"
import { AdminActivityHistoryTable } from "@/components/activities/admin-activity-history-table"
import { ReceivedRequestDetailDialog } from "@/components/activities/received-request-detail-dialog"
import { Pagination } from "@/components/ui/pagination"
import { Toast } from "@/components/ui/toast"
import { useActivities, useDeleteUserActivity } from "@/hooks/use-members"
import { useProjects } from "@/hooks/use-projects"
import { useApproveRequest, useRejectRequest, useRequestDetail } from "@/hooks/use-requests"
import type { ApprovalRequestDetail } from "@/types"

const PAGE_SIZE = 10

export function AdminActivityHistoryView() {
	const [currentPage, setCurrentPage] = useState(1)

	const activitiesQuery = useActivities(currentPage, PAGE_SIZE)
	const projectsQuery = useProjects(undefined, 100)
	const deleteActivityMutation = useDeleteUserActivity()
	const approveMutation = useApproveRequest()
	const rejectMutation = useRejectRequest()

	const [selectedRow, setSelectedRow] = useState<AdminActivityRow | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<AdminActivityRow | null>(null)
	const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)
	const [toastMessage, setToastMessage] = useState("")
	const [showToast, setShowToast] = useState(false)

	const selectedRequestDetailQuery = useRequestDetail(selectedRequestId)

	const showMessage = (message: string) => {
		setToastMessage(message)
		setShowToast(true)
	}

	const [projectFilter, setProjectFilter] = useState("전체")

	const rows = useMemo(() => {
		const activityRows = (activitiesQuery.data?.items ?? [])
			.filter((item) => item.status === "active")
			.map(adminActivityItemToRow)

		return sortAdminActivityRows(activityRows)
	}, [activitiesQuery.data])

	const projectOptions = useMemo(
		() => (projectsQuery.data?.items ?? []).map((project) => project.name),
		[projectsQuery.data],
	)
	const visibleRows = useMemo(
		() =>
			projectFilter === "전체" ? rows : rows.filter((row) => row.projectName === projectFilter),
		[rows, projectFilter],
	)

	const isLoading = activitiesQuery.isLoading
	const error = activitiesQuery.error
	const totalPages = Math.max(1, Math.ceil((activitiesQuery.data?.total ?? 0) / PAGE_SIZE))

	const openRequestDetail = (requestId: number) => {
		setSelectedRow(null)
		setSelectedRequestId(requestId)
	}

	const closeRequestDetail = () => {
		setSelectedRequestId(null)
	}

	const handleApproveRequest = (request: ApprovalRequestDetail) => {
		approveMutation.mutate(
			{ requestId: request.id },
			{
				onSuccess: () => {
					showMessage("요청을 승인했습니다.")
					closeRequestDetail()
				},
				onError: (mutationError) => {
					showMessage(mutationError.message)
				},
			},
		)
	}

	const handleRejectRequest = (request: ApprovalRequestDetail, comment: string) => {
		rejectMutation.mutate(
			{ requestId: request.id, data: { comment } },
			{
				onSuccess: () => {
					showMessage("요청을 거부했습니다.")
					closeRequestDetail()
				},
				onError: (mutationError) => {
					showMessage(mutationError.message)
				},
			},
		)
	}

	const confirmDelete = (row: AdminActivityRow) => {
		if (row.activityId == null) return

		deleteActivityMutation.mutate(
			{ userId: row.userId, activityId: row.activityId },
			{
				onSuccess: () => {
					setDeleteTarget(null)
					showMessage("활동이력을 삭제했습니다.")
				},
				onError: (mutationError) => {
					showMessage(mutationError.message)
				},
			},
		)
	}

	return (
		<div className="flex w-full flex-1 flex-col gap-[40px]">
			<h1 className="text-[28px] font-semibold leading-normal text-black-900">활동이력 관리</h1>
			<div className="flex w-full flex-col gap-[16px]">
				<h2 className="flex items-center gap-[2px] text-black-900">
					<span className="text-[18px] font-medium leading-none">전체 활동이력</span>
					<span className="text-[14px] font-medium leading-[1.4] tracking-[-0.28px]">
						({visibleRows.length.toString().padStart(2, "0")})
					</span>
				</h2>
				{isLoading ? (
					<div className="flex h-[120px] items-center justify-center border-black-300 border-y text-[14px] text-black-600">
						불러오는 중입니다...
					</div>
				) : error ? (
					<div className="flex h-[120px] items-center justify-center border-black-300 border-y text-[14px] text-black-600">
						{error.message}
					</div>
				) : (
					<AdminActivityHistoryTable
						rows={visibleRows}
						projectOptions={projectOptions}
						projectFilter={projectFilter}
						onProjectFilterChange={setProjectFilter}
						onSelect={setSelectedRow}
					/>
				)}
			</div>

			{!isLoading && !error && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
				/>
			)}

			<AdminActivityDetailDialog
				row={selectedRow}
				open={selectedRow != null}
				onOpenChange={(open) => {
					if (!open) setSelectedRow(null)
				}}
				onSelectRequest={openRequestDetail}
				onRequestDelete={(row) => {
					setSelectedRow(null)
					setDeleteTarget(row)
				}}
			/>

			<AdminActivityDeleteDialog
				row={deleteTarget}
				open={deleteTarget != null}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null)
				}}
				onConfirm={confirmDelete}
				submitting={deleteActivityMutation.isPending}
			/>

			<ReceivedRequestDetailDialog
				request={selectedRequestDetailQuery.data ?? null}
				open={selectedRequestId != null}
				onOpenChange={(open) => {
					if (!open) closeRequestDetail()
				}}
				onApprove={handleApproveRequest}
				onReject={handleRejectRequest}
				submitting={approveMutation.isPending || rejectMutation.isPending}
			/>

			<Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
		</div>
	)
}
