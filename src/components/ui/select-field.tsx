"use client"

import { ChevronDown } from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterRadioItem,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface SelectFieldProps<T extends string> {
	label?: string
	value: T
	options: readonly T[]
	onChange: (value: T) => void
	placeholder?: string
	required?: boolean
	className?: string
	labelClassName?: string
	triggerClassName?: string
	contentClassName?: string
	itemClassName?: string
	indicatorClassName?: string
}

function SelectField<T extends string>({
	label,
	value,
	options,
	onChange,
	placeholder,
	required = false,
	className,
	labelClassName,
	triggerClassName,
	contentClassName,
	itemClassName,
	indicatorClassName,
}: SelectFieldProps<T>) {
	const control = (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className={cn(
						"flex h-[50px] w-[360px] items-center justify-between rounded-[5px] border border-black-300 bg-white p-[16px] text-[15px] font-normal tracking-[-0.3px] text-black-900 outline-none hover:border-black-300 focus-visible:border-peach-300",
						triggerClassName,
					)}
				>
					<span className={cn(!value && "text-black-600")}>{value || placeholder}</span>
					<ChevronDown className="size-[24px] text-black-900" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className={cn(
					"w-[360px] rounded-[5px] border-black-300 p-0 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]",
					contentClassName,
				)}
			>
				<DropdownMenuRadioGroup
					value={value}
					onValueChange={(nextValue) => onChange(nextValue as T)}
				>
					{options.map((option) => (
						<DropdownMenuFilterRadioItem
							key={option}
							value={option}
							className={cn("h-[50px] px-[16px] text-[15px]", itemClassName)}
							indicatorClassName={indicatorClassName}
						>
							{option}
						</DropdownMenuFilterRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)

	if (!label) return control

	return (
		<div className={cn("flex h-[70px] w-[500px] items-center justify-between", className)}>
			<span
				className={cn(
					"flex shrink-0 items-center text-[15px] font-medium tracking-[-0.3px] text-black-900",
					labelClassName,
				)}
			>
				{label}
				{required && <span className="text-[17px] text-red-500">*</span>}
			</span>
			{control}
		</div>
	)
}

export { SelectField }
export type { SelectFieldProps }
