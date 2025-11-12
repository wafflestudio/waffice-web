"use client"

import { Check, ChevronDown } from "lucide-react"
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
import type { Member, MemberCreate, MemberUpdate } from "@/types"

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

	// 검색 필터링
	const filteredMembers = members.filter((member) =>
		member.name.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	// 페이지네이션
	const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE)
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
	const paginatedMembers = filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE)

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
							<TableHead>자격</TableHead>
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
								<TableCell className="text-gray-600">{member.generation || "23.5기"}</TableCell>
								<TableCell className="text-gray-600">{member.email}</TableCell>
								<TableCell className="text-gray-600">
									{member.github_username || "wafflestudio"}
								</TableCell>
								<TableCell className="text-gray-600">
									{new Date(member.join_date).toLocaleDateString("ko-KR", {
										year: "numeric",
										month: "2-digit",
										day: "2-digit",
									})}
								</TableCell>
								<TableCell className="text-gray-600">{member.role || "활동회원"}</TableCell>
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
	const getSortIcon = () => {
		if (sort === "desc") return "🔽"
		if (sort === "asc") return "🔼"
		return ""
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="h-8 gap-1 font-medium hover:bg-gray-50 -ml-3">
					기수 {getSortIcon()}
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
