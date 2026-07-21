"use client"

import { useMemo, useState } from "react"
import { ActivityDeleteDialog } from "@/components/activities/activity-delete-dialog"
import { ActivityDetailDialog } from "@/components/activities/activity-detail-dialog"
import { ActivityHistoryTable } from "@/components/activities/activity-history-table"
import { ActivityRequestDialog } from "@/components/activities/activity-request-dialog"
import { Toast } from "@/components/ui/toast"
import type { ActivityHistoryRecord, ActivityRequestFormValues } from "@/types"

interface ActivityHistoryViewProps {
	initialRecords: ActivityHistoryRecord[]
}

function dateValue(value: string | null) {
	if (!value) return Number.POSITIVE_INFINITY
	return Number(value.replaceAll(".", ""))
}

function sortRecords(records: ActivityHistoryRecord[]) {
	return [...records].sort((a, b) => {
		const startDifference = dateValue(b.startDate) - dateValue(a.startDate)
		if (startDifference !== 0) return startDifference
		return dateValue(b.endDate) - dateValue(a.endDate)
	})
}

export function ActivityHistoryView({ initialRecords }: ActivityHistoryViewProps) {
	const [records, setRecords] = useState(initialRecords)
	const [selectedRecord, setSelectedRecord] = useState<ActivityHistoryRecord | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<ActivityHistoryRecord | null>(null)
	const [requestMode, setRequestMode] = useState<"add" | "edit" | null>(null)
	const [requestTargetRecord, setRequestTargetRecord] = useState<ActivityHistoryRecord | null>(null)
	const [toastMessage, setToastMessage] = useState("")
	const [showToast, setShowToast] = useState(false)
	const sortedRecords = useMemo(() => sortRecords(records), [records])

	const showMessage = (message: string) => {
		setToastMessage(message)
		setShowToast(true)
	}

	const openEditRequest = (record: ActivityHistoryRecord) => {
		setSelectedRecord(null)
		setRequestTargetRecord(record)
		setRequestMode("edit")
	}

	const openDeleteDialog = (record: ActivityHistoryRecord) => {
		setSelectedRecord(null)
		setDeleteTarget(record)
	}

	const submitRequest = (values: ActivityRequestFormValues) => {
		// TODO(API): 활동 이력 추가/수정 요청 API가 추가되면 로컬 상태 변경을 mutation으로 교체한다.
		if (requestMode === "edit" && requestTargetRecord) {
			setRecords((current) =>
				current.map((record) =>
					record.id === requestTargetRecord.id
						? {
								...record,
								status: "수정 요청중",
								requests: [
									...record.requests,
									{
										id: Date.now(),
										kind: "수정 요청",
										requestedAt: new Date().toISOString().slice(0, 10).replaceAll("-", "."),
										target: values.requestTarget.split("(")[0],
										status: "승인대기중",
										note: values.note,
									},
								],
							}
						: record,
				),
			)
			showMessage("활동 이력 수정 요청이 등록되었습니다.")
		} else {
			setRecords((current) => [
				...current,
				{
					id: Date.now(),
					startDate: values.startDate,
					endDate: values.isEndDateUnknown ? null : values.endDate,
					projectName: values.projectName,
					description: values.description,
					status: "추가 요청중",
					requests: [
						{
							id: Date.now(),
							kind: "추가 요청",
							requestedAt: new Date().toISOString().slice(0, 10).replaceAll("-", "."),
							target: values.requestTarget.split("(")[0],
							status: "승인대기중",
							note: values.note,
						},
					],
				},
			])
			showMessage("활동 이력 추가 요청이 등록되었습니다.")
		}

		setRequestMode(null)
		setRequestTargetRecord(null)
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
					<ActivityHistoryTable records={sortedRecords} onSelect={setSelectedRecord} />
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
				onConfirm={(record) => {
					// TODO(API): 본인 활동 이력 삭제 API가 생기면 mutation 성공 후 목록을 invalidate한다.
					setRecords((current) => current.filter((item) => item.id !== record.id))
					setDeleteTarget(null)
					showMessage("활동 이력이 삭제되었습니다.")
				}}
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
			/>

			<Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
		</>
	)
}
