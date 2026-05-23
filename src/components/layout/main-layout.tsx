"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth"
import { Gnb } from "./gnb"
import { Lnb } from "./lnb"

interface MainLayoutProps {
	children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
	const router = useRouter()
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await authClient.getMe()
				if (response) {
					setIsLoggedIn(true)
				}
			} catch {
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

	return (
		<div className="flex h-screen flex-col bg-background">
			{!isLoading && <Gnb isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
			<div className="flex flex-1 overflow-hidden">
				<Lnb />
				<main className="flex-1 overflow-auto">
					<div className="px-[50px] py-[40px]">{children}</div>
				</main>
			</div>
		</div>
	)
}
