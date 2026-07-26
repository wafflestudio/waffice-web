"use client"

import { Loader2 } from "lucide-react"
import { useMemo } from "react"
import { MyProjectsView } from "@/components/projects/my-projects-view"
import { useAuth } from "@/components/providers/auth-provider"
import { useProjects } from "@/hooks/use-projects"

export default function MyProjectsPage() {
	const { user } = useAuth()
	const { data, isLoading, error } = useProjects(undefined, 100)

	const myProjects = useMemo(
		() => (data?.items ?? []).filter((project) => project.leader_names.includes(user?.name ?? "")),
		[data, user],
	)

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center text-black-600">
				{error.message}
			</div>
		)
	}

	return <MyProjectsView projects={myProjects} />
}
