"use client"

import { Loader2 } from "lucide-react"
import { Forbidden } from "@/components/error/forbidden"
import { ProjectManagementView } from "@/components/projects/project-management-view"
import { useAuth } from "@/components/providers/auth-provider"
import type { ProjectManagementViewMode } from "@/types"

export default function ProjectsPage() {
	const { activeRole, isLoading } = useAuth()

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	const canViewProjectManagement = ["leader", "waffle_leader", "operations"].includes(activeRole)

	if (!canViewProjectManagement) {
		return (
			<Forbidden message="프로젝트 관리 페이지에 접근할 권한이 없습니다. 관리자 또는 팀장 권한이 필요합니다." />
		)
	}

	const viewMode: ProjectManagementViewMode = activeRole === "leader" ? "member" : "admin"

	return <ProjectManagementView viewMode={viewMode} />
}
