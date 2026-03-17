"use client"

import { Loader2, Plus, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useId, useState } from "react"
import { Forbidden } from "@/components/error/forbidden"
import { MemberForm } from "@/components/members/member-form"
import { MemberTable } from "@/components/members/member-table"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toast } from "@/components/ui/toast"
import { apiClient } from "@/lib/api"
import type { Member, MemberCreate, MemberUpdate, Qualification, UserDetail } from "@/types"

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
	const router = useRouter()

	const [searchQuery, setSearchQuery] = useState("")
	const [currentPage, setCurrentPage] = useState(1)
	const [selectedMembers, setSelectedMembers] = useState<number[]>([])
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [newRole, setNewRole] = useState<string>("")
	const [changeReason, setChangeReason] = useState("")
	const [showToast, setShowToast] = useState(false)
	const [toastMessage, setToastMessage] = useState("")
	const [members, setMembers] = useState<Member[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isForbidden, setIsForbidden] = useState(false)
	const reasonId = useId()

	// 회원 목록 불러오기
	const fetchMembers = useCallback(async () => {
		try {
			setIsLoading(true)
			setIsForbidden(false)
			const response = await apiClient.getUsers(undefined, 100)
			if (response.ok && response.data) {
				const memberList = response.data.items.map(userDetailToMember)
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

	useEffect(() => {
		if (window.location.search.includes("quick=add")) {
			setIsCreateDialogOpen(true)
		}
	}, [])

	const closeCreateDialog = () => {
		setIsCreateDialogOpen(false)
		if (window.location.search.includes("quick=add")) {
			router.replace("/members")
		}
	}

	const handleCreateMember = async (data: MemberCreate | MemberUpdate) => {
		const createData = data as MemberCreate
		try {
			const response = await apiClient.createMember(createData)
			setMembers((prev) => [response, ...prev])
			setToastMessage("새 회원이 추가되었습니다.")
			setShowToast(true)
			closeCreateDialog()
		} catch (err) {
			setToastMessage(err instanceof Error ? err.message : "회원 추가에 실패했습니다.")
			setShowToast(true)
		}
	}

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

	const handleRoleChange = () => {
		if (selectedMembers.length === 0) {
			setToastMessage("변경할 회원을 선택해주세요.")
			setShowToast(true)
			return
		}
		setIsDialogOpen(true)
	}

	const handleSubmitRoleChange = async () => {
		if (!newRole) {
			setToastMessage("자격을 선택해주세요.")
			setShowToast(true)
			return
		}
		if (!changeReason.trim()) {
			setToastMessage("변경 사유를 입력해주세요.")
			setShowToast(true)
			return
		}

		try {
			const qualification = roleToQualification(newRole)

			// 선택된 모든 회원의 자격 변경
			const updatePromises = selectedMembers.map((userId) =>
				apiClient.updateUserAdmin(userId, { qualification }),
			)

			const results = await Promise.all(updatePromises)

			// 실패한 업데이트 확인
			const failedUpdates = results.filter((r) => !r.ok)
			if (failedUpdates.length > 0) {
				setToastMessage(`${failedUpdates.length}명의 자격 변경에 실패했습니다. 다시 시도해주세요.`)
			} else {
				setToastMessage(`${selectedMembers.length}명의 회원 자격이 성공적으로 변경되었습니다.`)

				// 로컬 상태 업데이트
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
			// 다이얼로그 닫고 초기화
			setIsDialogOpen(false)
			setNewRole("")
			setChangeReason("")
		}
	}

	const handleCancelRoleChange = () => {
		setIsDialogOpen(false)
		setNewRole("")
		setChangeReason("")
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
				<h1 className="text-3xl font-bold">회원 관리</h1>
			</div>

			{/* 검색 영역 */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-medium">
						전체 회원 ({members.length.toString().padStart(2, "0")})
					</h2>
					<Button
						variant="default"
						className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
						onClick={() => setIsCreateDialogOpen(true)}
					>
						<Plus className="mr-2 h-4 w-4" />
						회원 추가
					</Button>
				</div>

				<div className="flex items-center gap-3">
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="회원명을 입력해 주세요"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
					<Button className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white" onClick={handleRoleChange}>
						회원 자격 변경
					</Button>
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
			/>

			{/* 회원 자격 변경 다이얼로그 */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>회원 자격 변경</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						{/* 자격 선택 */}
						<div className="space-y-3">
							<Label>자격</Label>
							<div className="flex flex-col items-start gap-3 px-4 py-3 border rounded-lg">
								{["활동회원", "정회원", "준회원"].map((role) => (
									<button
										key={role}
										type="button"
										onClick={() => setNewRole(role)}
										className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
									>
										<span
											className={`text-sm font-medium ${
												newRole === role ? "text-[#FF6B6B]" : "text-gray-700"
											}`}
										>
											{role}
										</span>
										{newRole === role && (
											<svg
												className="w-4 h-4 text-[#FF6B6B]"
												fill="currentColor"
												viewBox="0 0 20 20"
												aria-label="선택됨"
											>
												<title>선택됨</title>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										)}
									</button>
								))}
							</div>
						</div>

						{/* 변경 사유 */}
						<div className="space-y-2">
							<Label htmlFor={reasonId}>변경 사유</Label>
							<textarea
								id={reasonId}
								placeholder="변경 사유를 입력해 주세요"
								value={changeReason}
								onChange={(e) => setChangeReason(e.target.value)}
								className="w-full min-h-[100px] p-2 border border-input rounded-md bg-background text-sm resize-y"
							/>
						</div>
					</div>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button variant="outline" onClick={handleCancelRoleChange}>
							취소
						</Button>
						<Button
							className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
							onClick={handleSubmitRoleChange}
						>
							변경
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isCreateDialogOpen} onOpenChange={closeCreateDialog}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>새 회원 추가</DialogTitle>
					</DialogHeader>
					<MemberForm onSubmit={handleCreateMember} onCancel={closeCreateDialog} />
				</DialogContent>
			</Dialog>

			{/* 성공 토스트 알림 */}
			<Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
		</div>
	)
}
