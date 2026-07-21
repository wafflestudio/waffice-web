"use client"

import { Forbidden } from "@/components/error/forbidden"
import { useAuth } from "@/components/providers/auth-provider"
import { canManageCertificates } from "@/lib/permissions"
import type { CertificateIssueHistory } from "@/types"
import { CertificateHistoryTable } from "./certificate-history-table"

interface CertificateHistoryViewProps {
	rows: CertificateIssueHistory[]
}

export function CertificateHistoryView({ rows }: CertificateHistoryViewProps) {
	const { user } = useAuth()

	if (!canManageCertificates(user)) {
		return <Forbidden message="활동증명서 발급 이력을 조회할 권한이 없습니다." />
	}

	return (
		<div className="flex w-full flex-col gap-[40px]">
			<h1 className="text-[28px] font-semibold leading-normal text-black-900">
				활동증명서 발급 이력
			</h1>
			<CertificateHistoryTable rows={rows} />
		</div>
	)
}
