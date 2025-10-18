"use client"

import { Sidebar } from "./sidebar"

interface MainLayoutProps {
	children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
	return (
		<div className="flex h-screen bg-background">
			<Sidebar />
			<main className="flex-1 overflow-auto">
				<div className="container mx-auto p-6">{children}</div>
			</main>
		</div>
	)
}
