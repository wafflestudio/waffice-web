"use client"

import { Settings2 } from "lucide-react"
import { useState } from "react"
import {
	DesignTable,
	DesignTableBodyCell,
	DesignTableHeaderCell,
	DesignTableHeaderRow,
	DesignTableRow,
} from "@/components/ui/design-table"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterRadioItem,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DotStatusBadge } from "@/components/ui/status-badge"
import type { CertificateIssueHistory, CertificateIssueStatus } from "@/types"

interface CertificateHistoryTableProps {
	rows: CertificateIssueHistory[]
}

type StatusFilter = "전체" | CertificateIssueStatus

const STATUS_OPTIONS: StatusFilter[] = ["전체", "발급 완료", "발급 대기", "발급 실패"]

const STATUS_DOT_CLASS: Record<CertificateIssueStatus, string> = {
	"발급 완료": "bg-[#7aee7f]",
	"발급 대기": "bg-[#ffc342]",
	"발급 실패": "bg-[#f77153]",
}

export function CertificateHistoryTable({ rows }: CertificateHistoryTableProps) {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("전체")
	const visibleRows = rows.filter((row) => statusFilter === "전체" || row.status === statusFilter)

	return (
		<div className="w-full overflow-hidden bg-white">
			<DesignTable className="w-full">
				<thead>
					<DesignTableHeaderRow>
						<DesignTableHeaderCell className="w-[220px] text-[14px]">구분</DesignTableHeaderCell>
						<DesignTableHeaderCell className="w-[220px] text-[14px]">
							발급 일시
						</DesignTableHeaderCell>
						<DesignTableHeaderCell className="text-[14px]">발급대상</DesignTableHeaderCell>
						<DesignTableHeaderCell className="w-[120px] px-[15px] text-[14px]">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button
										type="button"
										className="flex h-[40px] items-center gap-[6px] outline-none"
									>
										발급 상태
										<Settings2 className="size-[12px]" strokeWidth={1.8} />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-[120px] p-[5px]">
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
						</DesignTableHeaderCell>
					</DesignTableHeaderRow>
				</thead>
				<tbody>
					{visibleRows.map((row) => (
						<DesignTableRow key={row.id} className="h-[50px] text-[14px] hover:bg-white">
							<DesignTableBodyCell>{row.requestType}</DesignTableBodyCell>
							<DesignTableBodyCell>{row.issuedAt}</DesignTableBodyCell>
							<DesignTableBodyCell>{row.recipient}</DesignTableBodyCell>
							<DesignTableBodyCell className="px-[15px]">
								<DotStatusBadge dotClassName={STATUS_DOT_CLASS[row.status]}>
									{row.status}
								</DotStatusBadge>
							</DesignTableBodyCell>
						</DesignTableRow>
					))}
				</tbody>
			</DesignTable>
		</div>
	)
}
