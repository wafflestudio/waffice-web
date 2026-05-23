import { Search } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"

type SearchInputProps = Omit<React.ComponentProps<"input">, "type"> & {
	containerClassName?: string
}

function SearchInput({ className, containerClassName, ...props }: SearchInputProps) {
	return (
		<div
			className={cn(
				"flex h-[40px] items-center gap-[16px] rounded-[3px] border border-black-300 bg-white px-[8px] py-[4px]",
				"focus-within:border-peach-300",
				containerClassName,
			)}
		>
			<Search className="size-[20px] shrink-0 text-black-400" strokeWidth={1.5} />
			<input
				type="text"
				data-slot="search-input"
				className={cn(
					"w-full min-w-0 bg-transparent text-[13px] leading-[1.4] tracking-[-0.26px] text-black-900 outline-none placeholder:text-black-400 disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				{...props}
			/>
		</div>
	)
}

export { SearchInput }
