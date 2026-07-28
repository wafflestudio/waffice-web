"use client"

import { unixToDateInput } from "@/components/activities/activity-history.utils"
import type { AdminActivityRow } from "@/components/activities/admin-activity-history.utils"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterRadioItem,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FilterTrigger } from "@/components/ui/filter-tag"
import { cn } from "@/lib/utils"

interface AdminActivityHistoryTableProps {
	rows: AdminActivityRow[]
	projectOptions: string[]
	projectFilter: string
	onProjectFilterChange: (value: string) => void
	onSelect: (row: AdminActivityRow) => void
}

const CELL_CLASS = "flex min-w-0 items-center overflow-hidden px-[20px] text-[14px] text-black-900"
const GRID_COLS = "grid-cols-[minmax(180px,220px)_minmax(100px,140px)_minmax(220px,300px)_1fr]"
const DROPDOWN_CONTENT_CLASS =
	"min-w-0 rounded-[6px] border-black-300 p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
const FILTER_TRIGGER_CLASS =
	"h-auto w-auto gap-[6px] rounded-none p-0 text-[14px] font-medium tracking-[-0.28px] text-black-900 hover:bg-transparent"

export function AdminActivityHistoryTable({
	rows,
	projectOptions,
	projectFilter,
	onProjectFilterChange,
	onSelect,
}: AdminActivityHistoryTableProps) {
	return (
		<div className="w-full overflow-hidden bg-white">
			<div className={cn("grid h-[40px] border-black-300 border-y bg-black-100", GRID_COLS)}>
				<div className={cn(CELL_CLASS, "font-medium tracking-[-0.28px]")}>활동 기간</div>
				<div className={cn(CELL_CLASS, "font-medium tracking-[-0.28px]")}>활동 팀원</div>
				<div className={CELL_CLASS}>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<FilterTrigger
								aria-label="활동 프로젝트 필터"
								className={FILTER_TRIGGER_CLASS}
								iconClassName="size-4 text-black-900"
							>
								활동 프로젝트
							</FilterTrigger>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" className={`w-[200px] ${DROPDOWN_CONTENT_CLASS}`}>
							<DropdownMenuRadioGroup
								value={projectFilter}
								onValueChange={(value) =>
									onProjectFilterChange(value === projectFilter ? "전체" : value)
								}
							>
								{projectOptions.map((option) => (
									<DropdownMenuFilterRadioItem key={option} value={option}>
										{option}
									</DropdownMenuFilterRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<div className={cn(CELL_CLASS, "font-medium tracking-[-0.28px]")}>활동 내용</div>
			</div>

			{rows.map((row) => (
				<button
					type="button"
					key={row.key}
					onClick={() => onSelect(row)}
					className={cn(
						"grid h-[50px] w-full border-black-300 border-b text-left transition-colors hover:bg-black-100 focus-visible:bg-peach-100 focus-visible:outline-none",
						GRID_COLS,
					)}
				>
					<div className={cn(CELL_CLASS, "tracking-[-0.28px]")}>
						{`${unixToDateInput(row.startDate)} ~ ${unixToDateInput(row.endDate) || "현재"}`}
					</div>
					<div className={cn(CELL_CLASS, "truncate tracking-[-0.28px]")}>{row.userName}</div>
					<div className={cn(CELL_CLASS, "truncate tracking-[-0.28px]")}>
						{row.projectName ?? "-"}
					</div>
					<div className={cn(CELL_CLASS, "truncate")}>{row.description}</div>
				</button>
			))}

			{rows.length === 0 && (
				<div className="flex h-[120px] items-center justify-center border-black-300 border-b text-[14px] text-black-600">
					활동 이력이 없습니다.
				</div>
			)}
		</div>
	)
}
