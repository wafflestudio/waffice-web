"use client"

import { Minus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { DotStatusBadge } from "@/components/ui/status-badge"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type {
	ProjectManagementRow,
	ProjectManagementStatusFilter,
	ProjectManagementViewMode,
	ProjectStatus,
} from "@/types"
import { ProjectStatusFilter } from "./project-status-filter"

interface ProjectManagementTableProps {
	projects: ProjectManagementRow[]
	searchQuery: string
	currentPage: number
	onPageChange: (page: number) => void
	statusFilter: ProjectManagementStatusFilter
	onStatusFilterChange: (status: ProjectManagementStatusFilter) => void
	viewMode: ProjectManagementViewMode
	onProjectAction?: (project: ProjectManagementRow) => void
	showActions?: boolean
	showPagination?: boolean
}

const ITEMS_PER_PAGE = 11

const HEADER_CELL_CLASS =
	"h-[40px] px-[15px] text-[14px] font-medium tracking-[-0.28px] text-black-900"
const BODY_CELL_CLASS =
	"h-[50px] overflow-hidden px-[15px] text-[14px] font-normal tracking-[-0.28px] text-ellipsis text-black-900"

const STATUS_DOT_CLASS: Record<ProjectStatus, string> = {
	active: "bg-[#7aee7f]",
	maintenance: "bg-[#caa8f6]",
	ended: "bg-black-400",
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
	active: "활성화",
	maintenance: "유지보수",
	ended: "종결",
}

function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
	return (
		<DotStatusBadge dotClassName={STATUS_DOT_CLASS[status]}>{STATUS_LABEL[status]}</DotStatusBadge>
	)
}

export function ProjectManagementTable({
	projects,
	searchQuery,
	currentPage,
	onPageChange,
	statusFilter,
	onStatusFilterChange,
	viewMode,
	onProjectAction,
	showActions = true,
	showPagination = true,
}: ProjectManagementTableProps) {
	const router = useRouter()
	const filteredProjects = projects
		.filter((project) => statusFilter === "전체" || project.status === statusFilter)
		.filter((project) => {
			const normalizedQuery = searchQuery.trim().toLowerCase()
			if (!normalizedQuery) return true

			const searchableText = [
				project.name,
				project.leader_names.join(" "),
				project.active_member_names.join(" "),
			].join(" ")
			return searchableText.toLowerCase().includes(normalizedQuery)
		})

	const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE))
	const paginatedProjects = filteredProjects.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	)
	const showAdminAction = viewMode === "admin"
	const visibleProjects = showPagination ? paginatedProjects : filteredProjects
	const openProjectDetail = (projectId: number) => {
		router.push(`/projects/detail?projectId=${projectId}`)
	}

	return (
		<div className="flex flex-1 flex-col gap-[20px]">
			<div className="w-full overflow-hidden border-black-300 border-b bg-white">
				<Table className="min-w-[1140px] table-fixed">
					<TableHeader>
						<TableRow className="h-[40px] border-black-300 border-y bg-black-100 hover:bg-black-100">
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[120px]")}>프로젝트 이름</TableHead>
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[80px]")}>팀장</TableHead>
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[80px]")}>팀원 수</TableHead>
							<TableHead className={HEADER_CELL_CLASS}>활동 팀원</TableHead>
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[100px]")}>
								<ProjectStatusFilter value={statusFilter} onChange={onStatusFilterChange} />
							</TableHead>
							{showActions && (
								<TableHead className={cn(HEADER_CELL_CLASS, "w-[80px] px-[20px] text-center")}>
									편집
								</TableHead>
							)}
						</TableRow>
					</TableHeader>
					<TableBody>
						{visibleProjects.map((project) => (
							<TableRow
								key={project.id}
								tabIndex={0}
								role="link"
								aria-label={`${project.name} 프로젝트 상세로 이동`}
								onClick={() => openProjectDetail(project.id)}
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault()
										openProjectDetail(project.id)
									}
								}}
								className="h-[50px] cursor-pointer border-black-300 border-b hover:bg-black-100 focus-visible:bg-black-100 focus-visible:outline-none"
							>
								<TableCell className={cn(BODY_CELL_CLASS, "truncate")}>{project.name}</TableCell>
								<TableCell className={cn(BODY_CELL_CLASS, "truncate")}>
									{project.leader_names.join(", ")}
								</TableCell>
								<TableCell className={BODY_CELL_CLASS}>{project.member_count}</TableCell>
								<TableCell className={cn(BODY_CELL_CLASS, "max-w-0")}>
									<div className="max-w-[700px] truncate leading-[1.4]">
										{project.active_member_names.join(", ")}
									</div>
								</TableCell>
								<TableCell className={BODY_CELL_CLASS}>
									<ProjectStatusBadge status={project.status} />
								</TableCell>
								{showActions && (
									<TableCell className="h-[50px] w-[80px] px-[20px] flex items-center justify-center">
										<button
											type="button"
											aria-label={
												showAdminAction
													? `${project.name} 프로젝트 삭제`
													: `${project.name} 프로젝트 상세`
											}
											onClick={(event) => {
												event.stopPropagation()
												onProjectAction?.(project)
											}}
											className="flex size-[32px] items-center justify-center rounded-[4px] border border-black-900 bg-white text-black-900 hover:bg-black-100"
										>
											<Minus className="size-[16px]" strokeWidth={1.8} />
										</button>
									</TableCell>
								)}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{showPagination && (
				<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
			)}
		</div>
	)
}
