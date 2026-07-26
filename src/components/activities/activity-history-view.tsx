"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { ActivityDeleteDialog } from "@/components/activities/activity-delete-dialog"
import { ActivityDetailDialog } from "@/components/activities/activity-detail-dialog"
import { sortActivityHistoryItems } from "@/components/activities/activity-history.utils"
import { ActivityHistoryTable } from "@/components/activities/activity-history-table"
import type { ActivityRequestFormValues } from "@/components/activities/activity-request-dialog"
import { ActivityRequestDialog } from "@/components/activities/activity-request-dialog"
import { Toast } from "@/components/ui/toast"
import { memberQueryKeys, useMyActivities } from "@/hooks/use-members"
import { useCreateRequest } from "@/hooks/use-requests"
import type { ActivityHistoryItem } from "@/types"

export function ActivityHistoryView() {
	const queryClient = useQueryClient()
	const activitiesQuery = useMyActivities()
	const createRequestMutation = useCreateRequest()

	const [selectedRecord, setSelectedRecord] = useState<ActivityHistoryItem | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<ActivityHistoryItem | null>(null)
	const [requestMode, setRequestMode] = useState<"add" | "edit" | null>(null)
	const [requestTargetRecord, setRequestTargetRecord] = useState<ActivityHistoryItem | null>(null)
	const [toastMessage, setToastMessage] = useState("")
	const [showToast, setShowToast] = useState(false)

	const records = activitiesQuery.data ?? []
	const sortedRecords = useMemo(() => sortActivityHistoryItems(records), [records])

	const showMessage = (message: string) => {
		setToastMessage(message)
		setShowToast(true)
	}

	const openEditRequest = (record: ActivityHistoryItem) => {
		setSelectedRecord(null)
		setRequestTargetRecord(record)
		setRequestMode("edit")
	}

	const openDeleteDialog = (record: ActivityHistoryItem) => {
		setSelectedRecord(null)
		setDeleteTarget(record)
	}

	const submitRequest = (values: ActivityRequestFormValues) => {
		const isEdit = requestMode === "edit" && requestTargetRecord

		createRequestMutation.mutate(
			{
				request_kind: isEdit ? "update" : "create",
				activity_id: isEdit ? requestTargetRecord.id : null,
				after: {
					project_id: values.projectId,
					position: values.description,
					start_date: values.startDate,
					end_date: values.endDate,
					description: values.description,
				},
				reason: values.reason,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: memberQueryKeys.myActivities() })
					showMessage(
						isEdit
							? "활동 이력 수정 요청이 등록되었습니다."
							: "활동 이력 추가 요청이 등록되었습니다.",
					)
					setRequestMode(null)
					setRequestTargetRecord(null)
				},
				onError: (error) => {
					showMessage(error.message)
				},
			},
		)
	}

	const confirmDelete = (record: ActivityHistoryItem) => {
		if (record.id == null) return

		createRequestMutation.mutate(
			{
				request_kind: "delete",
				activity_id: record.id,
				reason: "활동 이력 삭제 요청",
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: memberQueryKeys.myActivities() })
					setDeleteTarget(null)
					showMessage("활동 이력 삭제 요청이 완료되었습니다.")
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
				<h1 className="text-[28px] font-semibold leading-normal text-black-900">
					내 활동 이력 관리
				</h1>
				<div className="flex w-full flex-col gap-[12px]">
					<button
						type="button"
						onClick={() => {
							setRequestTargetRecord(null)
							setRequestMode("add")
						}}
						className="h-[36px] w-fit rounded-[3px] bg-peach-300 px-[16px] text-[14px] font-semibold text-white hover:bg-peach-500"
					>
						활동 이력 추가 요청
					</button>
					{activitiesQuery.isLoading ? (
						<div className="flex h-[120px] items-center justify-center border-black-300 border-y text-[14px] text-black-600">
							불러오는 중입니다...
						</div>
					) : activitiesQuery.isError ? (
						<div className="flex h-[120px] items-center justify-center border-black-300 border-y text-[14px] text-black-600">
							{activitiesQuery.error.message}
						</div>
					) : (
						<ActivityHistoryTable records={sortedRecords} onSelect={setSelectedRecord} />
					)}
				</div>
			</div>

			<ActivityDetailDialog
				record={selectedRecord}
				open={selectedRecord != null}
				onOpenChange={(open) => {
					if (!open) setSelectedRecord(null)
				}}
				onRequestEdit={openEditRequest}
				onRequestDelete={openDeleteDialog}
			/>

			<ActivityDeleteDialog
				record={deleteTarget}
				open={deleteTarget != null}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null)
				}}
				onConfirm={confirmDelete}
				submitting={createRequestMutation.isPending}
			/>

			<ActivityRequestDialog
				open={requestMode != null}
				onOpenChange={(open) => {
					if (!open) {
						setRequestMode(null)
						setRequestTargetRecord(null)
					}
				}}
				mode={requestMode ?? "add"}
				record={requestTargetRecord}
				onSubmit={submitRequest}
				submitting={createRequestMutation.isPending}
			/>

			<Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
		</>
	)
}
