"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings2 } from "lucide-react"
import { ApplicationForm } from "@/components/members/application-form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterRadioItem,
	DropdownMenuRadioGroup,
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
	role: string
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
	generationSort: SortOrder
	onGenerationSortChange: (s: SortOrder) => void
	dateSort: SortOrder
	onDateSortChange: (s: SortOrder) => void
	roleFilter: string
	onRoleFilterChange: (v: string) => void
	statusFilter: string
	onStatusFilterChange: (v: string) => void
}

const ITEMS_PER_PAGE = 10
const DROPDOWN_CONTENT_CLASS =
	"min-w-0 rounded-[6px] border-[#dbdfe0] p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"

type SortOrder = "asc" | "desc" | null

function SortHeader({
	label,
	sort,
	onChange,
}: {
	label: string
	sort: SortOrder
	onChange: (s: SortOrder) => void
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="h-8 gap-1 font-medium hover:bg-gray-50 -ml-3">
					{label}
					<Settings2 className="h-4 w-4 text-gray-400" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className={`w-[140px] ${DROPDOWN_CONTENT_CLASS}`}>
				<DropdownMenuRadioGroup
					value={sort ?? ""}
					onValueChange={(v) => onChange(v === sort ? null : (v as SortOrder))}
				>
					<DropdownMenuFilterRadioItem value="desc">내림차순</DropdownMenuFilterRadioItem>
					<DropdownMenuFilterRadioItem value="asc">오름차순</DropdownMenuFilterRadioItem>
				</DropdownMenuRadioGroup>
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
	generationSort,
	onGenerationSortChange,
	dateSort,
	onDateSortChange,
	roleFilter,
	onRoleFilterChange,
	statusFilter,
	onStatusFilterChange,
}: ApplicationTableProps) {
	const ROLE_OPTIONS = ["활동회원", "정회원", "준회원", "미가입"]
	const STATUS_OPTIONS = ["대기", "승인"]

	const filteredApplications = applications
		.filter((app) => app.name.toLowerCase().includes(searchQuery.toLowerCase()))
		.filter((app) => roleFilter === "전체" || app.role === roleFilter)
		.filter((app) => statusFilter === "전체" || app.status === statusFilter)

	const sortedApplications = [...filteredApplications].sort((a, b) => {
		if (generationSort && dateSort) {
			const genComp = a.generation.localeCompare(b.generation)
			if (genComp !== 0) return generationSort === "asc" ? genComp : -genComp
			const dateComp =
				new Date(a.application_date).getTime() - new Date(b.application_date).getTime()
			return dateSort === "asc" ? dateComp : -dateComp
		}
		if (generationSort) {
			const genComp = a.generation.localeCompare(b.generation)
			return generationSort === "asc" ? genComp : -genComp
		}
		if (dateSort) {
			const dateComp =
				new Date(a.application_date).getTime() - new Date(b.application_date).getTime()
			return dateSort === "asc" ? dateComp : -dateComp
		}
		return 0
	})

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
			<div className="bg-white border-[#dbdfe0] border-t border-b overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="bg-[#f7f7f7]">
							<TableHead className="w-12">
								<Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
							</TableHead>
							<TableHead className="w-[140px] text-[15px] font-medium text-[#121212] tracking-[-0.3px]">
								이름
							</TableHead>
							<TableHead className="w-[140px] text-[15px] font-medium text-[#121212] tracking-[-0.3px]">
								<SortHeader label="기수" sort={generationSort} onChange={onGenerationSortChange} />
							</TableHead>
							<TableHead className="text-[15px] font-medium text-[#121212] tracking-[-0.3px]">
								이메일
							</TableHead>
							<TableHead className="text-[15px] font-medium text-[#121212] tracking-[-0.3px]">
								Github 아이디
							</TableHead>
							<TableHead className="w-[180px] text-[15px] font-medium text-[#121212] tracking-[-0.3px]">
								<SortHeader label="가입 신청일" sort={dateSort} onChange={onDateSortChange} />
							</TableHead>
							<TableHead className="w-[140px] text-[15px] font-medium text-[#121212] tracking-[-0.3px]">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="h-8 gap-1 font-medium hover:bg-gray-50 -ml-3"
										>
											자격
											<Settings2 className="h-4 w-4 text-gray-400" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="start"
										className={`w-[140px] ${DROPDOWN_CONTENT_CLASS}`}
									>
										<DropdownMenuRadioGroup
											value={roleFilter}
											onValueChange={(v) => onRoleFilterChange(v === roleFilter ? "전체" : v)}
										>
											{ROLE_OPTIONS.map((role) => (
												<DropdownMenuFilterRadioItem key={role} value={role}>
													{role}
												</DropdownMenuFilterRadioItem>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableHead>
							<TableHead className="w-[140px] text-[15px] font-medium text-[#121212] tracking-[-0.3px]">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="h-8 gap-1 font-medium hover:bg-gray-50 -ml-3"
										>
											승인여부
											<Settings2 className="h-4 w-4 text-gray-400" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="start"
										className={`w-[140px] ${DROPDOWN_CONTENT_CLASS}`}
									>
										<DropdownMenuRadioGroup
											value={statusFilter}
											onValueChange={(v) => onStatusFilterChange(v === statusFilter ? "전체" : v)}
										>
											{STATUS_OPTIONS.map((s) => (
												<DropdownMenuFilterRadioItem key={s} value={s}>
													{s}
												</DropdownMenuFilterRadioItem>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedApplications.map((application) => {
							const d = new Date(application.application_date)
							const formattedDate = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
							const isPending = application.status === "대기" || application.status === "pending"

							return (
								<TableRow key={application.id} className="h-[60px]">
									<TableCell>
										<Checkbox
											checked={selectedApplications.includes(application.id)}
											onCheckedChange={(checked) =>
												handleSelectApplication(application.id, checked as boolean)
											}
										/>
									</TableCell>
									<TableCell className="w-[140px] text-[15px] font-normal text-[#121212]">
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
									<TableCell className="w-[140px] text-[15px] font-normal text-[#121212]">
										{application.generation || "-"}
									</TableCell>
									<TableCell className="text-[15px] font-normal text-[#121212]">
										{application.email}
									</TableCell>
									<TableCell className="text-[15px] font-normal text-[#121212]">
										{application.github_username || "-"}
									</TableCell>
									<TableCell className="w-[180px] text-[15px] font-normal text-[#121212]">
										{formattedDate}
									</TableCell>
									<TableCell className="w-[140px] text-[15px] font-normal text-[#121212]">
										{application.role || "미가입"}
									</TableCell>
									<TableCell className="w-[140px]">
										<div className="flex items-center gap-[6px]">
											<span
												className={`size-[8px] rounded-full shrink-0 ${isPending ? "bg-[#ffd21f]" : "bg-[#84aef1]"}`}
											/>
											<span className="text-[15px] font-normal text-[#121212]">
												{isPending ? "대기" : "승인"}
											</span>
										</div>
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</div>

			{/* 페이지네이션 */}
			<div className="flex items-center justify-center gap-[30px]">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onPageChange(1)}
					disabled={currentPage === 1}
				>
					<ChevronsLeft className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onPageChange(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
				>
					<ChevronLeft className="h-4 w-4" />
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
							variant="ghost"
							size="sm"
							onClick={() => onPageChange(pageNum)}
							className={
								currentPage === pageNum
									? "text-[#f77153] font-medium"
									: "text-[#b4b4b4] font-medium"
							}
						>
							{pageNum}
						</Button>
					)
				})}

				<Button
					variant="ghost"
					size="sm"
					onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onPageChange(totalPages)}
					disabled={currentPage === totalPages}
				>
					<ChevronsRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}
