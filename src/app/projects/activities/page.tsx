"use client"

import { Loader2 } from "lucide-react"
import { AdminActivityHistoryView } from "@/components/activities/admin-activity-history-view"
import { Forbidden } from "@/components/error/forbidden"
import { useAuth } from "@/components/providers/auth-provider"
import { canManageMembers } from "@/lib/permissions"

export default function ProjectsActivitiesPage() {
	const { user, isLoading } = useAuth()

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	if (!canManageMembers(user)) {
		return (
			<Forbidden message="활동 이력 관리 페이지에 접근할 권한이 없습니다. 관리자 권한이 필요합니다." />
		)
	}

	return <AdminActivityHistoryView />
}
