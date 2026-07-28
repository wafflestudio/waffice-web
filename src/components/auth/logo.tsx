import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
	/** 로고 크기 */
	size?: "sm" | "md" | "lg"
	/** 추가 CSS 클래스 */
	className?: string
}

/**
 * WAFFICE 워드마크 컴포넌트
 */
function Logo({ size = "md", className }: LogoProps) {
	const logoSizes: Record<NonNullable<LogoProps["size"]>, { width: number; height: number }> = {
		sm: { width: 150, height: 32 },
		md: { width: 150, height: 32 },
		lg: { width: 188, height: 40 },
	}

	const { width, height } = logoSizes[size]

	return (
		<div className={cn("flex items-center justify-center", className)}>
			<Image
				src="/auth-logo.svg"
				alt="WAFFICE"
				width={width}
				height={height}
				priority
				className="object-contain"
			/>
		</div>
	)
}

interface LogoMarkProps {
	/** 아이콘 너비(px) */
	width: number
	/** 아이콘 높이(px) */
	height: number
	/** 추가 CSS 클래스 */
	className?: string
}

/**
 * WAFFICE 워드마크 없이 해시 아이콘만 표시하는 컴포넌트 (모바일 화면용)
 */
function LogoMark({ width, height, className }: LogoMarkProps) {
	return (
		<Image
			src="/waffice-mark.svg"
			alt="WAFFICE"
			width={width}
			height={height}
			priority
			className={cn("object-contain", className)}
		/>
	)
}

export { Logo, LogoMark }
