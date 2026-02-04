"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth"
import { Sidebar } from "./sidebar"

interface MainLayoutProps {
	children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
	const router = useRouter()
	const pathname = usePathname()
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await authClient.getMe()
				// API 응답이 성공적으로 오면 로그인된 상태
				// authClient.getMe()는 실패 시 에러를 throw함
				if (response) {
					setIsLoggedIn(true)
				}
			} catch {
				// 인증 실패 (401 등) - 로그인 안된 상태
				setIsLoggedIn(false)
			} finally {
				setIsLoading(false)
			}
		}
		checkAuth()
	}, [])

	const handleLogout = async () => {
		try {
			await authClient.logout()
			setIsLoggedIn(false)
			router.push("/login")
		} catch (err) {
			console.error("로그아웃 실패:", err)
		}
	}

	const isMyPage = pathname === "/mypage"

	return (
		<div className="flex h-screen bg-background">
			<Sidebar />
			<main className="flex-1 overflow-auto">
				{/* 헤더 */}
				<header className="border-b bg-white">
					<div className="container mx-auto px-6 py-4 flex justify-end items-center gap-4">
						{!isLoading &&
							(isLoggedIn ? (
								<>
									<Button variant="ghost" onClick={handleLogout}>
										로그아웃
									</Button>
									<Link href="/mypage">
										<Button variant="ghost" className={isMyPage ? "text-[#FF6B6B]" : ""}>
											마이페이지
										</Button>
									</Link>
								</>
							) : (
								<Link href="/login">
									<Button className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white">로그인</Button>
								</Link>
							))}
					</div>
				</header>

				{/* 페이지 콘텐츠 */}
				<div className="container mx-auto p-6">{children}</div>
			</main>
		</div>
	)
}
