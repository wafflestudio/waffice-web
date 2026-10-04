"use client"

import { useState } from "react"
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { Member, MemberCreate, MemberUpdate, NotificationConsentFilter } from "@/types"
import { MemberDetailDialog } from "./member-detail-dialog"

interface MemberTableProps {
	members: Member[]
	searchQuery: string
	currentPage: number
	onPageChange: (page: number) => void
	selectedMembers: number[]
	onSelectedMembersChange: (members: number[]) => void
	onMemberUpdate?: (id: number, data: MemberCreate | MemberUpdate) => Promise<void>
	generationSort: "desc" | "asc" | null
	onGenerationSortChange: (sort: "desc" | "asc" | null) => void
	roleFilter: string
	onRoleFilterChange: (role: string) => void
	enrollmentFilter: string
	onEnrollmentFilterChange: (status: string) => void
	emailConsentFilter: NotificationConsentFilter
	onEmailConsentFilterChange: (status: NotificationConsentFilter) => void
	smsConsentFilter: NotificationConsentFilter
	onSmsConsentFilterChange: (status: NotificationConsentFilter) => void
}

const ITEMS_PER_PAGE = 10

const DROPDOWN_CONTENT_CLASS =
	"min-w-0 rounded-[6px] border-[#dbdfe0] p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
const HEADER_CELL_CLASS =
	"h-[40px] px-[20px] text-[14px] font-medium text-[#121212] tracking-[-0.28px]"
const BODY_CELL_CLASS =
	"h-[50px] overflow-hidden px-[20px] text-[14px] font-normal text-[#121212] tracking-[-0.28px] text-ellipsis"
const FILTER_TRIGGER_CLASS =
	"h-auto w-auto gap-[6px] rounded-none p-0 text-[15px] font-medium tracking-[-0.3px] text-[#121212] hover:bg-transparent"

const formatCurrentProjects = (member: Member) => {
	const projectNames = member.current_projects?.map((project) => project.name).filter(Boolean) ?? []
	return projectNames.length > 0 ? projectNames.join(", ") : "-"
}

export function MemberTable({
	members,
	searchQuery,
	currentPage,
	onPageChange,
	selectedMembers,
	onSelectedMembersChange,
	onMemberUpdate,
	generationSort,
	onGenerationSortChange,
	roleFilter,
	onRoleFilterChange,
	enrollmentFilter,
	onEnrollmentFilterChange,
	emailConsentFilter,
	onEmailConsentFilterChange,
	smsConsentFilter,
	onSmsConsentFilterChange,
}: MemberTableProps) {
	const ROLE_OPTIONS = ["활동회원", "정회원", "준회원", "가입 대기"]
	const ENROLLMENT_OPTIONS = ["학부생", "휴학생", "졸업생", "대학원생"]
	const CONSENT_OPTIONS: NotificationConsentFilter[] = ["전체", "수신", "미수신"]

	// 회원 상세 페이지 모달
	const [selectedMember, setSelectedMember] = useState<Member | null>(null)

	const handleMemberRowClick = (member: Member) => {
		setSelectedMember(member)
	}

	// 검색 필터링
	const filteredMembers = members
		.filter((member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()))
		.filter((member) => roleFilter === "전체" || (member.role || "활동회원") === roleFilter)
		.filter((member) => enrollmentFilter === "전체" || member.affiliation === enrollmentFilter)
		.filter(
			(member) =>
				emailConsentFilter === "전체" ||
				member.user?.email_notifications_agreed === (emailConsentFilter === "수신"),
		)
		.filter(
			(member) =>
				smsConsentFilter === "전체" ||
				member.user?.sms_notifications_agreed === (smsConsentFilter === "수신"),
		)

	// 기수 정렬
	const sortedMembers = generationSort
		? [...filteredMembers].sort((a, b) => {
				const aGen = a.generation || ""
				const bGen = b.generation || ""
				const comparison = aGen.localeCompare(bGen)
				return generationSort === "asc" ? comparison : -comparison
			})
		: filteredMembers

	// 페이지네이션
	const totalPages = Math.ceil(sortedMembers.length / ITEMS_PER_PAGE)
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
	const paginatedMembers = sortedMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE)

	// 체크박스 핸들링
	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			onSelectedMembersChange(paginatedMembers.map((m) => m.id))
		} else {
			onSelectedMembersChange([])
		}
	}

	const handleSelectMember = (memberId: number, checked: boolean) => {
		if (checked) {
			onSelectedMembersChange([...selectedMembers, memberId])
		} else {
			onSelectedMembersChange(selectedMembers.filter((id) => id !== memberId))
		}
	}

	const isAllSelected =
		paginatedMembers.length > 0 && paginatedMembers.every((m) => selectedMembers.includes(m.id))

	return (
		<div className="flex flex-1 flex-col gap-4">
			{/* 테이블 */}
			<div className="w-full overflow-hidden border-[#dbdfe0] border-t border-b bg-white">
				<Table className="table-fixed" containerClassName="scrollbar-hide">
					<TableHeader>
						<TableRow className="h-[40px] bg-[#f7f7f7] hover:bg-[#f7f7f7]">
							<TableHead className="h-[50px] w-[56px] px-[20px]">
								<Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
							</TableHead>
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[100px]")}>이름</TableHead>
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[100px]")}>
								<GenerationSortHeader sort={generationSort} onSortChange={onGenerationSortChange} />
							</TableHead>
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[160px]")}>소속</TableHead>
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[130px]")}>학번</TableHead>
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[100px]")}>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<FilterTrigger
											aria-label="학적 상태 필터"
											className={FILTER_TRIGGER_CLASS}
											iconClassName="size-4 text-[#121212]"
										>
											학적 상태
										</FilterTrigger>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="start"
										className={`w-[140px] ${DROPDOWN_CONTENT_CLASS}`}
									>
										<DropdownMenuRadioGroup
											value={enrollmentFilter}
											onValueChange={(v) =>
												onEnrollmentFilterChange(v === enrollmentFilter ? "전체" : v)
											}
										>
											{ENROLLMENT_OPTIONS.map((status) => (
												<DropdownMenuFilterRadioItem key={status} value={status}>
													{status}
												</DropdownMenuFilterRadioItem>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableHead>
							<TableHead className={cn(HEADER_CELL_CLASS, "hidden w-[220px] 2xl:table-cell")}>
								소식 수신용 이메일
							</TableHead>
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[175px]")}>활동 프로젝트</TableHead>
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[130px]")}>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<FilterTrigger
											aria-label="수신 여부 필터"
											className={FILTER_TRIGGER_CLASS}
											iconClassName="size-4 text-[#121212]"
										>
											수신 여부
										</FilterTrigger>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="start"
										className={`w-[150px] ${DROPDOWN_CONTENT_CLASS}`}
									>
										<p className="px-[8px] pt-[5px] text-[12px] text-black-500">이메일</p>
										<DropdownMenuRadioGroup
											value={emailConsentFilter}
											onValueChange={(value) =>
												onEmailConsentFilterChange(value as NotificationConsentFilter)
											}
										>
											{CONSENT_OPTIONS.map((option) => (
												<DropdownMenuFilterRadioItem key={`email-${option}`} value={option}>
													{option}
												</DropdownMenuFilterRadioItem>
											))}
										</DropdownMenuRadioGroup>
										<p className="border-black-300 border-t px-[8px] pt-[8px] text-[12px] text-black-500">
											문자
										</p>
										<DropdownMenuRadioGroup
											value={smsConsentFilter}
											onValueChange={(value) =>
												onSmsConsentFilterChange(value as NotificationConsentFilter)
											}
										>
											{CONSENT_OPTIONS.map((option) => (
												<DropdownMenuFilterRadioItem key={`sms-${option}`} value={option}>
													{option}
												</DropdownMenuFilterRadioItem>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableHead>
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[100px]")}>
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
							<TableHead className={cn(HEADER_CELL_CLASS, "w-[120px] text-center")}>
								임시회원 여부
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedMembers.map((member) => {
							const currentProjects = formatCurrentProjects(member)

							return (
								<TableRow
									key={member.id}
									onClick={() => handleMemberRowClick(member)}
									className="h-[50px] cursor-pointer hover:bg-black-100"
								>
									<TableCell
										className="h-[50px] w-[56px] px-[20px]"
										onClick={(event) => event.stopPropagation()}
									>
										<Checkbox
											checked={selectedMembers.includes(member.id)}
											onCheckedChange={(checked) =>
												handleSelectMember(member.id, checked as boolean)
											}
										/>
									</TableCell>
									<TableCell className={cn(BODY_CELL_CLASS, "truncate")}>{member.name}</TableCell>
									<TableCell className={cn(BODY_CELL_CLASS, "truncate")}>
										{member.generation || "-"}
									</TableCell>
									<TableCell className={cn(BODY_CELL_CLASS, "truncate")}>
										{member.department || "-"}
									</TableCell>
									<TableCell className={cn(BODY_CELL_CLASS, "truncate")}>
										{member.student_id || "-"}
									</TableCell>
									<TableCell className={cn(BODY_CELL_CLASS, "truncate")}>
										{member.affiliation || "학부생"}
									</TableCell>
									<TableCell
										className={cn(BODY_CELL_CLASS, "hidden max-w-0 truncate 2xl:table-cell")}
									>
										{member.email}
									</TableCell>
									<TableCell className={cn(BODY_CELL_CLASS, "truncate")} title={currentProjects}>
										{currentProjects}
									</TableCell>
									<TableCell className={cn(BODY_CELL_CLASS, "text-[12px] leading-[1.3]")}>
										<div>이메일 {member.user?.email_notifications_agreed ? "Y" : "N"}</div>
										<div>문자 {member.user?.sms_notifications_agreed ? "Y" : "N"}</div>
									</TableCell>
									<TableCell className={cn(BODY_CELL_CLASS, "truncate")}>
										{member.role || "활동회원"}
									</TableCell>
									<TableCell className={cn(BODY_CELL_CLASS, "truncate text-center")}>
										{member.is_temporary ? "Y" : "N"}
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</div>

			<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

			<MemberDetailDialog
				member={selectedMember}
				open={selectedMember !== null}
				onMemberUpdate={onMemberUpdate}
				onOpenChange={(open) => {
					if (!open) {
						setSelectedMember(null)
					}
				}}
			/>
		</div>
	)
}

// 기수 정렬 헤더 컴포넌트
function GenerationSortHeader({
	sort,
	onSortChange,
}: {
	sort: "desc" | "asc" | null
	onSortChange: (sort: "desc" | "asc" | null) => void
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<FilterTrigger
					aria-label="기수 정렬"
					className={FILTER_TRIGGER_CLASS}
					iconClassName="size-4 text-[#121212]"
				>
					기수
				</FilterTrigger>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className={`w-[140px] ${DROPDOWN_CONTENT_CLASS}`}>
				<DropdownMenuRadioGroup
					value={sort ?? ""}
					onValueChange={(v) => onSortChange(v === sort ? null : (v as "desc" | "asc"))}
				>
					<DropdownMenuFilterRadioItem value="desc">내림차순</DropdownMenuFilterRadioItem>
					<DropdownMenuFilterRadioItem value="asc">오름차순</DropdownMenuFilterRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
