"use client"

import { ChevronDown } from "lucide-react"
import { useMemo } from "react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterCheckboxItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useProjectMembers } from "@/hooks/use-projects"

// TODO(backend): reviewer_ids에 매핑할 값. 현재는 UI만 구현되어 있고 제출 로직에는 연결되지 않음.
// 운영팀/팀장을 enum으로 받는 백엔드 스펙이 확정되면 실제 reviewer_ids 매핑을 붙인다.
export const OPS_TEAM_LABEL = "와플스튜디오 운영팀"

interface ActivityRequestTargetFieldProps {
	projectId: number | null
	value: string[]
	onChange: (value: string[]) => void
}

export function ActivityRequestTargetField({
	projectId,
	value,
	onChange,
}: ActivityRequestTargetFieldProps) {
	const membersQuery = useProjectMembers(projectId, { status: "active", limit: 100 })
	const leaderNames = useMemo(
		() =>
			(membersQuery.data?.items ?? [])
				.filter((member) => member.role === "leader")
				.map((member) => `${member.user.name}(팀장)`),
		[membersQuery.data],
	)
	const options = useMemo(() => [...leaderNames, OPS_TEAM_LABEL], [leaderNames])

	const toggleOption = (option: string) => {
		if (value.includes(option)) {
			onChange(value.filter((item) => item !== option))
		} else {
			onChange([...value, option])
		}
	}

	const label = value.length > 0 ? value.join(", ") : "요청대상을 선택해주세요"

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex h-[42px] w-[300px] items-center justify-between gap-[8px] rounded-[6px] border border-black-300 bg-white px-[10px] text-[14px] tracking-[-0.28px] text-black-900 outline-none focus-visible:border-peach-300"
				>
					<span className="truncate">{value.length > 0 ? label : label}</span>
					<ChevronDown className="size-[20px] shrink-0 text-black-900" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="z-[70] w-[300px] rounded-[6px] border-black-300 p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
			>
				{options.map((option) => (
					<DropdownMenuFilterCheckboxItem
						key={option}
						checked={value.includes(option)}
						onCheckedChange={() => toggleOption(option)}
						onSelect={(event) => event.preventDefault()}
					>
						{option}
					</DropdownMenuFilterCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
