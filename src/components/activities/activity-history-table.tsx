"use client"

import {
	ACTIVITY_STATUS_LABELS,
	ACTIVITY_STATUS_STYLES,
	activityHistoryItemKey,
	unixToDateInput,
} from "@/components/activities/activity-history.utils"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterRadioItem,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FilterTrigger } from "@/components/ui/filter-tag"
import { DotStatusBadge } from "@/components/ui/status-badge"
import { cn } from "@/lib/utils"
import type { ActivityHistoryItem, ActivityHistoryStatus } from "@/types"

export type ActivityStatusFilter = "전체" | "대기중" | "거절" | "완료"

interface ActivityHistoryTableProps {
	records: ActivityHistoryItem[]
	statusFilter: ActivityStatusFilter
	onStatusFilterChange: (value: ActivityStatusFilter) => void
	onSelect: (record: ActivityHistoryItem) => void
}

const STATUS_OPTIONS: ActivityStatusFilter[] = ["전체", "대기중", "거절", "완료"]

const STATUS_FILTER_STATUSES: Record<
	Exclude<ActivityStatusFilter, "전체">,
	ActivityHistoryStatus[]
> = {
	대기중: ["create_pending", "update_pending"],
	거절: ["rejected"],
	완료: ["active"],
}

const CELL_CLASS = "flex min-w-0 items-center overflow-hidden px-[20px] text-[14px] text-black-900"

export function ActivityHistoryTable({
	records,
	statusFilter,
	onStatusFilterChange,
	onSelect,
}: ActivityHistoryTableProps) {
	const visibleRecords =
		statusFilter === "전체"
			? records
			: records.filter((record) => STATUS_FILTER_STATUSES[statusFilter].includes(record.status))

	return (
		<div className="w-full overflow-hidden border-black-300 border-b bg-white [&>*:last-child]:border-b-0">
			<div className="grid h-[40px] grid-cols-[minmax(180px,220px)_minmax(220px,320px)_minmax(240px,1fr)_120px] border-black-300 border-y bg-black-100">
				<div className={cn(CELL_CLASS, "font-medium tracking-[-0.28px]")}>활동 기간</div>
				<div className={cn(CELL_CLASS, "font-medium tracking-[-0.28px]")}>활동 프로젝트</div>
				<div className={cn(CELL_CLASS, "font-medium tracking-[-0.28px]")}>활동 내용</div>
				<div className={CELL_CLASS}>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<FilterTrigger
								aria-label="요청 상태 필터"
								className="h-auto w-auto gap-[6px] rounded-none p-0 text-[14px] font-medium tracking-[-0.28px] text-black-900 hover:bg-transparent"
								iconClassName="size-4 text-black-900"
							>
								요청 상태
							</FilterTrigger>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="min-w-0 w-[150px] rounded-[6px] border-black-300 p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
						>
							<DropdownMenuRadioGroup
								value={statusFilter}
								onValueChange={(value) => onStatusFilterChange(value as ActivityStatusFilter)}
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
			</div>

			{visibleRecords.map((record) => (
				<button
					type="button"
					key={activityHistoryItemKey(record)}
					onClick={() => onSelect(record)}
					className="grid h-[50px] w-full grid-cols-[minmax(180px,220px)_minmax(220px,320px)_minmax(240px,1fr)_120px] border-black-300 border-b text-left transition-colors hover:bg-black-100 focus-visible:bg-peach-100 focus-visible:outline-none"
				>
					<div className={cn(CELL_CLASS, "tracking-[-0.28px]")}>
						{`${unixToDateInput(record.start_date)} ~ ${unixToDateInput(record.end_date) || "현재"}`}
					</div>
					<div className={cn(CELL_CLASS, "truncate tracking-[-0.28px]")}>
						{record.project_name ?? "-"}
					</div>
					<div className={cn(CELL_CLASS, "truncate")}>{record.description}</div>
					<div className={cn(CELL_CLASS, "px-[15px]")}>
						<DotStatusBadge dotClassName={ACTIVITY_STATUS_STYLES[record.status]}>
							{ACTIVITY_STATUS_LABELS[record.status]}
						</DotStatusBadge>
					</div>
				</button>
			))}

			{visibleRecords.length === 0 && (
				<div className="flex h-[120px] items-center justify-center border-black-300 border-b text-[14px] text-black-600">
					해당 상태의 활동이력이 없습니다.
				</div>
			)}
		</div>
	)
}
