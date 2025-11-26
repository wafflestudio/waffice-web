import Image from "next/image"

import WaffleLogo from "../../../public/WAFFLE_logo.png"
import { cn } from "@/lib/utils"

interface LogoProps {
	/** 로고 크기 */
	size?: "sm" | "md" | "lg"
	/** 추가 CSS 클래스 */
	className?: string
}

/**
 * 와플 스튜디오 로고 컴포넌트
 */
function Logo({ size = "md", className }: LogoProps) {
	const logoSizes: Record<NonNullable<LogoProps["size"]>, { width: number; height: number }> = {
		sm: { width: 24, height: 26 },
		md: { width: 39, height: 41 },
		lg: { width: 54, height: 57 },
	}

	const { width, height } = logoSizes[size]

	return (
		<div className={cn("flex items-center justify-center", className)}>
			<Image
				src={WaffleLogo}
				alt="와플 스튜디오 로고"
				width={width}
				height={height}
				priority
			/>
		</div>
	)
}

export { Logo }
