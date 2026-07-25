"use client"

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterRadioItem,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FilterTrigger } from "@/components/ui/filter-tag"
import type { ProjectManagementStatusFilter, ProjectStatus } from "@/types"

export const PROJECT_STATUS_OPTIONS = ["active", "maintenance", "ended"] satisfies ProjectStatus[]

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
	active: "활성화",
	maintenance: "유지보수",
	ended: "종결",
}

interface ProjectStatusFilterProps {
	value: ProjectManagementStatusFilter
	onChange: (value: ProjectManagementStatusFilter) => void
}

export function ProjectStatusFilter({ value, onChange }: ProjectStatusFilterProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<FilterTrigger
					aria-label="운영 상태 필터"
					className="h-auto w-auto gap-[6px] rounded-none p-0 text-[15px] font-medium tracking-[-0.3px] text-black-900 hover:bg-transparent"
					iconClassName="size-[16px]"
				>
					운영 상태
				</FilterTrigger>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-[120px] rounded-[6px] border-black-300 p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
			>
				<DropdownMenuRadioGroup
					value={value}
					onValueChange={(nextValue) => onChange(nextValue as ProjectManagementStatusFilter)}
				>
					<DropdownMenuFilterRadioItem value="전체">전체</DropdownMenuFilterRadioItem>
					{PROJECT_STATUS_OPTIONS.map((status) => (
						<DropdownMenuFilterRadioItem key={status} value={status}>
							{PROJECT_STATUS_LABEL[status]}
						</DropdownMenuFilterRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
