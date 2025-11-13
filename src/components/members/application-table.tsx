"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { ApplicationForm } from "@/components/members/application-form"
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
	onApprove?: (id: number, role: string) => void
	onReject?: (id: number) => void
}

const ITEMS_PER_PAGE = 10

type SortOrder = "asc" | "desc" | null

// 기수 정렬 헤더 (파일 상단에 위치하여 재생성 방지)
function GenerationSortHeader({
	generationSort,
	onChange,
}: {
	generationSort: SortOrder
	onChange: (s: SortOrder) => void
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button type="button" className="flex items-center gap-1 hover:text-foreground">
					기수
					{generationSort && (generationSort === "desc" ? " 🔽" : " 🔼")}
					<ChevronDown className="h-4 w-4" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuItem onClick={() => onChange("desc")}>내림차순</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onChange("asc")}>오름차순</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

// 가입 신청일 정렬 헤더
function DateSortHeader({
	dateSort,
	onChange,
}: {
	dateSort: SortOrder
	onChange: (s: SortOrder) => void
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button type="button" className="flex items-center gap-1 hover:text-foreground">
					가입 신청일
					{dateSort && (dateSort === "desc" ? " 🔽" : " 🔼")}
					<ChevronDown className="h-4 w-4" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuItem onClick={() => onChange("desc")}>내림차순</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onChange("asc")}>오름차순</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export function ApplicationTable({
	applications,
	searchQuery,
	currentPage,
	onPageChange,
	selectedApplications,
	onSelectedApplicationsChange,
	onApprove,
	onReject,
}: ApplicationTableProps) {
	const [generationSort, setGenerationSort] = useState<SortOrder>(null)
	const [dateSort, setDateSort] = useState<SortOrder>(null)

	// 검색 필터링
	const filteredApplications = applications.filter((app) =>
		app.name.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	// 정렬 (mutual exclusion: 한 번에 하나의 정렬만 활성화)
	const sortedApplications = [...filteredApplications].sort((a, b) => {
		// 두 정렬이 모두 설정된 경우, 기수로 먼저 정렬 후 날짜로 정렬
		if (generationSort && dateSort) {
			const genComp = a.generation.localeCompare(b.generation)
			if (genComp !== 0) {
				return generationSort === "asc" ? genComp : -genComp
			}
			const dateComp =
				new Date(a.application_date).getTime() - new Date(b.application_date).getTime()
			return dateSort === "asc" ? dateComp : -dateComp
		}
		// 기수 정렬만
		if (generationSort) {
			const genComp = a.generation.localeCompare(b.generation)
			return generationSort === "asc" ? genComp : -genComp
		}
		// 날짜 정렬만
		if (dateSort) {
			const dateComp =
				new Date(a.application_date).getTime() - new Date(b.application_date).getTime()
			return dateSort === "asc" ? dateComp : -dateComp
		}
		return 0
	})

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
								<GenerationSortHeader
									generationSort={generationSort}
									onChange={setGenerationSort}
								/>
							</TableHead>
							<TableHead>이메일</TableHead>
							<TableHead>Github 아이디</TableHead>
							<TableHead>
								<DateSortHeader dateSort={dateSort} onChange={setDateSort} />
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
								<TableCell>
									{onApprove || onReject ? (
										<ApplicationForm
											application={application}
											trigger={
												<button type="button" className="text-left hover:underline">
													{application.name}
												</button>
											}
											onApprove={(id, role) => onApprove?.(id, role)}
											onReject={(id) => onReject?.(id)}
										/>
									) : (
										application.name
									)}
								</TableCell>
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
								currentPage === pageNum ? "bg-[#FF6B6B] hover:bg-[#FF5252] text-white" : ""
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
