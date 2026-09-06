"use client"

import { useMemo, useState } from "react"
import { Forbidden } from "@/components/error/forbidden"
import { useAuth } from "@/components/providers/auth-provider"
import { Pagination } from "@/components/ui/pagination"
import { useCertificateHistory } from "@/hooks/use-certificates"
import { canManageCertificates } from "@/lib/permissions"
import { toCertificateIssueHistory } from "@/types"
import { CertificateHistoryTable } from "./certificate-history-table"

const ROWS_PER_PAGE = 20

export function CertificateHistoryView() {
	const { user } = useAuth()
	const canView = canManageCertificates(user)
	const [currentPage, setCurrentPage] = useState(1)

	const { data, isLoading, error } = useCertificateHistory(undefined, 100)
	const rows = useMemo(() => (data?.items ?? []).map(toCertificateIssueHistory), [data])

	const totalPages = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE))
	const visibleRows = rows.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE)

	if (!canView) {
		return <Forbidden message="활동증명서 발급 이력을 조회할 권한이 없습니다." />
	}

	return (
		<div className="flex w-full flex-col gap-[40px]">
			<h1 className="text-[28px] font-semibold leading-normal text-black-900">
				활동증명서 발급 이력
			</h1>

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
					<CertificateHistoryTable rows={visibleRows} />
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
					/>
				</>
			)}
		</div>
	)
}
