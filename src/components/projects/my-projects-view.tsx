"use client"

import { useState } from "react"
import type { ProjectManagementRow, ProjectManagementStatusFilter } from "@/types"
import { ProjectManagementTable } from "./project-management-table"

interface MyProjectsViewProps {
	projects: ProjectManagementRow[]
}

export function MyProjectsView({ projects }: MyProjectsViewProps) {
	const [statusFilter, setStatusFilter] = useState<ProjectManagementStatusFilter>("전체")

	// TODO(API): 내 프로젝트 목록 API가 준비되면 상위 page에서 현재 사용자의 프로젝트만 주입.
	return (
		<div className="flex w-full flex-col gap-[40px]">
			<h1 className="text-[36px] font-medium text-black-900 leading-[1.2] tracking-[-0.72px]">
				내 프로젝트 목록
			</h1>

			<section className="flex w-full flex-col gap-[20px]">
				<h2 className="text-[20px] font-semibold text-black-900 leading-[1.3] tracking-[-0.4px]">
					전체 프로젝트 ({projects.length.toString().padStart(2, "0")})
				</h2>

				<ProjectManagementTable
					projects={projects}
					searchQuery=""
					currentPage={1}
					onPageChange={() => undefined}
					statusFilter={statusFilter}
					onStatusFilterChange={setStatusFilter}
					viewMode="member"
					showActions={false}
					showPagination={false}
				/>
			</section>
		</div>
	)
}
