"use client"

import { Search } from "lucide-react"
import { useState } from "react"
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
import type { Member } from "@/types"

// 임시 목 데이터 - API 연결 전까지 사용
const mockMembers: Member[] = [
	{
		id: 1,
		name: "홍길동",
		email: "waffice@gmail.com",
		github_username: "wafflestudio",
		generation: "23.5기",
		role: "활동회원",
		status: "active",
		join_date: "2025-10-01T00:00:00Z",
		created_at: "2025-10-01T00:00:00Z",
		updated_at: "2025-10-01T00:00:00Z",
	},
	{
		id: 2,
		name: "홍길동",
		email: "waffice@gmail.com",
		github_username: "wafflestudio",
		generation: "23.5기",
		role: "활동회원",
		status: "active",
		join_date: "2025-10-01T00:00:00Z",
		created_at: "2025-10-01T00:00:00Z",
		updated_at: "2025-10-01T00:00:00Z",
	},
	{
		id: 3,
		name: "홍길동",
		email: "waffice@gmail.com",
		github_username: "wafflestudio",
		generation: "23.5기",
		role: "활동회원",
		status: "active",
		join_date: "2025-10-01T00:00:00Z",
		created_at: "2025-10-01T00:00:00Z",
		updated_at: "2025-10-01T00:00:00Z",
	},
	{
		id: 4,
		name: "홍길동",
		email: "waffice@gmail.com",
		github_username: "wafflestudio",
		generation: "23.5기",
		role: "활동회원",
		status: "active",
		join_date: "2025-10-01T00:00:00Z",
		created_at: "2025-10-01T00:00:00Z",
		updated_at: "2025-10-01T00:00:00Z",
	},
	{
		id: 5,
		name: "홍길동",
		email: "waffice@gmail.com",
		github_username: "wafflestudio",
		generation: "23.5기",
		role: "활동회원",
		status: "active",
		join_date: "2025-10-01T00:00:00Z",
		created_at: "2025-10-01T00:00:00Z",
		updated_at: "2025-10-01T00:00:00Z",
	},
	{
		id: 6,
		name: "홍길동",
		email: "waffice@gmail.com",
		github_username: "wafflestudio",
		generation: "23.5기",
		role: "활동회원",
		status: "active",
		join_date: "2025-10-01T00:00:00Z",
		created_at: "2025-10-01T00:00:00Z",
		updated_at: "2025-10-01T00:00:00Z",
	},
	{
		id: 7,
		name: "홍길동",
		email: "waffice@gmail.com",
		github_username: "wafflestudio",
		generation: "23.5기",
		role: "활동회원",
		status: "active",
		join_date: "2025-10-01T00:00:00Z",
		created_at: "2025-10-01T00:00:00Z",
		updated_at: "2025-10-01T00:00:00Z",
	},
	{
		id: 8,
		name: "홍길동",
		email: "waffice@gmail.com",
		github_username: "wafflestudio",
		generation: "23.5기",
		role: "활동회원",
		status: "active",
		join_date: "2025-10-01T00:00:00Z",
		created_at: "2025-10-01T00:00:00Z",
		updated_at: "2025-10-01T00:00:00Z",
	},
	{
		id: 9,
		name: "홍길동",
		email: "waffice@gmail.com",
		github_username: "wafflestudio",
		generation: "23.5기",
		role: "활동회원",
		status: "active",
		join_date: "2025-10-01T00:00:00Z",
		created_at: "2025-10-01T00:00:00Z",
		updated_at: "2025-10-01T00:00:00Z",
	},
	{
		id: 10,
		name: "홍길동",
		email: "waffice@gmail.com",
		github_username: "wafflestudio",
		generation: "23.5기",
		role: "활동회원",
		status: "active",
		join_date: "2025-10-01T00:00:00Z",
		created_at: "2025-10-01T00:00:00Z",
		updated_at: "2025-10-01T00:00:00Z",
	},
]

export default function MembersPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [currentPage, setCurrentPage] = useState(1)
	const [selectedMembers, setSelectedMembers] = useState<number[]>([])
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [newRole, setNewRole] = useState<string>("")
	const [changeReason, setChangeReason] = useState("")
	const [showToast, setShowToast] = useState(false)

	// TODO: API 연결 시 아래 코드로 교체
	// const {
	// 	data: members = [],
	// 	isLoading,
	// 	error,
	// } = useQuery({
	// 	queryKey: ["members"],
	// 	queryFn: () => apiClient.getMembers(),
	// })

	const members = mockMembers
	const isLoading = false
	const error = null

	const handleRoleChange = () => {
		if (selectedMembers.length === 0) {
			alert("변경할 회원을 선택해주세요.")
			return
		}
		setIsDialogOpen(true)
	}

	const handleSubmitRoleChange = () => {
		if (!newRole) {
			alert("자격을 선택해주세요.")
			return
		}
		if (!changeReason.trim()) {
			alert("변경 사유를 입력해주세요.")
			return
		}

		// TODO: API 호출하여 자격 변경
		console.log("선택된 회원:", selectedMembers)
		console.log("변경할 자격:", newRole)
		console.log("변경 사유:", changeReason)

		// 다이얼로그 닫고 초기화
		setIsDialogOpen(false)
		setNewRole("")
		setChangeReason("")
		
		// 성공 토스트 표시
		setShowToast(true)
	}

	const handleCancelRoleChange = () => {
		setIsDialogOpen(false)
		setNewRole("")
		setChangeReason("")
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg">회원 목록을 불러오는 중...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg text-destructive">
					회원 목록을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.
				</div>
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
							<Label htmlFor="reason">변경 사유</Label>
							<textarea
								id="reason"
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

			{/* 성공 토스트 알림 */}
			<Toast
				message="성공적으로 변경이 완료되었습니다."
				isVisible={showToast}
				onClose={() => setShowToast(false)}
			/>
		</div>
	)
}
