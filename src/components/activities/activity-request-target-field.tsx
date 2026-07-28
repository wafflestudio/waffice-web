"use client"

import { cn } from "@/lib/utils"
import type { ReviewTarget } from "@/types"

const REVIEW_TARGET_OPTIONS: { value: ReviewTarget; label: string }[] = [
	{ value: "project_leader", label: "팀장" },
	{ value: "operations", label: "운영팀" },
]

interface ActivityRequestTargetFieldProps {
	value: ReviewTarget
	onChange: (value: ReviewTarget) => void
}

export function ActivityRequestTargetField({ value, onChange }: ActivityRequestTargetFieldProps) {
	return (
		<div className="flex items-center gap-[30px]">
			{REVIEW_TARGET_OPTIONS.map((option) => (
				<button
					key={option.value}
					type="button"
					onClick={() => onChange(option.value)}
					className="flex items-center gap-[8px] text-[14px] font-medium leading-[14px] text-black-900"
				>
					<span
						className={cn(
							"flex size-[16px] items-center justify-center rounded-full border",
							value === option.value ? "border-black-900" : "border-black-400",
						)}
					>
						{value === option.value && <span className="size-[8px] rounded-full bg-black-900" />}
					</span>
					{option.label}
				</button>
			))}
		</div>
	)
}
