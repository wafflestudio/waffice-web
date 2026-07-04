"use client"

import { X } from "lucide-react"
import type * as React from "react"
import { DialogClose, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface DesignDialogContentProps extends React.ComponentProps<typeof DialogContent> {
	children: React.ReactNode
	showDesignClose?: boolean
	onClose?: () => void
	closeLabel?: string
	closeClassName?: string
}

function DesignDialogContent({
	children,
	className,
	showDesignClose = false,
	onClose,
	closeLabel = "닫기",
	closeClassName,
	showCloseButton = false,
	...props
}: DesignDialogContentProps) {
	return (
		<DialogContent
			showCloseButton={showCloseButton}
			className={cn("gap-0 bg-white p-0", className)}
			{...props}
		>
			{showDesignClose && (
				<DialogClose
					onClick={onClose}
					className={cn(
						"ml-auto flex size-[35px] shrink-0 items-center justify-center text-black-800 transition-colors hover:text-black-900",
						closeClassName,
					)}
				>
					<X className="size-[28px]" strokeWidth={2.4} />
					<span className="sr-only">{closeLabel}</span>
				</DialogClose>
			)}
			{children}
		</DialogContent>
	)
}

export { DesignDialogContent }
export type { DesignDialogContentProps }
