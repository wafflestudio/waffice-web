"use client"

import { X } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToastStackItem {
	id: string
	message: string
}

interface ToastStackProps {
	items: ToastStackItem[]
	onDismiss: (id: string) => void
	className?: string
}

/**
 * 우측 상단에 알림을 세로로 쌓아 보여주는 토스트 스택.
 * 팀원 명부 업로드처럼 한 요청에서 여러 개별 오류가 함께 내려오는 경우,
 * 상위 메시지 하나 대신 오류마다 하나씩 표시해 각각 닫을 수 있게 하기 위함.
 * 개수 제한 없이 쌓이며, 자동으로 사라지지 않고 X를 눌러야 닫힘.
 */
export function ToastStack({ items, onDismiss, className }: ToastStackProps) {
	if (items.length === 0) return null

	return (
		<div
			className={cn(
				"pointer-events-none fixed top-[20px] right-[20px] z-[100] flex max-h-[calc(100vh-40px)] w-[360px] max-w-[calc(100vw-40px)] flex-col gap-[10px] overflow-y-auto",
				className,
			)}
		>
			{items.map((item) => (
				<ToastStackCard key={item.id} message={item.message} onClose={() => onDismiss(item.id)} />
			))}
		</div>
	)
}

function ToastStackCard({ message, onClose }: { message: string; onClose: () => void }) {
	const [visible, setVisible] = React.useState(false)

	React.useEffect(() => {
		const frame = requestAnimationFrame(() => setVisible(true))
		return () => cancelAnimationFrame(frame)
	}, [])

	return (
		<div
			className={cn(
				"pointer-events-auto flex items-start gap-[12px] rounded-[10px] bg-black-700 px-[20px] py-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.16)] transition-all duration-200",
				visible ? "translate-x-0 opacity-100" : "translate-x-[20px] opacity-0",
			)}
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
				className="mt-[1px] size-[20px] shrink-0"
			>
				<circle cx="12" cy="12" r="10" fill="#FFC342" stroke="#FFC342" strokeWidth="2" />
				<line x1="12" y1="8" x2="12" y2="13" stroke="black" strokeWidth="2" strokeLinecap="round" />
				<circle cx="12" cy="16" r="1" fill="black" />
			</svg>
			<p className="min-w-0 flex-1 break-words text-[14px] font-medium leading-[1.4] tracking-[-0.28px] text-white">
				{message}
			</p>
			<button
				type="button"
				onClick={onClose}
				aria-label="알림 닫기"
				className="flex size-[20px] shrink-0 items-center justify-center rounded-full text-black-400 transition-colors hover:text-white"
			>
				<X className="size-[14px]" strokeWidth={2} />
			</button>
		</div>
	)
}
