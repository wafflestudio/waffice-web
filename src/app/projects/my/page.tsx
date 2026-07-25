"use client"

import { Loader2 } from "lucide-react"
import { MyProjectsView } from "@/components/projects/my-projects-view"
import { useMyProjects } from "@/hooks/use-projects"

export default function MyProjectsPage() {
	const { data: projects, isLoading, error } = useMyProjects()

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

	return <MyProjectsView projects={projects ?? []} />
}
