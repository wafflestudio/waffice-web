"use client"

import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { useState } from "react"
import { ApplicationTable } from "@/components/members/application-table"
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
import type { UserWithProfile } from "@/types"

interface Application {
	id: number
	name: string
	generation: string
	email: string
	github_username: string
	application_date: string
	status: string
}

export default function MemberApplicationsPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [currentPage, setCurrentPage] = useState(1)
	const [selectedApplications, setSelectedApplications] = useState<number[]>([])
	const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
	const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
	const [selectedRole, setSelectedRole] = useState<string>("")
	const [showToast, setShowToast] = useState(false)
	const [toastMessage, setToastMessage] = useState("")

	const {
		data: users = [],
		isLoading,
		error,
	} = useQuery<UserWithProfile[], Error>({
		queryKey: ["member-applications", "all-users"],
		queryFn: () => apiClient.getAllUsersWithProfile(),
	})

	const applications: Application[] = users.map((user: UserWithProfile) => ({
		id: user.id,
		name: user.name || "이름 없음",
		generation: user.profile_cardinal ?? "-",
		email: user.email ?? "-",
		github_username: user.google_id ?? "-",
		application_date: user.ctime ? new Date(user.ctime * 1000).toISOString() : "",
		status: user.admin && user.admin > 0 ? "승인" : "대기",
	}))

	const handleApproveClick = () => {
		if (selectedApplications.length === 0) {
			setToastMessage("승인할 신청을 선택해주세요.")
			setShowToast(true)
			return
		}
		setIsApproveDialogOpen(true)
	}

	const handleRejectClick = () => {
		if (selectedApplications.length === 0) {
			setToastMessage("반려할 신청을 선택해주세요.")
			setShowToast(true)
			return
		}
		setIsRejectDialogOpen(true)
	}

	const handleApproveSubmit = () => {
		if (!selectedRole) {
			setToastMessage("자격을 선택해주세요.")
			setShowToast(true)
			return
		}
		// TODO: API 호출하여 승인 처리
		console.log("승인할 신청:", selectedApplications)
		console.log("선택한 자격:", selectedRole)

		setIsApproveDialogOpen(false)
		setSelectedRole("")
		setToastMessage("선택한 회원 가입이 승인되었습니다.")
		setShowToast(true)
	}

	const handleRejectSubmit = () => {
		// TODO: API 호출하여 반려 처리
		console.log("반려할 신청:", selectedApplications)

		setIsRejectDialogOpen(false)
		setToastMessage("선택한 회원 가입이 반려되었습니다.")
		setShowToast(true)
	}

	// 개별 승인/반려 핸들러 (이름 클릭 시 모달에서 사용)
	const handleApproveSingle = (id: number, role: string) => {
		console.log(`개별 승인: ${id}, 자격: ${role}`)
		// TODO: API 호출
		setToastMessage("해당 회원 가입이 승인되었습니다.")
		setShowToast(true)
	}

	const handleRejectSingle = (id: number) => {
		console.log(`개별 반려: ${id}`)
		// TODO: API 호출
		setToastMessage("해당 회원 가입이 반려되었습니다.")
		setShowToast(true)
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg">가입 신청 목록을 불러오는 중...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg text-destructive">
					가입 신청 목록을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6 p-8">
			{/* 헤더 */}
			<div>
				<h1 className="text-3xl font-bold">가입 신청 관리</h1>
			</div>

			{/* 검색 영역 */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-medium">
						전체 회원 ({applications.length.toString().padStart(2, "0")})
					</h2>
				</div>

				<div className="flex items-center gap-3">
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="신청자명을 입력해 주세요"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
					<Button
						className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
						onClick={handleApproveClick}
					>
						가입 승인
					</Button>
					<Button
						variant="outline"
						className="border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white"
						onClick={handleRejectClick}
					>
						가입 반려
					</Button>
				</div>
			</div>

			{/* 테이블 */}
			<ApplicationTable
				applications={applications}
				searchQuery={searchQuery}
				currentPage={currentPage}
				onPageChange={setCurrentPage}
				selectedApplications={selectedApplications}
				onSelectedApplicationsChange={setSelectedApplications}
				onApprove={handleApproveSingle}
				onReject={handleRejectSingle}
			/>

			{/* 승인 다이얼로그 */}
			<Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>회원 가입 승인</DialogTitle>
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
										onClick={() => setSelectedRole(role)}
										className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
									>
										<span
											className={`text-sm font-medium ${
												selectedRole === role ? "text-[#FF6B6B]" : "text-gray-700"
											}`}
										>
											{role}
										</span>
										{selectedRole === role && (
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
					</div>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
							취소
						</Button>
						<Button
							className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
							onClick={handleApproveSubmit}
						>
							확인
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* 반려 확인 다이얼로그 */}
			<Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>회원 가입 반려</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-center text-sm text-gray-700">
							선택한 회원의 가입을 반려하시겠습니까?
						</p>
					</div>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
							취소
						</Button>
						<Button
							className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
							onClick={handleRejectSubmit}
						>
							확인
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* 성공 토스트 알림 */}
			<Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
		</div>
	)
}
