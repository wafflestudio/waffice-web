"use client"

import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { ActionButton } from "@/components/ui/action-button"
import { SearchInput } from "@/components/ui/search-input"
import { Toast } from "@/components/ui/toast"
import { useCreateProject, useDeleteProject, useProjects } from "@/hooks/use-projects"
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
	viewMode: ProjectManagementViewMode
}

export function ProjectManagementView({ viewMode }: ProjectManagementViewProps) {
	const { user } = useAuth()
	const { data, isLoading, error } = useProjects(undefined, 100)
	const createProject = useCreateProject()
	const deleteProject = useDeleteProject()

	const [searchQuery, setSearchQuery] = useState("")
	const [currentPage, setCurrentPage] = useState(1)
	const [statusFilter, setStatusFilter] = useState<ProjectManagementStatusFilter>("전체")
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [deleteTargetProject, setDeleteTargetProject] = useState<ProjectManagementRow | null>(null)
	const [toastMessage, setToastMessage] = useState("")
	const [showToast, setShowToast] = useState(false)

	const isAdminView = viewMode === "admin"
	const projectRows = data?.items ?? []

	const handleSearchChange = (value: string) => {
		setSearchQuery(value)
		setCurrentPage(1)
	}

	const handleStatusFilterChange = (status: ProjectManagementStatusFilter) => {
		setStatusFilter(status)
		setCurrentPage(1)
	}

	const handleCreateProject = async (values: ProjectCreateFormValues) => {
		if (!values.status || !user) return

		try {
			await createProject.mutateAsync({
				name: values.name,
				description: values.description || null,
				status: values.status,
				started_at: new Date().toISOString().slice(0, 10),
				members: [{ user_id: user.id, role: "leader" }],
			})
			setIsCreateDialogOpen(false)
			setToastMessage("프로젝트가 생성되었습니다.")
			setShowToast(true)
		} catch (submitError) {
			setToastMessage(
				submitError instanceof Error ? submitError.message : "프로젝트 생성에 실패했습니다.",
			)
			setShowToast(true)
		}
	}

	const handleDeleteProject = async (project: ProjectManagementRow) => {
		try {
			await deleteProject.mutateAsync(project.id)
			setDeleteTargetProject(null)
			setToastMessage("프로젝트가 삭제되었습니다.")
			setShowToast(true)
		} catch (deleteError) {
			setDeleteTargetProject(null)
			setToastMessage(
				deleteError instanceof Error ? deleteError.message : "프로젝트 삭제에 실패했습니다.",
			)
			setShowToast(true)
		}
	}

	if (isLoading) {
		return <div className="py-[100px] text-center text-black-600">불러오는 중...</div>
	}

	if (error) {
		return <div className="py-[100px] text-center text-black-600">{error.message}</div>
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
							<ActionButton
								variant="primary"
								size="inline"
								onClick={() => setIsCreateDialogOpen(true)}
								className="h-[36px] text-[14px] leading-[24px] tracking-normal"
							>
								새 프로젝트 생성
							</ActionButton>
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
