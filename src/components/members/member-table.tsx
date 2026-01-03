"use client"

import { Check, ChevronDown } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
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
	const ACCESS_RIGHT_OPTIONS = ["운영진", "팀장"]

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
			<div className="rounded-lg border bg-white">
				<Table>
					<TableHeader>
						<TableRow className="bg-gray-50">
							<TableHead className="w-12">
								<Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
							</TableHead>
							<TableHead>이름</TableHead>
							<TableHead>
								<GenerationSortHeader sort={generationSort} onSortChange={setGenerationSort} />
							</TableHead>
							<TableHead>이메일</TableHead>
							<TableHead>Github 아이디</TableHead>
							<TableHead>계정 생성일</TableHead>
							<TableHead>
								<FilterHeader
									label="자격"
									buttonLabel={roleFilter === "전체" ? "전체" : roleFilter}
									renderContent={() => (
										<DropdownMenuRadioGroup
											value={roleFilter}
											onValueChange={(value) => setRoleFilter(value)}
										>
											<DropdownMenuRadioItem value="전체">전체</DropdownMenuRadioItem>
											{ROLE_OPTIONS.map((role) => (
												<DropdownMenuRadioItem key={role} value={role}>
													{role}
												</DropdownMenuRadioItem>
											))}
										</DropdownMenuRadioGroup>
									)}
								/>
							</TableHead>
							<TableHead>
								<FilterHeader
									label="재학여부"
									buttonLabel={enrollmentFilter === "전체" ? "전체" : enrollmentFilter}
									renderContent={() => (
										<DropdownMenuRadioGroup
											value={enrollmentFilter}
											onValueChange={(value) => setEnrollmentFilter(value)}
										>
											<DropdownMenuRadioItem value="전체">전체</DropdownMenuRadioItem>
											{ENROLLMENT_OPTIONS.map((status) => (
												<DropdownMenuRadioItem key={status} value={status}>
													{status}
												</DropdownMenuRadioItem>
											))}
										</DropdownMenuRadioGroup>
									)}
								/>
							</TableHead>
							<TableHead>
								<FilterHeader
									label="접근 권한"
									buttonLabel={
										accessRightsFilter.length === 0 ? "전체" : accessRightsFilter.join(", ")
									}
									renderContent={() => (
										<div className="space-y-1">
											<DropdownMenuCheckboxItem
												checked={accessRightsFilter.length === 0}
												onCheckedChange={() => setAccessRightsFilter([])}
											>
												전체
											</DropdownMenuCheckboxItem>
											<DropdownMenuSeparator />
											{ACCESS_RIGHT_OPTIONS.map((right) => (
												<DropdownMenuCheckboxItem
													key={right}
													checked={accessRightsFilter.includes(right)}
													onCheckedChange={(checked) => {
														setAccessRightsFilter((prev) => {
															if (checked) {
																return [...prev.filter(Boolean), right]
															}
															return prev.filter((r) => r !== right)
														})
													}}
												>
													{right}
												</DropdownMenuCheckboxItem>
											))}
										</div>
									)}
								/>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedMembers.map((member) => (
							<TableRow key={member.id}>
								<TableCell>
									<Checkbox
										checked={selectedMembers.includes(member.id)}
										onCheckedChange={(checked) => handleSelectMember(member.id, checked as boolean)}
									/>
								</TableCell>
								<TableCell className="font-medium">
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
								<TableCell className="text-gray-600">{member.generation || "-"}</TableCell>
								<TableCell className="text-gray-600">{member.email}</TableCell>
								<TableCell className="text-gray-600">{member.github_username || "-"}</TableCell>
								<TableCell className="text-gray-600">
									{new Date(member.join_date).toLocaleDateString("ko-KR", {
										year: "numeric",
										month: "2-digit",
										day: "2-digit",
									})}
								</TableCell>
								<TableCell className="text-gray-600">{member.role || "활동회원"}</TableCell>
								<TableCell className="text-gray-600">{member.affiliation || "학부생"}</TableCell>
								<TableCell className="text-gray-600">
									{member.access_rights?.length ? member.access_rights.join(", ") : "없음"}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* 페이지네이션 */}
			<div className="flex items-center justify-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onPageChange(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
				>
					{"<<"}
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onPageChange(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
				>
					{"<"}
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
							variant={currentPage === pageNum ? "default" : "ghost"}
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
					variant="ghost"
					size="sm"
					onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
				>
					{">"}
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onPageChange(totalPages)}
					disabled={currentPage === totalPages}
				>
					{">>"}
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
					<ChevronDown className="h-4 w-4 text-gray-400" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-32">
				<DropdownMenuItem onClick={() => onSortChange("desc")} className="flex items-center gap-2">
					{sort === "desc" && <Check className="h-4 w-4 text-[#FF6B6B]" />}
					내림차순
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onSortChange("asc")} className="flex items-center gap-2">
					{sort === "asc" && <Check className="h-4 w-4 text-[#FF6B6B]" />}
					오름차순
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

function FilterHeader({
	label,
	buttonLabel,
	renderContent,
}: {
	label: string
	buttonLabel: string
	renderContent: () => React.ReactNode
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="h-8 gap-1 font-medium hover:bg-gray-50 -ml-3">
					{label}
					<ChevronDown className="h-4 w-4 text-gray-400" />
					<span className="sr-only">{buttonLabel}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-40">
				{renderContent()}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
