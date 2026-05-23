"use client"

import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterCheckboxItem,
	DropdownMenuFilterRadioItem,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pagination } from "@/components/ui/pagination"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import type { AccessRight, Member, MemberCreate, MemberUpdate } from "@/types"

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
	accessRightsFilter: AccessRight[]
	onAccessRightsFilterChange: (rights: AccessRight[]) => void
}

import { MemberForm } from "@/components/members/member-form"

const ITEMS_PER_PAGE = 10

const DROPDOWN_CONTENT_CLASS =
	"min-w-0 rounded-[6px] border-[#dbdfe0] p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"

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
	accessRightsFilter,
	onAccessRightsFilterChange,
}: MemberTableProps) {
	const ROLE_OPTIONS = ["활동회원", "정회원", "준회원", "미가입"]
	const ENROLLMENT_OPTIONS = ["학부생", "휴학생", "졸업생"]
	const ACCESS_RIGHT_OPTIONS = ["운영진", "팀장"] satisfies AccessRight[]

	// 검색 필터링
	const filteredMembers = members
		.filter((member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()))
		.filter((member) => roleFilter === "전체" || (member.role || "활동회원") === roleFilter)
		.filter((member) => enrollmentFilter === "전체" || member.affiliation === enrollmentFilter)
		.filter((member) =>
			accessRightsFilter.length === 0
				? true
				: accessRightsFilter.some((right) => member.access_rights?.includes(right)),
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
		<div className="space-y-4">
			{/* 테이블 */}
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
								<GenerationSortHeader sort={generationSort} onSortChange={onGenerationSortChange} />
							</TableHead>
							<TableHead className="text-[15px] font-medium text-[#121212] tracking-[-0.3px]">
								이메일
							</TableHead>
							<TableHead className="text-[15px] font-medium text-[#121212] tracking-[-0.3px]">
								Github 아이디
							</TableHead>
							<TableHead className="w-[180px] text-[15px] font-medium text-[#121212] tracking-[-0.3px]">
								계정 생성일
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
											재학여부
											<Settings2 className="h-4 w-4 text-gray-400" />
										</Button>
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
							<TableHead className="w-[140px] text-[15px] font-medium text-[#121212] tracking-[-0.3px]">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="h-8 gap-1 font-medium hover:bg-gray-50 -ml-3"
										>
											접근 권한
											<Settings2 className="h-4 w-4 text-gray-400" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="start"
										className={`w-[140px] ${DROPDOWN_CONTENT_CLASS}`}
									>
										{ACCESS_RIGHT_OPTIONS.map((right) => (
											<DropdownMenuFilterCheckboxItem
												key={right}
												checked={accessRightsFilter.includes(right)}
												onCheckedChange={(checked: boolean) =>
													onAccessRightsFilterChange(
														checked
															? [...accessRightsFilter, right]
															: accessRightsFilter.filter((r) => r !== right),
													)
												}
											>
												{right}
											</DropdownMenuFilterCheckboxItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedMembers.map((member) => {
							const d = new Date(member.join_date)
							const formattedDate = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`

							return (
								<TableRow key={member.id} className="h-[60px]">
									<TableCell>
										<Checkbox
											checked={selectedMembers.includes(member.id)}
											onCheckedChange={(checked) =>
												handleSelectMember(member.id, checked as boolean)
											}
										/>
									</TableCell>
									<TableCell className="w-[140px] text-[15px] font-normal text-[#121212]">
										{onMemberUpdate ? (
											<MemberForm
												member={member}
												onSubmit={(data) => onMemberUpdate(member.id, data)}
												trigger={
													<button type="button" className="text-left font-medium hover:underline">
														{member.name}
													</button>
												}
											/>
										) : (
											member.name
										)}
									</TableCell>
									<TableCell className="w-[140px] text-[15px] font-normal text-[#121212]">
										{member.generation || "-"}
									</TableCell>
									<TableCell className="text-[15px] font-normal text-[#121212]">
										{member.email}
									</TableCell>
									<TableCell className="text-[15px] font-normal text-[#121212]">
										{member.github_username || "-"}
									</TableCell>
									<TableCell className="w-[180px] text-[15px] font-normal text-[#121212]">
										{formattedDate}
									</TableCell>
									<TableCell className="w-[140px] text-[15px] font-normal text-[#121212]">
										{member.role || "활동회원"}
									</TableCell>
									<TableCell className="w-[140px] text-[15px] font-normal text-[#121212]">
										{member.affiliation || "학부생"}
									</TableCell>
									<TableCell className="w-[140px] text-[15px] font-normal text-[#121212]">
										{member.access_rights?.length ? member.access_rights.join(", ") : "없음"}
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
				<Button variant="ghost" size="sm" className="h-8 gap-1 font-medium hover:bg-gray-50 -ml-3">
					기수
					<Settings2 className="h-4 w-4 text-gray-400" />
				</Button>
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
