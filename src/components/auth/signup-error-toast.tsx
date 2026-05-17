"use client"

import * as React from "react"

export interface SignupErrorToastProps {
	message: string
	isVisible: boolean
	onClose: () => void
}

export function SignupErrorToast({ message, isVisible, onClose }: SignupErrorToastProps) {
	const onCloseRef = React.useRef(onClose)
	onCloseRef.current = onClose

	const [rendered, setRendered] = React.useState(false)
	const [opacity, setOpacity] = React.useState(false)

	React.useEffect(() => {
		if (isVisible) {
			setRendered(true)
			requestAnimationFrame(() => {
				requestAnimationFrame(() => setOpacity(true))
			})
			const timer = setTimeout(() => {
				setOpacity(false)
			}, 2700)
			return () => clearTimeout(timer)
		} else {
			setOpacity(false)
		}
	}, [isVisible])

	React.useEffect(() => {
		if (!opacity && rendered) {
			const timer = setTimeout(() => {
				setRendered(false)
				onCloseRef.current()
			}, 300)
			return () => clearTimeout(timer)
		}
	}, [opacity, rendered])

	if (!rendered) return null

	return (
		<div
			className="fixed top-[61px] left-1/2 -translate-x-1/2 z-50 transition-opacity duration-300"
			style={{ opacity: opacity ? 1 : 0 }}
		>
			<div className="w-[291px] bg-[#505050] rounded-[10px] px-4 py-5 flex items-center gap-[15px]">
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					aria-hidden="true"
					className="shrink-0"
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
				<span className="text-white text-[17px] leading-[140%] tracking-[-0.02em]">{message}</span>
			</div>
		</div>
	)
}
