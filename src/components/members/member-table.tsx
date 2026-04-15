"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
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
import type { AccessRight, Member, MemberCreate, MemberUpdate } from "@/types"

interface MemberTableProps {
	members: Member[]
	searchQuery: string
	currentPage: number
	onPageChange: (page: number) => void
	selectedMembers: number[]
	onSelectedMembersChange: (members: number[]) => void
	onMemberUpdate?: (id: number, data: MemberCreate | MemberUpdate) => Promise<void>
}

import { MemberForm } from "@/components/members/member-form"

const ITEMS_PER_PAGE = 10

// 멤버 테이블 드롭다운 공통 스타일
const DROPDOWN_CONTENT_CLASS =
	"min-w-0 rounded-[6px] border-[#dbdfe0] p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
const DROPDOWN_RADIO_ITEM_CLASS =
	"text-[14px] font-medium text-[#777] data-[state=checked]:text-[#e75010] cursor-pointer"
const DROPDOWN_CHECKBOX_ITEM_CLASS =
	"text-[14px] font-medium text-[#777] data-[state=checked]:text-[#e75010] cursor-pointer"

export function MemberTable({
	members,
	searchQuery,
	currentPage,
	onPageChange,
	selectedMembers,
	onSelectedMembersChange,
	onMemberUpdate,
}: MemberTableProps) {
	const [generationSort, setGenerationSort] = useState<"desc" | "asc" | null>(null)
	const [roleFilter, setRoleFilter] = useState<string>("전체")
	const [enrollmentFilter, setEnrollmentFilter] = useState<string>("전체")
	const [accessRightsFilter, setAccessRightsFilter] = useState<AccessRight[]>([])

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
				: accessRightsFilter.every((right) => member.access_rights?.includes(right)),
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
								<GenerationSortHeader sort={generationSort} onSortChange={setGenerationSort} />
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
											onValueChange={(v) => setRoleFilter(v === roleFilter ? "전체" : v)}
										>
											{ROLE_OPTIONS.map((role) => (
												<DropdownMenuRadioItem
													key={role}
													value={role}
													className={DROPDOWN_RADIO_ITEM_CLASS}
												>
													{role}
												</DropdownMenuRadioItem>
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
												setEnrollmentFilter(v === enrollmentFilter ? "전체" : v)
											}
										>
											{ENROLLMENT_OPTIONS.map((status) => (
												<DropdownMenuRadioItem
													key={status}
													value={status}
													className={DROPDOWN_RADIO_ITEM_CLASS}
												>
													{status}
												</DropdownMenuRadioItem>
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
											<DropdownMenuCheckboxItem
												key={right}
												checked={accessRightsFilter.includes(right)}
												className={DROPDOWN_CHECKBOX_ITEM_CLASS}
												onCheckedChange={(checked) =>
													setAccessRightsFilter((prev) =>
														checked ? [...prev, right] : prev.filter((r) => r !== right),
													)
												}
											>
												{right}
											</DropdownMenuCheckboxItem>
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
					<DropdownMenuRadioItem value="desc" className={DROPDOWN_RADIO_ITEM_CLASS}>
						내림차순
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="asc" className={DROPDOWN_RADIO_ITEM_CLASS}>
						오름차순
					</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
