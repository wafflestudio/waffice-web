"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Lnb } from "./lnb"

interface MainLayoutProps {
	children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
	const { user, isLoading } = useAuth()
	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		if (!isLoading && !user) {
			router.replace(`/login?next=${encodeURIComponent(pathname)}`)
		}
	}, [isLoading, pathname, router, user])

	if (isLoading || !user) {
		return null
	}

	return (
		<div className="flex h-screen overflow-hidden bg-white">
			<Lnb />
			<main className="flex-1 overflow-auto bg-white">
				<div className="px-[40px] py-[30px]">{children}</div>
			</main>
		</div>
	)
}
