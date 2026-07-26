"use client"

import { Loader2 } from "lucide-react"
import { ReceivedRequestView } from "@/components/activities/received-request-view"
import { Forbidden } from "@/components/error/forbidden"
import { useAuth } from "@/components/providers/auth-provider"

export default function ProjectRequestsPage() {
	const { activeRole, isLoading } = useAuth()

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	const canViewReceivedRequests = ["waffle_leader", "operations"].includes(activeRole)

	if (!canViewReceivedRequests) {
		return (
			<Forbidden message="나에게 온 요청 페이지에 접근할 권한이 없습니다. 운영진 권한이 필요합니다." />
		)
	}

	return <ReceivedRequestView />
}
