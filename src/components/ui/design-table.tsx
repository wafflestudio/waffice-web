import type * as React from "react"
import { cn } from "@/lib/utils"

function DesignTable({ className, ...props }: React.ComponentProps<"table">) {
	return <table className={cn("table-fixed border-collapse", className)} {...props} />
}

function DesignTableHeaderRow({ className, ...props }: React.ComponentProps<"tr">) {
	return (
		<tr className={cn("h-[40px] border-black-300 border-y bg-black-100", className)} {...props} />
	)
}

function DesignTableRow({ className, ...props }: React.ComponentProps<"tr">) {
	return (
		<tr
			className={cn(
				"border-black-300 border-b text-[14px] text-black-900 transition-colors hover:bg-black-100",
				className,
			)}
			{...props}
		/>
	)
}

function DesignTableHeaderCell({ className, ...props }: React.ComponentProps<"th">) {
	return (
		<th
			className={cn(
				"overflow-hidden px-[20px] text-left text-[14px] font-medium leading-[17px] whitespace-nowrap text-black-900 text-ellipsis tracking-[-0.28px]",
				className,
			)}
			{...props}
		/>
	)
}

function DesignTableBodyCell({ className, ...props }: React.ComponentProps<"td">) {
	return (
		<td
			className={cn("overflow-hidden px-[20px] align-middle whitespace-nowrap", className)}
			{...props}
		/>
	)
}

export {
	DesignTable,
	DesignTableBodyCell,
	DesignTableHeaderCell,
	DesignTableHeaderRow,
	DesignTableRow,
}
