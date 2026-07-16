"use client"

import { Minus } from "lucide-react"
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
	ProjectManagementStatus,
	ProjectManagementStatusFilter,
	ProjectManagementViewMode,
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
	"h-[50px] px-[20px] text-[15px] font-medium tracking-[-0.3px] text-black-900"
const BODY_CELL_CLASS =
	"h-[60px] overflow-hidden px-[20px] text-[15px] font-normal tracking-[-0.3px] text-ellipsis text-black-900"

const STATUS_DOT_CLASS: Record<ProjectManagementStatus, string> = {
	활성화: "bg-[#7aee7f]",
	유지보수: "bg-[#caa8f6]",
	종결: "bg-black-400",
}

function ProjectStatusBadge({ status }: { status: ProjectManagementStatus }) {
	return <DotStatusBadge dotClassName={STATUS_DOT_CLASS[status]}>{status}</DotStatusBadge>
}

function ProjectLinkSummary({ project }: { project: ProjectManagementRow }) {
	return (
		<div className="truncate text-[15px] leading-[1.4] text-black-900">
			{project.links.map((link, index) => (
				<span key={`${project.id}-${link.label}`}>
					<a href={link.url ?? "#project-link"} className="underline underline-offset-[2px]">
						{link.label}({link.count})
					</a>
					{index < project.links.length - 1 && ", "}
				</span>
			))}
		</div>
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
	const filteredProjects = projects
		.filter((project) => statusFilter === "전체" || project.status === statusFilter)
		.filter((project) => {
			const normalizedQuery = searchQuery.trim().toLowerCase()
			if (!normalizedQuery) return true

			const searchableText = [project.name, project.leader, project.members.join(" ")].join(" ")
			return searchableText.toLowerCase().includes(normalizedQuery)
		})

	const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE))
	const paginatedProjects = filteredProjects.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	)
	const showAdminAction = viewMode === "admin"
	const visibleProjects = showPagination ? paginatedProjects : filteredProjects

	return (
		<div className="flex flex-col gap-[20px]">
			<div className="w-full overflow-hidden bg-white">
				<Table className="min-w-[1140px] table-fixed">
					<TableHeader>
						<TableRow className="h-[50px] border-black-300 border-y bg-black-100 hover:bg-black-100">
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[140px]")}>프로젝트 이름</TableHead>
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[100px]")}>팀장</TableHead>
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[80px]")}>팀원 수</TableHead>
							<TableHead className={HEADER_CELL_CLASS}>활동 팀원</TableHead>
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[270px]")}>관련 링크</TableHead>
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[120px]")}>
								<ProjectStatusFilter value={statusFilter} onChange={onStatusFilterChange} />
							</TableHead>
							{showActions && (
								<TableHead className={cn(HEADER_CELL_CLASS, "w-[100px]")}>편집</TableHead>
							)}
						</TableRow>
					</TableHeader>
					<TableBody>
						{visibleProjects.map((project) => (
							<TableRow
								key={project.id}
								className="h-[60px] border-black-300 border-b hover:bg-black-100"
							>
								<TableCell className={cn(BODY_CELL_CLASS, "truncate")}>{project.name}</TableCell>
								<TableCell className={cn(BODY_CELL_CLASS, "truncate")}>{project.leader}</TableCell>
								<TableCell className={BODY_CELL_CLASS}>{project.memberCount}</TableCell>
								<TableCell className={cn(BODY_CELL_CLASS, "max-w-0")}>
									<div className="max-w-[700px] truncate leading-[1.4]">
										{project.members.join(", ")}
									</div>
								</TableCell>
								<TableCell className={cn(BODY_CELL_CLASS, "truncate")}>
									<ProjectLinkSummary project={project} />
								</TableCell>
								<TableCell className={BODY_CELL_CLASS}>
									<ProjectStatusBadge status={project.status} />
								</TableCell>
								{showActions && (
									<TableCell className="h-[60px] w-[100px] px-[20px]">
										<button
											type="button"
											aria-label={
												showAdminAction
													? `${project.name} 프로젝트 삭제`
													: `${project.name} 프로젝트 상세`
											}
											onClick={() => onProjectAction?.(project)}
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
