import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"
import { cn } from "@/lib/utils"

const actionButtonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap font-semibold text-[15px] leading-[1.4] tracking-[-0.3px] transition-colors disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-peach-300/50",
	{
		variants: {
			variant: {
				primary: "bg-peach-300 text-white hover:bg-peach-500 active:bg-peach-500",
				secondary: "bg-peach-50 text-peach-500 hover:bg-peach-100",
				tertiary:
					"bg-white border border-black-300 text-black-900 hover:bg-black-300 active:bg-black-300",
			},
			size: {
				lg: "h-[50px] px-[50px] py-[13px] rounded-[4px]",
				sm: "h-[40px] px-[30px] py-[8px] rounded-[4px]",
				inline: "px-[16px] py-[8px] rounded-[3px]",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "lg",
		},
	},
)

type ActionButtonProps = React.ComponentProps<"button"> &
	VariantProps<typeof actionButtonVariants> & {
		asChild?: boolean
	}

function ActionButton({ className, variant, size, asChild = false, ...props }: ActionButtonProps) {
	const Comp = asChild ? Slot : "button"

	return (
		<Comp
			data-slot="action-button"
			className={cn(actionButtonVariants({ variant, size, className }))}
			{...props}
		/>
	)
}

export { ActionButton, actionButtonVariants }
