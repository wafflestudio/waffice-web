import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "로그인 - 와플 스튜디오",
	description: "와플 스튜디오 로그인 페이지",
}

/**
 * 로그인 페이지 전용 레이아웃
 * 사이드바 없이 깔끔한 화면 제공
 */
export default function LoginLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return <>{children}</>
}
