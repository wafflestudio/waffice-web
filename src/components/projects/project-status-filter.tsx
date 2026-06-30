"use client"

import { Settings2 } from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterRadioItem,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ProjectManagementStatus, ProjectManagementStatusFilter } from "@/types"

export const PROJECT_STATUS_OPTIONS = [
	"활성화",
	"유지보수",
	"종결",
] satisfies ProjectManagementStatus[]

interface ProjectStatusFilterProps {
	value: ProjectManagementStatusFilter
	onChange: (value: ProjectManagementStatusFilter) => void
}

export function ProjectStatusFilter({ value, onChange }: ProjectStatusFilterProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-[6px] text-[15px] font-medium tracking-[-0.3px] text-black-900"
				>
					운영 상태
					<Settings2 className="size-[16px]" strokeWidth={1.8} />
				</button>
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
							{status}
						</DropdownMenuFilterRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
