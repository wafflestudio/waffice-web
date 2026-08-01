"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
	visiblePages?: number
	className?: string
}

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
	visiblePages = 5,
	className,
}: PaginationProps) {
	if (totalPages <= 0) return null

	const pages = Array.from({ length: Math.min(visiblePages, totalPages) }, (_, i) => {
		if (totalPages <= visiblePages) return i + 1
		if (currentPage <= Math.ceil(visiblePages / 2)) return i + 1
		if (currentPage >= totalPages - Math.floor(visiblePages / 2))
			return totalPages - visiblePages + 1 + i
		return currentPage - Math.floor(visiblePages / 2) + i
	})

	const isFirst = currentPage === 1
	const isLast = currentPage === totalPages

	return (
		<nav
			aria-label="페이지네이션"
			className={cn("sticky bottom-[30px] flex items-center justify-center gap-[35px] bg-white py-[8px]", className)}
		>
			<div className="flex items-center gap-[18px]">
				<PaginationIconButton
					aria-label="첫 페이지"
					onClick={() => onPageChange(1)}
					disabled={isFirst}
				>
					<ChevronsLeft className="size-[24px]" />
				</PaginationIconButton>
				<PaginationIconButton
					aria-label="이전 페이지"
					onClick={() => onPageChange(Math.max(1, currentPage - 1))}
					disabled={isFirst}
				>
					<ChevronLeft className="size-[24px]" />
				</PaginationIconButton>
			</div>

			<div className="flex items-center gap-[30px]">
				{pages.map((pageNum) => {
					const isActive = pageNum === currentPage
					return (
						<button
							key={pageNum}
							type="button"
							aria-current={isActive ? "page" : undefined}
							onClick={() => onPageChange(pageNum)}
							className={cn(
								"font-medium text-[17px] leading-[1.4] tracking-[-0.34px] transition-colors",
								isActive ? "text-peach-300" : "text-black-400 hover:text-black-600",
							)}
						>
							{pageNum}
						</button>
					)
				})}
			</div>

			<div className="flex items-center gap-[18px]">
				<PaginationIconButton
					aria-label="다음 페이지"
					onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
					disabled={isLast}
				>
					<ChevronRight className="size-[24px]" />
				</PaginationIconButton>
				<PaginationIconButton
					aria-label="마지막 페이지"
					onClick={() => onPageChange(totalPages)}
					disabled={isLast}
				>
					<ChevronsRight className="size-[24px]" />
				</PaginationIconButton>
			</div>
		</nav>
	)
}

function PaginationIconButton({
	children,
	className,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			type="button"
			className={cn(
				"text-black-400 active:text-peach-300 disabled:cursor-not-allowed disabled:text-black-300",
				className,
			)}
			{...props}
		>
			{children}
		</button>
	)
}
