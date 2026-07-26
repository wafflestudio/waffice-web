"use client"

import { useState } from "react"
import {
	REQUEST_KIND_LABELS,
	REQUEST_STATUS_DOT_STYLES,
	REQUEST_STATUS_LABELS,
	unixToDateLabel,
} from "@/components/activities/request-history.utils"
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
import type { ApprovalRequestListItem, RequestStatus } from "@/types"

interface ReceivedRequestTableProps {
	requests: ApprovalRequestListItem[]
	projectNameById: Map<number, string>
	onSelect: (request: ApprovalRequestListItem) => void
}

type StatusFilter = "전체" | RequestStatus

const STATUS_OPTIONS: StatusFilter[] = ["전체", "pending", "approved", "rejected"]

const CELL_CLASS = "flex min-w-0 items-center overflow-hidden px-[20px] text-[14px] text-black-900"
const GRID_COLS = "grid-cols-[140px_140px_minmax(240px,1fr)_minmax(240px,1fr)_140px]"

export function ReceivedRequestTable({
	requests,
	projectNameById,
	onSelect,
}: ReceivedRequestTableProps) {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("전체")
	const visibleRequests =
		statusFilter === "전체"
			? requests
			: requests.filter((request) => request.status === statusFilter)

	return (
		<div className="w-full overflow-hidden bg-white">
			<div className={cn("grid h-[40px] border-black-300 border-y bg-black-100", GRID_COLS)}>
				<div className={cn(CELL_CLASS, "font-medium tracking-[-0.28px]")}>요청 일시</div>
				<div className={cn(CELL_CLASS, "font-medium tracking-[-0.28px]")}>요청자명</div>
				<div className={cn(CELL_CLASS, "font-medium tracking-[-0.28px]")}>활동 프로젝트</div>
				<div className={cn(CELL_CLASS, "font-medium tracking-[-0.28px]")}>요청구분</div>
				<div className={CELL_CLASS}>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<FilterTrigger
								aria-label="요청상태 필터"
								className="h-auto w-auto gap-[6px] rounded-none p-0 text-[14px] font-medium tracking-[-0.28px] text-black-900 hover:bg-transparent"
								iconClassName="size-4 text-black-900"
							>
								요청상태
							</FilterTrigger>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="min-w-0 w-[150px] rounded-[6px] border-black-300 p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
						>
							<DropdownMenuRadioGroup
								value={statusFilter}
								onValueChange={(value) => setStatusFilter(value as StatusFilter)}
							>
								{STATUS_OPTIONS.map((status) => (
									<DropdownMenuFilterRadioItem key={status} value={status}>
										{status === "전체" ? status : REQUEST_STATUS_LABELS[status]}
									</DropdownMenuFilterRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{visibleRequests.map((request) => (
				<button
					type="button"
					key={request.id}
					onClick={() => onSelect(request)}
					className={cn(
						"grid h-[50px] w-full border-black-300 border-b text-left transition-colors hover:bg-black-100 focus-visible:bg-peach-100 focus-visible:outline-none",
						GRID_COLS,
					)}
				>
					<div className={cn(CELL_CLASS, "tracking-[-0.28px]")}>
						{unixToDateLabel(request.created_at)}
					</div>
					<div className={cn(CELL_CLASS, "truncate tracking-[-0.28px]")}>
						{request.requester.name}
					</div>
					<div className={cn(CELL_CLASS, "truncate tracking-[-0.28px]")}>
						{request.after?.project_id != null
							? (projectNameById.get(request.after.project_id) ?? "-")
							: "-"}
					</div>
					<div className={cn(CELL_CLASS, "tracking-[-0.28px]")}>
						{REQUEST_KIND_LABELS[request.request_kind]}
					</div>
					<div className={cn(CELL_CLASS, "px-[15px]")}>
						<DotStatusBadge dotClassName={REQUEST_STATUS_DOT_STYLES[request.status]}>
							{REQUEST_STATUS_LABELS[request.status]}
						</DotStatusBadge>
					</div>
				</button>
			))}

			{visibleRequests.length === 0 && (
				<div className="flex h-[120px] items-center justify-center border-black-300 border-b text-[14px] text-black-600">
					해당 상태의 요청이 없습니다.
				</div>
			)}
		</div>
	)
}
