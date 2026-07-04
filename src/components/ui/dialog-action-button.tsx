import type * as React from "react"
import { cn } from "@/lib/utils"

type DialogActionButtonVariant = "confirm" | "cancel" | "danger"
type DialogActionButtonSize = "default" | "sm"

interface DialogActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: DialogActionButtonVariant
	size?: DialogActionButtonSize
}

const BASE_CLASS =
	"inline-flex items-center justify-center rounded-[4px] text-[15px] leading-[24px] whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60"

const VARIANT_CLASS: Record<DialogActionButtonVariant, string> = {
	confirm: "bg-peach-300 font-semibold text-white hover:bg-peach-500 active:bg-peach-500",
	cancel:
		"border border-black-300 bg-white font-semibold text-black-900 hover:bg-black-300 active:bg-black-300",
	danger: "bg-[#ffeaea] font-semibold text-[#f44949] hover:bg-[#ffdada] active:bg-[#ffd0d0]",
}

const SIZE_CLASS: Record<DialogActionButtonSize, string> = {
	default: "h-[50px] w-[121px]",
	sm: "h-[40px] px-[30px] font-medium",
}

function DialogActionButton({
	variant = "confirm",
	size = "default",
	className,
	type = "button",
	...props
}: DialogActionButtonProps) {
	return (
		<button
			type={type}
			className={cn(BASE_CLASS, VARIANT_CLASS[variant], SIZE_CLASS[size], className)}
			{...props}
		/>
	)
}

export { DialogActionButton }
export type { DialogActionButtonProps, DialogActionButtonSize, DialogActionButtonVariant }
