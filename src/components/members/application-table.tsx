"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

interface Application {
	id: number
	name: string
	generation: string
	email: string
	github_username: string
	application_date: string
	status: string
}

interface ApplicationTableProps {
	applications: Application[]
	searchQuery: string
	currentPage: number
	onPageChange: (page: number) => void
	selectedApplications: number[]
	onSelectedApplicationsChange: (selected: number[]) => void
}

const ITEMS_PER_PAGE = 10

type SortOrder = "asc" | "desc" | null

export function ApplicationTable({
	applications,
	searchQuery,
	currentPage,
	onPageChange,
	selectedApplications,
	onSelectedApplicationsChange,
}: ApplicationTableProps) {
	const [generationSort, setGenerationSort] = useState<SortOrder>(null)
	const [dateSort, setDateSort] = useState<SortOrder>(null)

	// 검색 필터링
	const filteredApplications = applications.filter((app) =>
		app.name.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	// 정렬
	let sortedApplications = [...filteredApplications]
	if (generationSort) {
		sortedApplications.sort((a, b) => {
			const comparison = a.generation.localeCompare(b.generation)
			return generationSort === "asc" ? comparison : -comparison
		})
	}
	if (dateSort) {
		sortedApplications.sort((a, b) => {
			const comparison = new Date(a.application_date).getTime() - new Date(b.application_date).getTime()
			return dateSort === "asc" ? comparison : -comparison
		})
	}

	// 페이지네이션
	const totalPages = Math.ceil(sortedApplications.length / ITEMS_PER_PAGE)
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
	const paginatedApplications = sortedApplications.slice(startIndex, startIndex + ITEMS_PER_PAGE)

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			onSelectedApplicationsChange(paginatedApplications.map((app) => app.id))
		} else {
			onSelectedApplicationsChange([])
		}
	}

	const handleSelectApplication = (id: number, checked: boolean) => {
		if (checked) {
			onSelectedApplicationsChange([...selectedApplications, id])
		} else {
			onSelectedApplicationsChange(selectedApplications.filter((appId) => appId !== id))
		}
	}

	const isAllSelected =
		paginatedApplications.length > 0 &&
		paginatedApplications.every((app) => selectedApplications.includes(app.id))

	// 기수 정렬 헤더
	const GenerationSortHeader = () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button type="button" className="flex items-center gap-1 hover:text-foreground">
					기수
					{generationSort && (generationSort === "desc" ? " 🔽" : " 🔼")}
					<ChevronDown className="h-4 w-4" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuItem onClick={() => setGenerationSort("desc")}>내림차순</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setGenerationSort("asc")}>오름차순</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)

	// 가입 신청일 정렬 헤더
	const DateSortHeader = () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button type="button" className="flex items-center gap-1 hover:text-foreground">
					가입 신청일
					{dateSort && (dateSort === "desc" ? " 🔽" : " 🔼")}
					<ChevronDown className="h-4 w-4" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuItem onClick={() => setDateSort("desc")}>내림차순</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setDateSort("asc")}>오름차순</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)

	return (
		<div className="space-y-4">
			{/* 테이블 */}
			<div className="rounded-lg border bg-white">
				<Table>
					<TableHeader>
						<TableRow className="bg-gray-50">
							<TableHead className="w-12">
								<Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
							</TableHead>
							<TableHead>이름</TableHead>
							<TableHead>
								<GenerationSortHeader />
							</TableHead>
							<TableHead>이메일</TableHead>
							<TableHead>Github 아이디</TableHead>
							<TableHead>
								<DateSortHeader />
							</TableHead>
							<TableHead>자격</TableHead>
							<TableHead>승인여부</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedApplications.map((application) => (
							<TableRow key={application.id}>
								<TableCell>
									<Checkbox
										checked={selectedApplications.includes(application.id)}
										onCheckedChange={(checked) =>
											handleSelectApplication(application.id, checked as boolean)
										}
									/>
								</TableCell>
								<TableCell>{application.name}</TableCell>
								<TableCell>{application.generation}</TableCell>
								<TableCell>{application.email}</TableCell>
								<TableCell>{application.github_username}</TableCell>
								<TableCell>{new Date(application.application_date).toLocaleDateString()}</TableCell>
								<TableCell>
									<span className="text-[#FF6B6B]">확인 중</span>
								</TableCell>
								<TableCell>{application.status}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* 페이지네이션 */}
			<div className="flex items-center justify-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(1)}
					disabled={currentPage === 1}
				>
					«
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
				>
					‹
				</Button>

				{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
					let pageNum: number
					if (totalPages <= 5) {
						pageNum = i + 1
					} else if (currentPage <= 3) {
						pageNum = i + 1
					} else if (currentPage >= totalPages - 2) {
						pageNum = totalPages - 4 + i
					} else {
						pageNum = currentPage - 2 + i
					}

					return (
						<Button
							key={pageNum}
							variant={currentPage === pageNum ? "default" : "outline"}
							size="sm"
							onClick={() => onPageChange(pageNum)}
							className={
								currentPage === pageNum
									? "bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
									: ""
							}
						>
							{pageNum}
						</Button>
					)
				})}

				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
				>
					›
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(totalPages)}
					disabled={currentPage === totalPages}
				>
					»
				</Button>
			</div>
		</div>
	)
}
