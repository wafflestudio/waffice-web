"use client"

import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Forbidden } from "@/components/error/forbidden"
import { MOCK_PROJECT_DETAIL } from "@/components/projects/project-detail.mock"
import { ProjectDetailView } from "@/components/projects/project-detail-view"
import { MOCK_PROJECT_MANAGEMENT_ROWS } from "@/components/projects/project-management.mock"
import { useAuth } from "@/components/providers/auth-provider"
import type { ProjectDetailViewMode } from "@/types"

function ProjectDetailContent() {
	const { activeRole, isLoading } = useAuth()
	const searchParams = useSearchParams()

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	const canViewProjectDetail = ["leader", "waffle_leader", "operations"].includes(activeRole)

	if (!canViewProjectDetail) {
		return (
			<Forbidden message="프로젝트 상세 페이지에 접근할 권한이 없습니다. 관리자 또는 팀장 권한이 필요합니다." />
		)
	}

	const viewMode: ProjectDetailViewMode = activeRole === "leader" ? "leader" : "admin"
	const projectId = Number(searchParams.get("projectId"))
	const selectedProject = Number.isInteger(projectId)
		? MOCK_PROJECT_MANAGEMENT_ROWS.find((project) => project.id === projectId)
		: undefined
	const project = selectedProject
		? {
				...MOCK_PROJECT_DETAIL,
				id: selectedProject.id,
				name: selectedProject.name,
				status: selectedProject.status,
			}
		: MOCK_PROJECT_DETAIL

	return <ProjectDetailView project={project} viewMode={viewMode} />
}

export default function ProjectDetailPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			}
		>
			<ProjectDetailContent />
		</Suspense>
	)
}
