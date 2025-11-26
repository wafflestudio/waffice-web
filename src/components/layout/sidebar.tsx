"use client"

import { Logo } from "@/components/auth/logo"
import { Navigation } from "./navigation"

export function Sidebar() {
	return (
		<div className="flex h-full w-64 flex-col border-r bg-background">
			<div className="flex h-16 items-center gap-3 border-b px-6">
				<Logo size="sm" />
				<h1 className="text-xl font-semibold">와플 스튜디오</h1>
			</div>
			<Navigation />
		</div>
	)
}
