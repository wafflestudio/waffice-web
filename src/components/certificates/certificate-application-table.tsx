"use client"

import { Download, Settings2 } from "lucide-react"
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
import { Toast } from "@/components/ui/toast"
import { useDownloadCertificate } from "@/hooks/use-certificates"
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
	const downloadCertificate = useDownloadCertificate()
	const [downloadingId, setDownloadingId] = useState<number | null>(null)
	const [toastMessage, setToastMessage] = useState("")
	const [showErrorToast, setShowErrorToast] = useState(false)

	const handleDownload = (row: MyCertificateApplication) => {
		if (row.status !== "발급 완료" || downloadCertificate.isPending) return

		setDownloadingId(row.id)
		downloadCertificate.mutate(row.id, {
			onSuccess: (blob) => {
				const url = URL.createObjectURL(blob)
				const link = document.createElement("a")
				link.href = url
				link.download = `certificate_${row.id}.pdf`
				link.click()
				URL.revokeObjectURL(url)
				setDownloadingId(null)
			},
			onError: (error) => {
				setToastMessage(error instanceof Error ? error.message : "다운로드에 실패했습니다.")
				setShowErrorToast(true)
				setDownloadingId(null)
			},
		})
	}

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
						<DesignTableHeaderCell className="w-[100px] text-center text-[14px]">
							다운로드
						</DesignTableHeaderCell>
					</DesignTableHeaderRow>
				</thead>
				<tbody>
					{visibleRows.map((row) => {
						const canDownload = row.status === "발급 완료"
						return (
							<DesignTableRow key={row.id} className="h-[50px] text-[14px] hover:bg-white">
								<DesignTableBodyCell>{row.applicationNumber}</DesignTableBodyCell>
								<DesignTableBodyCell>{row.appliedAt}</DesignTableBodyCell>
								<DesignTableBodyCell>
									<DotStatusBadge dotClassName={STATUS_DOT_CLASS[row.status]}>
										{row.status}
									</DotStatusBadge>
								</DesignTableBodyCell>
								<DesignTableBodyCell className="text-center">
									<button
										type="button"
										aria-label={`${row.applicationNumber} 활동증명서 다운로드`}
										onClick={() => handleDownload(row)}
										disabled={!canDownload || downloadingId === row.id}
										className="inline-flex size-[20px] items-center justify-center text-black-900 disabled:cursor-not-allowed disabled:text-black-300"
									>
										<Download className="size-[20px]" strokeWidth={1.8} />
									</button>
								</DesignTableBodyCell>
							</DesignTableRow>
						)
					})}
				</tbody>
			</DesignTable>
			{visibleRows.length === 0 && (
				<div className="flex h-[120px] items-center justify-center border-black-300 border-b text-[14px] text-black-600">
					해당 상태의 발급 신청이 없습니다.
				</div>
			)}
			<Toast
				message={toastMessage}
				isVisible={showErrorToast}
				onClose={() => setShowErrorToast(false)}
				variant="error"
			/>
		</div>
	)
}
