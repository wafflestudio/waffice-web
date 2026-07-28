"use client"

import { ApplicationForm } from "@/components/members/application-form"
import { Checkbox } from "@/components/ui/checkbox"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterRadioItem,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FilterTrigger } from "@/components/ui/filter-tag"
import { Pagination } from "@/components/ui/pagination"
import { DotStatusBadge } from "@/components/ui/status-badge"
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
const FILTER_TRIGGER_CLASS =
	"h-auto w-auto gap-[6px] rounded-none p-0 text-[15px] font-medium text-[#121212] hover:bg-transparent"

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
				<FilterTrigger
					aria-label={`${label} 정렬`}
					className={FILTER_TRIGGER_CLASS}
					iconClassName="size-4 text-[#121212]"
				>
					{label}
				</FilterTrigger>
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
	const ROLE_OPTIONS = ["활동회원", "정회원", "준회원", "가입 대기"]
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
			<div className="w-full overflow-hidden border-[#dbdfe0] border-t border-b bg-white">
				<Table className="table-fixed">
					<TableHeader>
						<TableRow className="h-[40px] bg-[#f7f7f7]">
							<TableHead className="h-[40px] w-[56px] px-[20px]">
								<Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
							</TableHead>
							<TableHead className="h-[40px] w-[100px] px-[20px] text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
								이름
							</TableHead>
							<TableHead className="h-[40px] w-[100px] px-[20px] text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
								<SortHeader label="기수" sort={generationSort} onChange={onGenerationSortChange} />
							</TableHead>
							<TableHead className="h-[40px] min-w-0 px-[20px] text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
								이메일
							</TableHead>
							<TableHead className="h-[40px] min-w-0 px-[20px] text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
								Github 아이디
							</TableHead>
							<TableHead className="h-[40px] w-[120px] px-[20px] text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
								<SortHeader label="가입 신청일" sort={dateSort} onChange={onDateSortChange} />
							</TableHead>
							<TableHead className="h-[40px] w-[100px] px-[20px] text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<FilterTrigger
											aria-label="자격 필터"
											className={FILTER_TRIGGER_CLASS}
											iconClassName="size-4 text-[#121212]"
										>
											자격
										</FilterTrigger>
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
							<TableHead className="h-[40px] w-[100px] px-[20px] text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<FilterTrigger
											aria-label="승인여부 필터"
											className={FILTER_TRIGGER_CLASS}
											iconClassName="size-4 text-[#121212]"
										>
											승인여부
										</FilterTrigger>
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
								<TableRow key={application.id} className="h-[50px]">
									<TableCell className="h-[50px] w-[56px] px-[20px]">
										<Checkbox
											checked={selectedApplications.includes(application.id)}
											onCheckedChange={(checked) =>
												handleSelectApplication(application.id, checked as boolean)
											}
										/>
									</TableCell>
									<TableCell className="h-[50px] truncate px-[20px] text-[14px] font-normal text-[#121212] tracking-[-0.28px]">
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
									<TableCell className="h-[50px] truncate px-[20px] text-[14px] font-normal text-[#121212] tracking-[-0.28px]">
										{application.generation || "-"}
									</TableCell>
									<TableCell className="h-[50px] max-w-0 truncate px-[20px] text-[14px] font-normal text-[#121212]">
										{application.email}
									</TableCell>
									<TableCell className="h-[50px] max-w-0 truncate px-[20px] text-[14px] font-normal text-[#121212]">
										{application.github_username || "-"}
									</TableCell>
									<TableCell className="h-[50px] truncate px-[20px] text-[14px] font-normal text-[#121212] tracking-[-0.28px]">
										{formattedDate}
									</TableCell>
									<TableCell className="h-[50px] truncate px-[20px] text-[14px] font-normal text-[#121212] tracking-[-0.28px]">
										{application.role || "가입 대기"}
									</TableCell>
									<TableCell className="h-[50px] truncate px-[20px]">
										<DotStatusBadge
											dotClassName={isPending ? "bg-[#ffd21f]" : "bg-[#84aef1]"}
											className="[&_span:first-child]:size-[8px] text-[14px] tracking-normal"
										>
											{isPending ? "대기" : "승인"}
										</DotStatusBadge>
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</div>

			<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
		</div>
	)
}
