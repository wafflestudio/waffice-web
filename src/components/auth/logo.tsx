import { cn } from "@/lib/utils"

interface LogoProps {
	/** 로고 크기 */
	size?: "sm" | "md" | "lg"
	/** 추가 CSS 클래스 */
	className?: string
}

/**
 * 와플 스튜디오 로고 컴포넌트
 * TODO: 향후 이미지로 교체 예정
 */
function Logo({ size = "md", className }: LogoProps) {
	const sizeClasses = {
		sm: "text-2xl",
		md: "text-4xl",
		lg: "text-5xl",
	}

	return (
		<div className={cn("flex items-center justify-center", className)}>
			<span className={cn(sizeClasses[size])} role="img" aria-label="와플 스튜디오 로고">
				🧇
			</span>
		</div>
	)
}

export { Logo }
