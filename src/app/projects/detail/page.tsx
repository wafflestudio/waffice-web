"use client"

import { Loader2 } from "lucide-react"
import { Forbidden } from "@/components/error/forbidden"
import { MOCK_PROJECT_DETAIL } from "@/components/projects/project-detail.mock"
import { ProjectDetailView } from "@/components/projects/project-detail-view"
import { useAuth } from "@/components/providers/auth-provider"
import { isAdminRole } from "@/lib/permissions"
import type { ProjectDetailViewMode } from "@/types"

export default function ProjectDetailPage() {
	const { user, isLoading } = useAuth()

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	const canViewProjectDetail = isAdminRole(user?.role) || user?.role === "leader"

	if (!canViewProjectDetail) {
		return (
			<Forbidden message="프로젝트 상세 페이지에 접근할 권한이 없습니다. 관리자 또는 팀장 권한이 필요합니다." />
		)
	}

	const viewMode: ProjectDetailViewMode = isAdminRole(user?.role) ? "admin" : "leader"

	return <ProjectDetailView project={MOCK_PROJECT_DETAIL} viewMode={viewMode} />
}
