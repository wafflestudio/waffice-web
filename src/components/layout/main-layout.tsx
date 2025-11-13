"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "./sidebar"

interface MainLayoutProps {
	children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
	// TODO: 실제 로그인 상태는 API 연결 후 Context나 전역 상태로 관리
	const [isLoggedIn, setIsLoggedIn] = useState(false)

	const handleAuthClick = () => {
		if (isLoggedIn) {
			// TODO: 로그아웃 API 호출
			setIsLoggedIn(false)
		}
		// 로그인은 Link로 페이지 이동
	}

	return (
		<div className="flex h-screen bg-background">
			<Sidebar />
			<main className="flex-1 overflow-auto">
				{/* 헤더 */}
				<header className="border-b bg-white">
					<div className="container mx-auto px-6 py-4 flex justify-end">
						{isLoggedIn ? (
							<Button
								variant="outline"
								onClick={handleAuthClick}
								className="border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white"
							>
								로그아웃
							</Button>
						) : (
							<Link href="/login">
								<Button className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white">로그인</Button>
							</Link>
						)}
					</div>
				</header>

				{/* 페이지 콘텐츠 */}
				<div className="container mx-auto p-6">{children}</div>
			</main>
		</div>
	)
}
