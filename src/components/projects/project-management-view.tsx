"use client"

import { useState } from "react"
import { ActionButton } from "@/components/ui/action-button"
import { SearchInput } from "@/components/ui/search-input"
import { Toast } from "@/components/ui/toast"
import type {
	ProjectCreateFormValues,
	ProjectManagementRow,
	ProjectManagementStatusFilter,
	ProjectManagementViewMode,
} from "@/types"
import { ProjectCreateDialog } from "./project-create-dialog"
import { ProjectDeleteDialog } from "./project-delete-dialog"
import { ProjectManagementTable } from "./project-management-table"

interface ProjectManagementViewProps {
	projects: ProjectManagementRow[]
	viewMode: ProjectManagementViewMode
}

export function ProjectManagementView({ projects, viewMode }: ProjectManagementViewProps) {
	// TODO(API): 프로젝트 목록 API가 생기면 이 local state 대신 React Query hook 결과를 사용.
	const [projectRows, setProjectRows] = useState(projects)
	const [searchQuery, setSearchQuery] = useState("")
	const [currentPage, setCurrentPage] = useState(1)
	const [statusFilter, setStatusFilter] = useState<ProjectManagementStatusFilter>("전체")
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [deleteTargetProject, setDeleteTargetProject] = useState<ProjectManagementRow | null>(null)
	const [toastMessage, setToastMessage] = useState("")
	const [showToast, setShowToast] = useState(false)

	const isAdminView = viewMode === "admin"

	const handleSearchChange = (value: string) => {
		setSearchQuery(value)
		setCurrentPage(1)
	}

	const handleStatusFilterChange = (status: ProjectManagementStatusFilter) => {
		setStatusFilter(status)
		setCurrentPage(1)
	}

	const handleCreateProject = (values: ProjectCreateFormValues) => {
		// TODO(API): createProject mutation 성공 응답으로 row를 갱신.
		setProjectRows((prev) => [
			{
				id: Math.max(0, ...prev.map((project) => project.id)) + 1,
				name: values.name,
				// TODO(API): 생성 응답에 포함될 팀장/팀원 정보를 그대로 매핑.
				leader: "미정",
				memberCount: 0,
				members: [],
				links: [],
				status: values.status || "활성화",
			},
			...prev,
		])
		setIsCreateDialogOpen(false)
		setToastMessage("프로젝트가 생성되었습니다.")
		setShowToast(true)
	}

	const handleDeleteProject = (project: ProjectManagementRow) => {
		// TODO(API): deleteProject mutation 성공 후 invalidateQueries로 목록 갱신.
		setProjectRows((prev) => prev.filter((row) => row.id !== project.id))
		setDeleteTargetProject(null)
		setToastMessage("프로젝트가 삭제되었습니다.")
		setShowToast(true)
	}

	const handleBulkMemberUpdate = () => {
		setToastMessage("팀원 일괄 수정 API 연결 후 활성화됩니다.")
		setShowToast(true)
	}

	return (
		<div className="flex flex-col gap-[60px]">
			<h1 className="text-[36px] font-medium leading-none text-black-900">프로젝트 관리</h1>

			<div className="flex flex-col gap-[25px]">
				<h2 className="flex items-center gap-[2px] text-black-900">
					<span className="text-[20px] font-medium leading-none">전체 프로젝트</span>
					<span className="text-[14px] font-medium leading-[1.4] tracking-[-0.28px]">
						({projectRows.length.toString().padStart(2, "0")})
					</span>
				</h2>

				<div className="flex flex-col gap-[20px]">
					<div className="flex flex-wrap items-center gap-[15px]">
						<SearchInput
							containerClassName="w-[300px]"
							placeholder="검색어를 입력해 주세요"
							value={searchQuery}
							onChange={(event) => handleSearchChange(event.target.value)}
						/>
						{isAdminView && (
							<>
								<ActionButton
									variant="primary"
									size="inline"
									onClick={() => setIsCreateDialogOpen(true)}
									className="h-[36px] text-[14px] leading-[24px] tracking-normal"
								>
									새 프로젝트 생성
								</ActionButton>
								<ActionButton
									variant="primary"
									size="inline"
									onClick={handleBulkMemberUpdate}
									className="h-[36px] text-[14px] leading-[24px] tracking-normal"
								>
									팀원 일괄 수정
								</ActionButton>
							</>
						)}
					</div>

					<ProjectManagementTable
						projects={projectRows}
						searchQuery={searchQuery}
						currentPage={currentPage}
						onPageChange={setCurrentPage}
						statusFilter={statusFilter}
						onStatusFilterChange={handleStatusFilterChange}
						viewMode={viewMode}
						onProjectAction={isAdminView ? setDeleteTargetProject : undefined}
					/>
				</div>
			</div>

			<ProjectCreateDialog
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
				onSubmit={handleCreateProject}
			/>
			<ProjectDeleteDialog
				project={deleteTargetProject}
				open={deleteTargetProject !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteTargetProject(null)
				}}
				onConfirm={handleDeleteProject}
			/>
			<Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
		</div>
	)
}
