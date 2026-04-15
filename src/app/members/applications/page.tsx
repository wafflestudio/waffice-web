"use client"

import { Loader2, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { Forbidden } from "@/components/error/forbidden"
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
import type { ApproveRequest, Qualification, UserDetail } from "@/types"

// 타입 가드: pending이 아닌 qualification인지 확인
function isApprovableQualification(q: Qualification): q is ApproveRequest["qualification"] {
	return q !== "pending"
}

// 자격(role) 매핑 함수
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

// UserDetail을 Application 형식으로 변환
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

const userDetailToApplication = (user: UserDetail): Application => ({
	id: user.id,
	name: user.name,
	generation: user.generation,
	email: user.email,
	github_username: user.github_username || "",
	application_date: new Date(user.created_at * 1000).toISOString(),
	role: qualificationToRole(user.qualification),
	status: user.qualification === "pending" ? "대기" : "승인",
})

export default function MemberApplicationsPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [currentPage, setCurrentPage] = useState(1)
	const [selectedApplications, setSelectedApplications] = useState<number[]>([])
	const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
	const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
	const [selectedRole, setSelectedRole] = useState<string>("")
	const [showToast, setShowToast] = useState(false)
	const [toastMessage, setToastMessage] = useState("")
	const [applications, setApplications] = useState<Application[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isForbidden, setIsForbidden] = useState(false)

	// Pending 유저 목록 가져오기
	useEffect(() => {
		const fetchPendingUsers = async () => {
			try {
				setIsLoading(true)
				setIsForbidden(false)
				const response = await apiClient.getPendingUsers()
				if (response.ok && response.data) {
					const apps = response.data.map(userDetailToApplication)
					setApplications(apps)
				} else {
					setError(response.message || "유저 목록을 불러오는데 실패했습니다.")
				}
			} catch (err) {
				const message = err instanceof Error ? err.message : "유저 목록을 불러오는데 실패했습니다."
				if (message.includes("403")) {
					setIsForbidden(true)
				} else {
					setError(message)
				}
				setError(err instanceof Error ? err.message : "유저 목록을 불러오는데 실패했습니다.")
			} finally {
				setIsLoading(false)
			}
		}

		fetchPendingUsers()
	}, [])

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

	const handleApproveSubmit = async () => {
		if (!selectedRole) {
			setToastMessage("자격을 선택해주세요.")
			setShowToast(true)
			return
		}

		const qualification = roleToQualification(selectedRole)

		// ApproveRequest는 pending을 허용하지 않음
		if (!isApprovableQualification(qualification)) {
			setToastMessage("유효하지 않은 자격입니다.")
			setShowToast(true)
			return
		}

		try {
			// 선택된 모든 신청을 승인
			const approvePromises = selectedApplications.map((userId) =>
				apiClient.approveUser(userId, { qualification }),
			)

			const results = await Promise.all(approvePromises)

			// 실패한 승인이 있는지 확인
			const failedApprovals = results.filter((r) => !r.ok)
			if (failedApprovals.length > 0) {
				setToastMessage(`${failedApprovals.length}명의 승인에 실패했습니다. 다시 시도해주세요.`)
			} else {
				setToastMessage(`${selectedApplications.length}명의 회원 가입이 승인되었습니다.`)

				// 승인된 유저들을 목록에서 제거
				setApplications((prev) => prev.filter((app) => !selectedApplications.includes(app.id)))
				setSelectedApplications([])
			}

			setShowToast(true)
		} catch (err) {
			setToastMessage(err instanceof Error ? err.message : "승인 처리 중 오류가 발생했습니다.")
			setShowToast(true)
		} finally {
			setIsApproveDialogOpen(false)
			setSelectedRole("")
		}
	}

	const handleRejectSubmit = async () => {
		try {
			// 선택된 모든 신청을 삭제 (반려)
			const rejectPromises = selectedApplications.map((userId) => apiClient.deleteUser(userId))

			const results = await Promise.all(rejectPromises)

			// 실패한 반려가 있는지 확인
			const failedRejections = results.filter((r) => !r.ok)
			if (failedRejections.length > 0) {
				setToastMessage(`${failedRejections.length}명의 반려에 실패했습니다. 다시 시도해주세요.`)
			} else {
				setToastMessage(`${selectedApplications.length}명의 회원 가입이 반려되었습니다.`)

				// 반려된 유저들을 목록에서 제거
				setApplications((prev) => prev.filter((app) => !selectedApplications.includes(app.id)))
				setSelectedApplications([])
			}

			setShowToast(true)
		} catch (err) {
			setToastMessage(err instanceof Error ? err.message : "반려 처리 중 오류가 발생했습니다.")
			setShowToast(true)
		} finally {
			setIsRejectDialogOpen(false)
		}
	}

	// 개별 승인/반려 핸들러 (이름 클릭 시 모달에서 사용)
	const handleApproveSingle = async (id: number, role: string) => {
		const qualification = roleToQualification(role)

		// ApproveRequest는 pending을 허용하지 않음
		if (!isApprovableQualification(qualification)) {
			setToastMessage("유효하지 않은 자격입니다.")
			setShowToast(true)
			return
		}

		try {
			const response = await apiClient.approveUser(id, { qualification })

			if (response.ok) {
				setToastMessage("해당 회원 가입이 승인되었습니다.")
				// 승인된 유저를 목록에서 제거
				setApplications((prev) => prev.filter((app) => app.id !== id))
			} else {
				setToastMessage(response.message || "승인에 실패했습니다.")
			}
		} catch (err) {
			setToastMessage(err instanceof Error ? err.message : "승인 처리 중 오류가 발생했습니다.")
		} finally {
			setShowToast(true)
		}
	}

	const handleRejectSingle = async (id: number) => {
		try {
			const response = await apiClient.deleteUser(id)

			if (response.ok) {
				setToastMessage("해당 회원 가입이 반려되었습니다.")
				// 반려된 유저를 목록에서 제거
				setApplications((prev) => prev.filter((app) => app.id !== id))
			} else {
				setToastMessage(response.message || "반려에 실패했습니다.")
			}
		} catch (err) {
			setToastMessage(err instanceof Error ? err.message : "반려 처리 중 오류가 발생했습니다.")
		} finally {
			setShowToast(true)
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
			<Forbidden message="가입 신청 관리 페이지에 접근할 권한이 없습니다. 관리자 권한이 필요합니다." />
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
