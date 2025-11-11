"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"

interface ClientProvidersProps {
	children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
	const [queryClient] = useState(() => new QueryClient())
	const pathname = usePathname()

	// 인증(로그인/회원가입) 페이지는 레이아웃 없이 렌더링
	const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/signup")

	return (
		<QueryClientProvider client={queryClient}>
			{isAuthPage ? children : <MainLayout>{children}</MainLayout>}
		</QueryClientProvider>
	)
}
