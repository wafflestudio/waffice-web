"use client"

import { Settings2 } from "lucide-react"
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
import type { MyCertificateApplication, MyCertificateApplicationStatus } from "@/types"

export type CertificateApplicationStatusFilter = "전체" | MyCertificateApplicationStatus

interface CertificateApplicationTableProps {
	rows: MyCertificateApplication[]
	statusFilter: CertificateApplicationStatusFilter
	onStatusFilterChange: (status: CertificateApplicationStatusFilter) => void
}

const STATUS_OPTIONS: CertificateApplicationStatusFilter[] = ["전체", "발급 완료", "대기"]

const STATUS_DOT_CLASS: Record<MyCertificateApplicationStatus, string> = {
	"발급 완료": "bg-[#84aef1]",
	대기: "bg-[#ffd21f]",
}

export function CertificateApplicationTable({
	rows,
	statusFilter,
	onStatusFilterChange,
}: CertificateApplicationTableProps) {
	const visibleRows = rows.filter((row) => statusFilter === "전체" || row.status === statusFilter)

	return (
		<div className="w-full overflow-hidden bg-white">
			<DesignTable className="w-full">
				<thead>
					<DesignTableHeaderRow>
						<DesignTableHeaderCell className="w-[200px] text-[14px]">
							신청번호
						</DesignTableHeaderCell>
						<DesignTableHeaderCell className="text-[14px]">신청일시</DesignTableHeaderCell>
						<DesignTableHeaderCell className="w-[220px] text-[14px]">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button
										type="button"
										className="flex h-[40px] items-center gap-[6px] outline-none"
									>
										처리상태
										<Settings2 className="size-[12px]" strokeWidth={1.8} />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-[140px] rounded-[6px] border-black-300 p-[5px] shadow-[0_4px_6px_rgba(0,0,0,0.09)]"
								>
									<DropdownMenuRadioGroup
										value={statusFilter}
										onValueChange={(value) =>
											onStatusFilterChange(value as CertificateApplicationStatusFilter)
										}
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
							<DesignTableBodyCell>{row.applicationNumber}</DesignTableBodyCell>
							<DesignTableBodyCell>{row.appliedAt}</DesignTableBodyCell>
							<DesignTableBodyCell>
								<DotStatusBadge dotClassName={STATUS_DOT_CLASS[row.status]}>
									{row.status}
								</DotStatusBadge>
							</DesignTableBodyCell>
						</DesignTableRow>
					))}
				</tbody>
			</DesignTable>
			{visibleRows.length === 0 && (
				<div className="flex h-[120px] items-center justify-center border-black-300 border-b text-[14px] text-black-600">
					해당 상태의 발급 신청이 없습니다.
				</div>
			)}
		</div>
	)
}
