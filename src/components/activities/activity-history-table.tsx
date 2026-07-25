"use client"

import { SlidersHorizontal } from "lucide-react"
import { useState } from "react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterRadioItem,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DotStatusBadge } from "@/components/ui/status-badge"
import { cn } from "@/lib/utils"
import type { ActivityHistoryRecord, ActivityRecordStatus } from "@/types"

interface ActivityHistoryTableProps {
	records: ActivityHistoryRecord[]
	onSelect: (record: ActivityHistoryRecord) => void
}

type StatusFilter = "전체" | ActivityRecordStatus

const STATUS_STYLES: Record<ActivityRecordStatus, string> = {
	"추가 완료": "bg-[#7aee7f]",
	"수정 완료": "bg-[#7aee7f]",
	"수정 요청중": "bg-[#ffd21f]",
	"추가 요청중": "bg-[#f0975e]",
}

const STATUS_OPTIONS: StatusFilter[] = [
	"전체",
	"추가 요청중",
	"추가 완료",
	"수정 요청중",
	"수정 완료",
]

const CELL_CLASS = "flex min-w-0 items-center overflow-hidden px-[20px] text-[14px] text-black-900"

export function ActivityHistoryTable({ records, onSelect }: ActivityHistoryTableProps) {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("전체")
	const visibleRecords =
		statusFilter === "전체" ? records : records.filter((record) => record.status === statusFilter)

	return (
		<div className="w-full overflow-hidden bg-white">
			<div className="grid h-[40px] grid-cols-[minmax(180px,220px)_minmax(220px,320px)_minmax(240px,1fr)_120px] border-black-300 border-y bg-black-100">
				<div className={cn(CELL_CLASS, "font-medium tracking-[-0.28px]")}>활동 기간</div>
				<div className={cn(CELL_CLASS, "font-medium tracking-[-0.28px]")}>활동 프로젝트</div>
				<div className={cn(CELL_CLASS, "font-medium tracking-[-0.28px]")}>활동 내용</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className={cn(CELL_CLASS, "gap-[6px] font-medium tracking-[-0.28px]")}
						>
							기록 상태
							<SlidersHorizontal className="size-[12px]" strokeWidth={1.5} />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-[150px] rounded-[6px] border-black-300 p-[5px] shadow-[0px_4px_6px_rgba(0,0,0,0.09)]"
					>
						<DropdownMenuRadioGroup
							value={statusFilter}
							onValueChange={(value) => setStatusFilter(value as StatusFilter)}
						>
							{STATUS_OPTIONS.map((status) => (
								<DropdownMenuFilterRadioItem key={status} value={status}>
									{status}
								</DropdownMenuFilterRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{visibleRecords.map((record) => (
				<button
					type="button"
					key={record.id}
					onClick={() => onSelect(record)}
					className="grid h-[50px] w-full grid-cols-[minmax(180px,220px)_minmax(220px,320px)_minmax(240px,1fr)_120px] border-black-300 border-b text-left transition-colors hover:bg-black-100 focus-visible:bg-peach-100 focus-visible:outline-none"
				>
					<div
						className={cn(CELL_CLASS, "tracking-[-0.28px]")}
					>{`${record.startDate} ~ ${record.endDate ?? ""}`}</div>
					<div className={cn(CELL_CLASS, "truncate tracking-[-0.28px]")}>{record.projectName}</div>
					<div className={cn(CELL_CLASS, "truncate")}>{record.description}</div>
					<div className={cn(CELL_CLASS, "px-[15px]")}>
						<DotStatusBadge dotClassName={STATUS_STYLES[record.status]}>
							{record.status}
						</DotStatusBadge>
					</div>
				</button>
			))}

			{visibleRecords.length === 0 && (
				<div className="flex h-[120px] items-center justify-center border-black-300 border-b text-[14px] text-black-600">
					해당 상태의 활동 이력이 없습니다.
				</div>
			)}
		</div>
	)
}
