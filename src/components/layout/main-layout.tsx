"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth"
import type { UserDetail } from "@/types"
import { Lnb } from "./lnb"

interface MainLayoutProps {
	children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
	const [currentUser, setCurrentUser] = useState<UserDetail | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await authClient.getMe()
				if (response?.ok && response.data?.user) {
					setCurrentUser(response.data.user)
				}
			} catch {
				setCurrentUser(null)
			} finally {
				setIsLoading(false)
			}
		}
		checkAuth()
	}, [])

	return (
		<div className="flex h-screen overflow-hidden bg-white">
			<Lnb user={isLoading ? null : currentUser} />
			<main className="flex-1 overflow-auto bg-white">
				<div className="px-[40px] py-[30px]">{children}</div>
			</main>
		</div>
	)
}
