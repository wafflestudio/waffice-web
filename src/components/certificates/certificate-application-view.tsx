"use client"

import { useMemo, useState } from "react"
import { CertificateApplicationDialog } from "@/components/certificates/certificate-application-dialog"
import {
	type CertificateApplicationStatusFilter,
	CertificateApplicationTable,
} from "@/components/certificates/certificate-application-table"
import { CertificatePreviewDialog } from "@/components/certificates/certificate-preview-dialog"
import { FilterResetButton, FilterTag, FilterTagGroup } from "@/components/ui/filter-tag"
import { Pagination } from "@/components/ui/pagination"
import { useMyCertificates } from "@/hooks/use-certificates"
import type { CertificateApplicationFormValues, CertificateOptions } from "@/types"
import { toCertificateOptions, toMyCertificateApplication } from "@/types"

const ROWS_PER_PAGE = 2

export function CertificateApplicationView() {
	const [statusFilter, setStatusFilter] = useState<CertificateApplicationStatusFilter>("전체")
	const [currentPage, setCurrentPage] = useState(1)
	const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false)
	const [previewOptions, setPreviewOptions] = useState<CertificateOptions | null>(null)
	const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)

	const { data, isLoading, error, refetch } = useMyCertificates(undefined, 100)
	const rows = useMemo(() => (data?.items ?? []).map(toMyCertificateApplication), [data])

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

	const openPreview = (values: CertificateApplicationFormValues) => {
		setPreviewOptions(toCertificateOptions(values))
		setIsApplicationDialogOpen(false)
		setIsPreviewDialogOpen(true)
	}

	const handleIssued = () => {
		refetch()
		setStatusFilter("전체")
		setCurrentPage(1)
	}

	return (
		<>
			<div className="flex min-h-[calc(100vh-60px)] w-full flex-col gap-[40px]">
				<h1 className="text-[28px] font-semibold leading-normal tracking-[-0.56px] text-black-900">
					활동증명서 발급
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

					{isLoading ? (
						<div className="flex h-[200px] items-center justify-center text-[14px] text-black-600">
							불러오는 중...
						</div>
					) : error ? (
						<div className="flex h-[200px] items-center justify-center text-[14px] text-black-600">
							{error.message}
						</div>
					) : (
						<>
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
						</>
					)}
				</div>
			</div>

			<CertificateApplicationDialog
				open={isApplicationDialogOpen}
				onOpenChange={setIsApplicationDialogOpen}
				onSubmit={openPreview}
			/>
			<CertificatePreviewDialog
				open={isPreviewDialogOpen}
				onOpenChange={setIsPreviewDialogOpen}
				options={previewOptions}
				onIssued={handleIssued}
			/>
		</>
	)
}
