"use client"

import { Edit, MoreHorizontal, Trash2, Users } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import type { Project, ProjectUpdate } from "@/types"
import { ProjectForm } from "./project-form"

interface ProjectTableProps {
	projects: Project[]
	onUpdate: (id: number, data: ProjectUpdate) => Promise<void>
	onDelete: (id: number) => Promise<void>
}

export function ProjectTable({ projects, onUpdate, onDelete }: ProjectTableProps) {
	const [editingProject, setEditingProject] = useState<Project | null>(null)

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "planning":
				return "secondary"
			case "active":
				return "default"
			case "completed":
				return "outline"
			case "cancelled":
				return "destructive"
			default:
				return "outline"
		}
	}

	const getStatusText = (status: string) => {
		switch (status) {
			case "planning":
				return "기획"
			case "active":
				return "진행중"
			case "completed":
				return "완료"
			case "cancelled":
				return "취소"
			default:
				return status
		}
	}

	const handleEdit = (project: Project) => {
		setEditingProject(project)
	}

	const handleUpdate = async (data: ProjectUpdate) => {
		if (editingProject) {
			await onUpdate(editingProject.id, data)
			setEditingProject(null)
		}
	}

	return (
		<>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>이름</TableHead>
							<TableHead>설명</TableHead>
							<TableHead>예산</TableHead>
							<TableHead>상태</TableHead>
							<TableHead>멤버</TableHead>
							<TableHead>생성일</TableHead>
							<TableHead className="w-[50px]">작업</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{projects.map((project) => (
							<TableRow key={project.id}>
								<TableCell className="font-medium">{project.name}</TableCell>
								<TableCell className="max-w-xs truncate">{project.description || "-"}</TableCell>
								<TableCell>
									{project.budget ? `${project.budget.toLocaleString()}원` : "-"}
								</TableCell>
								<TableCell>
									<Badge variant={getStatusBadgeVariant(project.status)}>
										{getStatusText(project.status)}
									</Badge>
								</TableCell>
								<TableCell>
									<div className="flex items-center space-x-1">
										<Users className="h-4 w-4" />
										<span>{project.members.length}</span>
									</div>
								</TableCell>
								<TableCell>{new Date(project.created_at).toLocaleDateString()}</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => handleEdit(project)}>
												<Edit className="mr-2 h-4 w-4" />
												수정
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => onDelete(project.id)}
												className="text-destructive"
											>
												<Trash2 className="mr-2 h-4 w-4" />
												삭제
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{editingProject && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="bg-background p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
						<h2 className="text-lg font-semibold mb-4">프로젝트 수정</h2>
						<ProjectForm project={editingProject} onSubmit={handleUpdate} />
						<Button
							variant="outline"
							onClick={() => setEditingProject(null)}
							className="mt-4 w-full"
						>
							취소
						</Button>
					</div>
				</div>
			)}
		</>
	)
}
