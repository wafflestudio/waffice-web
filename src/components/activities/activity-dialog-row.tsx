import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ActivityDialogRowProps {
	label: string
	children: ReactNode
	className?: string
	labelClassName?: string
}

export function ActivityDialogRow({
	label,
	children,
	className,
	labelClassName,
}: ActivityDialogRowProps) {
	return (
		<div className={cn("flex w-full flex-col items-start gap-[10px] sm:flex-row", className)}>
			<div
				className={cn(
					"flex w-full shrink-0 items-center pt-[3px] text-[14px] font-medium tracking-[-0.28px] text-black-900 sm:w-[110px]",
					labelClassName,
				)}
			>
				{label}
			</div>
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	)
}
