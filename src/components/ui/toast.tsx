"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToastProps {
	message: string
	isVisible: boolean
	onClose: () => void
	variant?: "default" | "error"
	positionClassName?: string
}

export function Toast({
	message,
	isVisible,
	onClose,
	variant = "default",
	positionClassName,
}: ToastProps) {
	const onCloseRef = React.useRef(onClose)
	onCloseRef.current = onClose
	const [rendered, setRendered] = React.useState(isVisible)
	const [opacity, setOpacity] = React.useState(false)

	React.useEffect(() => {
		if (variant !== "error" && isVisible) {
			const timer = setTimeout(() => {
				onClose()
			}, 3000) // 3초 후 자동으로 닫힘

			return () => clearTimeout(timer)
		}
	}, [isVisible, onClose, variant])

	React.useEffect(() => {
		if (variant !== "error") return

		if (isVisible) {
			setRendered(true)
			requestAnimationFrame(() => {
				requestAnimationFrame(() => setOpacity(true))
			})
			const timer = setTimeout(() => {
				setOpacity(false)
			}, 2700)
			return () => clearTimeout(timer)
		}

		setOpacity(false)
	}, [isVisible, variant])

	React.useEffect(() => {
		if (variant !== "error" || opacity || !rendered) return

		const timer = setTimeout(() => {
			setRendered(false)
			onCloseRef.current()
		}, 300)
		return () => clearTimeout(timer)
	}, [opacity, rendered, variant])

	if (variant !== "error" && !isVisible) return null

	if (variant === "error") {
		if (!rendered) return null

		return (
			<div
				className={cn(
					"pointer-events-none fixed top-[61px] left-1/2 z-[100] -translate-x-1/2 transition-opacity duration-300",
					positionClassName,
				)}
				style={{ opacity: opacity ? 1 : 0 }}
			>
				<div className="flex items-center gap-[15px] rounded-[10px] bg-black-700 px-[30px] py-[20px]">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true"
						className="size-[20px] shrink-0"
					>
						<circle cx="12" cy="12" r="10" fill="#FFC342" stroke="#FFC342" strokeWidth="2" />
						<line
							x1="12"
							y1="8"
							x2="12"
							y2="13"
							stroke="black"
							strokeWidth="2"
							strokeLinecap="round"
						/>
						<circle cx="12" cy="16" r="1" fill="black" />
					</svg>
					<p className="whitespace-nowrap text-[14px] font-medium leading-[1.4] tracking-[-0.28px] text-white">
						{message}
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
			<div className="pointer-events-auto w-full max-w-[400px] rounded-[12px] border border-black-300 bg-white px-[40px] pt-[30px] pb-[26px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.06)]">
				<div className="flex flex-col items-end gap-[40px]">
					<p className="w-full text-[15px] leading-[1.4] font-medium text-black-900">{message}</p>
					<button
						type="button"
						onClick={onClose}
						className="rounded-[4px] bg-peach-300 px-[30px] py-[8px] text-[15px] font-medium leading-[24px] text-white transition-colors hover:bg-peach-500"
					>
						확인
					</button>
				</div>
			</div>
		</div>
	)
}
