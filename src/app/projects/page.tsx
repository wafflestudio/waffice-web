"use client"

import { MOCK_PROJECT_MANAGEMENT_ROWS } from "@/components/projects/project-management.mock"
import { ProjectManagementView } from "@/components/projects/project-management-view"
import type { ProjectManagementViewMode } from "@/types"

export default function ProjectsPage() {
	// TODO(API): 현재 사용자 권한 API와 프로젝트 목록 API가 준비되면 viewMode와 projects를 hook 결과로 교체.
	const viewMode: ProjectManagementViewMode = "admin"

	return <ProjectManagementView projects={MOCK_PROJECT_MANAGEMENT_ROWS} viewMode={viewMode} />
}
