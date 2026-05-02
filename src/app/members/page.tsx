"use client"

import { Loader2, Search, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Forbidden } from "@/components/error/forbidden"
import { MemberTable } from "@/components/members/member-table"
import { QualificationChangeDialog } from "@/components/members/qualification-change-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toast } from "@/components/ui/toast"
import { apiClient } from "@/lib/api"
import type {
	AccessRight,
	Member,
	MemberCreate,
	MemberUpdate,
	Qualification,
	UserDetail,
} from "@/types"

// UserDetail을 Member로 변환하는 함수
const qualificationToRole = (qualification: Qualification): string => {
	switch (qualification) {
		case "active":
			return "활동회원"
		case "regular":
			return "정회원"
		case "associate":
			return "준회원"
		case "pending":
			return "미가입"
		default:
			return "미가입"
	}
}

const roleToQualification = (role: string): Qualification => {
	switch (role) {
		case "활동회원":
			return "active"
		case "정회원":
			return "regular"
		case "준회원":
			return "associate"
		default:
			return "pending"
	}
}

const userDetailToMember = (user: UserDetail): Member => ({
	id: user.id,
	name: user.name,
	email: user.email,
	phone: user.phone || undefined,
	github_username: user.github_username || undefined,
	slack_id: user.slack_id || undefined,
	generation: user.generation,
	role: qualificationToRole(user.qualification),
	affiliation: user.affiliation as Member["affiliation"],
	access_rights: user.is_admin ? ["운영진"] : [],
	status: user.qualification === "pending" ? "inactive" : "active",
	join_date: new Date(user.created_at * 1000).toISOString(),
	created_at: new Date(user.created_at * 1000).toISOString(),
	updated_at: new Date(user.created_at * 1000).toISOString(),
})

export default function MembersPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [currentPage, setCurrentPage] = useState(1)
	const [selectedMembers, setSelectedMembers] = useState<number[]>([])
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [showToast, setShowToast] = useState(false)
	const [toastMessage, setToastMessage] = useState("")
	const [members, setMembers] = useState<Member[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isForbidden, setIsForbidden] = useState(false)
	const [generationSort, setGenerationSort] = useState<"desc" | "asc" | null>(null)
	const [roleFilter, setRoleFilter] = useState("전체")
	const [enrollmentFilter, setEnrollmentFilter] = useState("전체")
	const [accessRightsFilter, setAccessRightsFilter] = useState<AccessRight[]>([])

	// 회원 목록 불러오기
	const fetchMembers = useCallback(async () => {
		try {
			setIsLoading(true)
			setIsForbidden(false)
			const response = await apiClient.getUsers(undefined, 100)
			if (response.ok && response.data) {
				const memberList = response.data.items
					.filter((u) => u.qualification !== "pending")
					.map(userDetailToMember)
				setMembers(memberList)
			} else {
				setError(response.message || "회원 목록을 불러오는데 실패했습니다.")
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "회원 목록을 불러오는데 실패했습니다."
			if (message.includes("403")) {
				setIsForbidden(true)
			} else {
				setError(message)
			}
			setError(err instanceof Error ? err.message : "회원 목록을 불러오는데 실패했습니다.")
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchMembers()
	}, [fetchMembers])

	// 회원 정보 수정 핸들러
	const handleMemberUpdate = async (id: number, data: MemberCreate | MemberUpdate) => {
		try {
			const updateRequest: {
				phone?: string | null
				affiliation?: string | null
				github_username?: string | null
				slack_id?: string | null
			} = {}

			if (data.phone !== undefined) updateRequest.phone = data.phone || null
			if (data.affiliation !== undefined) updateRequest.affiliation = data.affiliation || null
			if (data.github_username !== undefined)
				updateRequest.github_username = data.github_username || null
			if (data.slack_id !== undefined) updateRequest.slack_id = data.slack_id || null

			const response = await apiClient.updateUserAdmin(id, updateRequest)

			if (response.ok && response.data) {
				// 로컬 상태 업데이트
				setMembers((prev) =>
					prev.map((m) => {
						if (m.id === id && response.data) {
							return userDetailToMember(response.data)
						}
						return m
					}),
				)
				setToastMessage("회원 정보가 성공적으로 업데이트되었습니다.")
			} else {
				setToastMessage(response.message || "회원 정보 업데이트에 실패했습니다.")
			}
			setShowToast(true)
		} catch (err) {
			console.error("Failed to update member:", err)
			setToastMessage(err instanceof Error ? err.message : "회원 정보 업데이트에 실패했습니다.")
			setShowToast(true)
		}
	}

	const activeFilterTags = [
		...(generationSort
			? [
					{
						label: `기수 · ${generationSort === "desc" ? "내림차순" : "오름차순"}`,
						onRemove: () => setGenerationSort(null),
					},
				]
			: []),
		...(roleFilter !== "전체"
			? [{ label: roleFilter, onRemove: () => setRoleFilter("전체") }]
			: []),
		...(enrollmentFilter !== "전체"
			? [{ label: enrollmentFilter, onRemove: () => setEnrollmentFilter("전체") }]
			: []),
		...accessRightsFilter.map((right) => ({
			label: right,
			onRemove: () => setAccessRightsFilter((prev) => prev.filter((r) => r !== right)),
		})),
	]

	const handleResetFilters = () => {
		setGenerationSort(null)
		setRoleFilter("전체")
		setEnrollmentFilter("전체")
		setAccessRightsFilter([])
	}

	const handleRoleChange = () => {
		if (selectedMembers.length === 0) {
			setToastMessage("변경할 회원을 선택해주세요.")
			setShowToast(true)
			return
		}
		setIsDialogOpen(true)
	}

	const handleDialogSubmit = async (role: string, reason: string) => {
		if (!role) {
			setToastMessage("자격을 선택해주세요.")
			setShowToast(true)
			return
		}
		if (!reason.trim()) {
			setToastMessage("변경 사유를 입력해주세요.")
			setShowToast(true)
			return
		}

		try {
			const qualification = roleToQualification(role)
			const updatePromises = selectedMembers.map((userId) =>
				apiClient.updateUserAdmin(userId, { qualification }),
			)
			const results = await Promise.all(updatePromises)

			const failedUpdates = results.filter((r) => !r.ok)
			if (failedUpdates.length > 0) {
				setToastMessage(`${failedUpdates.length}명의 자격 변경에 실패했습니다. 다시 시도해주세요.`)
			} else {
				setToastMessage(`${selectedMembers.length}명의 회원 자격이 성공적으로 변경되었습니다.`)
				setMembers((prev) =>
					prev.map((m) => {
						if (selectedMembers.includes(m.id)) {
							const result = results.find((r) => r.data?.id === m.id)
							return result?.data ? userDetailToMember(result.data) : m
						}
						return m
					}),
				)
				setSelectedMembers([])
			}
			setShowToast(true)
		} catch (err) {
			setToastMessage(err instanceof Error ? err.message : "자격 변경 처리 중 오류가 발생했습니다.")
			setShowToast(true)
		} finally {
			setIsDialogOpen(false)
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	if (isForbidden) {
		return (
			<Forbidden message="회원 관리 페이지에 접근할 권한이 없습니다. 관리자 권한이 필요합니다." />
		)
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen space-y-4">
				<p className="text-destructive">{error}</p>
				<Button onClick={() => window.location.reload()}>다시 시도</Button>
			</div>
		)
	}

	return (
		<div className="space-y-6 p-8">
			{/* 헤더 */}
			<div>
				<h1 className="text-[36px] font-medium text-[#121212]">회원 관리</h1>
			</div>

			{/* 검색 영역 */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="flex items-baseline gap-[4px]">
						<span className="text-[20px] font-medium text-[#121212]">전체 회원</span>
						<span className="text-[14px] font-medium text-[#121212]">
							({members.length.toString().padStart(2, "0")})
						</span>
					</h2>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-[15px]">
						<div className="relative w-[320px]">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="검색어를 입력해 주세요"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>
						<Button
							className="bg-peach-300 hover:bg-peach-500 text-white"
							onClick={handleRoleChange}
						>
							회원 자격 변경
						</Button>
					</div>
					{activeFilterTags.length > 0 && (
						<div className="flex items-center gap-[10px]">
							{activeFilterTags.map((tag) => (
								<button
									key={tag.label}
									type="button"
									onClick={tag.onRemove}
									className="flex justify-center items-center gap-[10px] px-2 py-1.5 bg-peach-100 rounded-[3px]"
								>
									<div className="flex justify-start items-center gap-2">
										<span className="text-sm font-medium text-peach-500">{tag.label}</span>
										<X className="w-[9px] h-[9px] text-peach-500 shrink-0" />
									</div>
								</button>
							))}
							<button
								type="button"
								onClick={handleResetFilters}
								className="flex justify-center items-center gap-[10px] px-2 py-1.5 rounded-[3px]"
							>
								<div className="flex justify-start items-center gap-2">
									<span className="text-sm font-medium text-peach-500 underline">초기화</span>
								</div>
							</button>
						</div>
					)}
				</div>
			</div>

			{/* 테이블 */}
			<MemberTable
				members={members}
				searchQuery={searchQuery}
				currentPage={currentPage}
				onPageChange={setCurrentPage}
				selectedMembers={selectedMembers}
				onSelectedMembersChange={setSelectedMembers}
				onMemberUpdate={handleMemberUpdate}
				generationSort={generationSort}
				onGenerationSortChange={setGenerationSort}
				roleFilter={roleFilter}
				onRoleFilterChange={setRoleFilter}
				enrollmentFilter={enrollmentFilter}
				onEnrollmentFilterChange={setEnrollmentFilter}
				accessRightsFilter={accessRightsFilter}
				onAccessRightsFilterChange={setAccessRightsFilter}
			/>

			<QualificationChangeDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				onSubmit={handleDialogSubmit}
			/>

			{/* 성공 토스트 알림 */}
			<Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
		</div>
	)
}
