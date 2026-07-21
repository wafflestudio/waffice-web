"use client"

import { useMemo, useState } from "react"
import { CertificateApplicationDialog } from "@/components/certificates/certificate-application-dialog"
import {
	type CertificateApplicationStatusFilter,
	CertificateApplicationTable,
} from "@/components/certificates/certificate-application-table"
import { FilterResetButton, FilterTag, FilterTagGroup } from "@/components/ui/filter-tag"
import { Pagination } from "@/components/ui/pagination"
import type { CertificateApplicationFormValues, MyCertificateApplication } from "@/types"

interface CertificateApplicationViewProps {
	initialRows: MyCertificateApplication[]
}

const ROWS_PER_PAGE = 2

export function CertificateApplicationView({ initialRows }: CertificateApplicationViewProps) {
	// TODO(API): 본인 신청 목록 query와 신청 mutation이 준비되면 local state를 교체한다.
	const [rows, setRows] = useState(initialRows)
	const [statusFilter, setStatusFilter] = useState<CertificateApplicationStatusFilter>("전체")
	const [currentPage, setCurrentPage] = useState(1)
	const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false)

	const filteredRows = useMemo(
		() => rows.filter((row) => statusFilter === "전체" || row.status === statusFilter),
		[rows, statusFilter],
	)
	const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE))
	const visibleRows = filteredRows.slice(
		(currentPage - 1) * ROWS_PER_PAGE,
		currentPage * ROWS_PER_PAGE,
	)

	const changeStatusFilter = (status: CertificateApplicationStatusFilter) => {
		setStatusFilter(status)
		setCurrentPage(1)
	}

	const submitApplication = (_values: CertificateApplicationFormValues) => {
		const today = new Date().toISOString().slice(0, 10).replaceAll("-", ".")
		setRows((current) => [
			{
				id: Math.max(0, ...current.map((row) => row.id)) + 1,
				applicationNumber: String(1234 + current.length),
				appliedAt: today,
				status: "대기",
			},
			...current,
		])
		setStatusFilter("전체")
		setCurrentPage(1)
	}

	return (
		<>
			<div className="flex min-h-[calc(100vh-60px)] w-full flex-col gap-[30px]">
				<h1 className="text-[28px] font-semibold leading-normal tracking-[-0.56px] text-black-900">
					활동 증명서 발급
				</h1>

				<div className="flex min-h-0 flex-1 flex-col gap-[12px]">
					<div className="flex h-[36px] items-end justify-between">
						<button
							type="button"
							onClick={() => setIsApplicationDialogOpen(true)}
							className="h-[36px] rounded-[3px] bg-peach-300 px-[16px] text-[14px] font-semibold text-white hover:bg-peach-500"
						>
							활동증명서 발급 신청
						</button>

						{statusFilter !== "전체" && (
							<FilterTagGroup className="gap-[10px]">
								<FilterTag
									label={statusFilter}
									className="h-[28px] text-[13px] tracking-[-0.13px]"
									onClick={() => changeStatusFilter("전체")}
								/>
								<FilterResetButton
									className="h-[28px] text-[13px] tracking-[-0.13px]"
									onClick={() => changeStatusFilter("전체")}
								>
									초기화
								</FilterResetButton>
							</FilterTagGroup>
						)}
					</div>

					<CertificateApplicationTable
						rows={visibleRows}
						statusFilter={statusFilter}
						onStatusFilterChange={changeStatusFilter}
					/>

					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						className="mt-auto pb-[15px]"
					/>
				</div>
			</div>

			<CertificateApplicationDialog
				open={isApplicationDialogOpen}
				onOpenChange={setIsApplicationDialogOpen}
				onSubmit={submitApplication}
			/>
		</>
	)
}
