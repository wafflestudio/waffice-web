"use client"

import * as React from "react"

export interface ToastProps {
	message: string
	isVisible: boolean
	onClose: () => void
}

export function Toast({ message, isVisible, onClose }: ToastProps) {
	React.useEffect(() => {
		if (isVisible) {
			const timer = setTimeout(() => {
				onClose()
			}, 3000) // 3초 후 자동으로 닫힘

			return () => clearTimeout(timer)
		}
	}, [isVisible, onClose])

	if (!isVisible) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
			<div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4 pointer-events-auto">
				<div className="flex flex-col items-center gap-4">
					<p className="text-center text-sm text-gray-800">{message}</p>
					<button
						type="button"
						onClick={onClose}
						className="px-6 py-2 bg-[#FF6B6B] hover:bg-[#FF5252] text-white text-sm rounded transition-colors"
					>
						확인
					</button>
				</div>
			</div>
		</div>
	)
}
