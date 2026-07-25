"use client"

import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Forbidden } from "@/components/error/forbidden"
import { ProjectDetailView } from "@/components/projects/project-detail-view"
import { useAuth } from "@/components/providers/auth-provider"
import { useProject } from "@/hooks/use-projects"
import type { ProjectDetailViewMode } from "@/types"

function ProjectDetailContent() {
	const { activeRole, isLoading: isAuthLoading } = useAuth()
	const searchParams = useSearchParams()
	const projectIdParam = Number(searchParams.get("projectId"))
	const projectId = Number.isInteger(projectIdParam) ? projectIdParam : null
	const { data: project, isLoading: isProjectLoading, error } = useProject(projectId)

	if (isAuthLoading) {
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

	if (isProjectLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	if (error || !project) {
		return (
			<div className="flex min-h-screen items-center justify-center text-black-600">
				{error?.message ?? "프로젝트를 찾을 수 없습니다."}
			</div>
		)
	}

	const viewMode: ProjectDetailViewMode = activeRole === "leader" ? "leader" : "admin"

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
