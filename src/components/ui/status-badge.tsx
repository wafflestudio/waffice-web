import type * as React from "react"
import { cn } from "@/lib/utils"

interface DotStatusBadgeProps extends React.ComponentProps<"div"> {
	dotClassName: string
	children: React.ReactNode
}

function DotStatusBadge({ dotClassName, children, className, ...props }: DotStatusBadgeProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-[6px] text-[14px] font-normal leading-[17px] whitespace-nowrap text-black-900 tracking-[-0.28px]",
				className,
			)}
			{...props}
		>
			<span className={cn("size-[10px] rounded-full", dotClassName)} />
			<span>{children}</span>
		</div>
	)
}

interface TagBadgeProps extends React.ComponentProps<"span"> {
	tone?: "peach" | "neutral"
}

function TagBadge({ tone = "peach", className, ...props }: TagBadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex h-[20px] shrink-0 items-center justify-center rounded-[3px] px-[9px] text-[11px] font-medium leading-[14px]",
				tone === "peach" ? "bg-peach-100 text-peach-500" : "bg-black-100 text-black-700",
				className,
			)}
			{...props}
		/>
	)
}

export { DotStatusBadge, TagBadge }
export type { DotStatusBadgeProps, TagBadgeProps }
