import { Settings2, X } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"

interface FilterTagProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	label: string
}

function FilterTag({ label, className, type = "button", ...props }: FilterTagProps) {
	return (
		<button
			type={type}
			className={cn(
				"flex h-[33px] items-center gap-[8px] rounded-[3px] bg-peach-100 px-[8px] py-[6px] text-[14px] font-medium text-peach-500 transition-colors hover:bg-peach-100/80",
				className,
			)}
			{...props}
		>
			<span>{label}</span>
			<X className="size-[9px] shrink-0" strokeWidth={2.3} />
		</button>
	)
}

function FilterResetButton({
	className,
	type = "button",
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			type={type}
			className={cn(
				"flex h-[33px] items-center gap-[8px] rounded-[3px] px-[8px] py-[6px] text-[14px] font-medium text-peach-500 underline underline-offset-[2px]",
				className,
			)}
			{...props}
		/>
	)
}

function FilterTagGroup({ className, ...props }: React.ComponentProps<"div">) {
	return <div className={cn("flex items-center gap-[10px]", className)} {...props} />
}

function FilterTrigger({
	className,
	iconClassName,
	children,
	type = "button",
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
	iconClassName?: string
}) {
	return (
		<button
			type={type}
			className={cn(
				"flex size-[16px] items-center justify-center rounded-[3px] text-black-600 transition-colors hover:bg-black-300/40",
				className,
			)}
			{...props}
		>
			{children}
			<Settings2 className={cn("size-[12px]", iconClassName)} strokeWidth={1.8} />
		</button>
	)
}

export { FilterResetButton, FilterTag, FilterTagGroup, FilterTrigger }
export type { FilterTagProps }
