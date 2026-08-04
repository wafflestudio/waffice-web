"use client"

import { Check, Loader2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Forbidden } from "@/components/error/forbidden"
import { ApplicationTable } from "@/components/members/application-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { FilterResetButton, FilterTag, FilterTagGroup } from "@/components/ui/filter-tag"
import { SearchInput } from "@/components/ui/search-input"
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

const qualificationToRole = (qualification: Qualification | null): string => {
	switch (qualification) {
		case "active":
			return "활동회원"
		case "regular":
			return "정회원"
		case "associate":
			return "준회원"
		case "pending":
			return "가입 대기"
		default:
			return "가입 대기"
	}
}

// UserDetail을 Application 형식으로 변환
interface Application {
	id: number
	name: string
	generation: string
	department: string
	student_id: string
	affiliation: string
	email: string
	application_date: string
	role: string
	status: string
}

const userDetailToApplication = (user: UserDetail): Application => ({
	id: user.id,
	name: user.name,
	generation: user.generation,
	department: user.department ?? "",
	student_id: user.student_id ?? "",
	affiliation: user.graduation_status ?? "",
	email: user.email ?? "",
	application_date: new Date(user.created_at * 1000).toISOString(),
	// 대기 중인 신청은 가입 시 신청자가 고른 자격(requested_qualification)을 보여준다.
	// 승인 완료된 회원은 확정된 qualification을 그대로 보여준다.
	role:
		user.qualification === "pending"
			? qualificationToRole(user.requested_qualification)
			: qualificationToRole(user.qualification),
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
	const [generationSort, setGenerationSort] = useState<"desc" | "asc" | null>(null)
	const [dateSort, setDateSort] = useState<"desc" | "asc" | null>(null)
	const [roleFilter, setRoleFilter] = useState("전체")
	const [statusFilter, setStatusFilter] = useState("전체")
	const [enrollmentFilter, setEnrollmentFilter] = useState("전체")

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
			setToastMessage("승인할 요청을 선택해주세요.")
			setShowToast(true)
			return
		}
		setIsApproveDialogOpen(true)
	}

	const _handleRejectClick = () => {
		if (selectedApplications.length === 0) {
			setToastMessage("반려할 요청을 선택해주세요.")
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

	const activeFilterTags = [
		...(generationSort
			? [
					{
						label: `기수 · ${generationSort === "desc" ? "내림차순" : "오름차순"}`,
						onRemove: () => setGenerationSort(null),
					},
				]
			: []),
		...(dateSort
			? [
					{
						label: `가입 신청일 · ${dateSort === "desc" ? "내림차순" : "오름차순"}`,
						onRemove: () => setDateSort(null),
					},
				]
			: []),
		...(roleFilter !== "전체"
			? [{ label: roleFilter, onRemove: () => setRoleFilter("전체") }]
			: []),
		...(statusFilter !== "전체"
			? [{ label: statusFilter, onRemove: () => setStatusFilter("전체") }]
			: []),
		...(enrollmentFilter !== "전체"
			? [{ label: enrollmentFilter, onRemove: () => setEnrollmentFilter("전체") }]
			: []),
	]

	const handleResetFilters = () => {
		setGenerationSort(null)
		setDateSort(null)
		setRoleFilter("전체")
		setStatusFilter("전체")
		setEnrollmentFilter("전체")
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
			<Forbidden message="가입 요청 관리 페이지에 접근할 권한이 없습니다. 관리자 권한이 필요합니다." />
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
		<div className="flex flex-1 flex-col gap-[30px]">
			{/* 헤더 */}
			<div>
				<h1 className="text-[28px] font-semibold leading-[normal] tracking-[-0.56px] text-[#121212]">
					가입 요청 관리
				</h1>
			</div>

			{/* 검색 영역 */}
			<div className="flex flex-1 flex-col gap-[16px]">
				<h2 className="flex items-center gap-[2px]">
					<span className="text-[18px] font-medium text-[#121212] tracking-[-0.36px]">
						전체 요청
					</span>
					<span className="text-[14px] font-medium text-[#121212] tracking-[-0.28px]">
						({applications.length.toString().padStart(2, "0")})
					</span>
				</h2>

				<div className="flex flex-1 flex-col gap-[12px]">
					<div className="flex flex-col gap-[12px] xl:flex-row xl:items-center xl:justify-between">
						<div className="flex flex-wrap items-center gap-[10px] xl:gap-[15px]">
							<SearchInput
								containerClassName="h-[36px] w-full sm:w-[260px]"
								placeholder="요청자명을 입력해 주세요"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<Button
								className="rounded-[3px] bg-peach-300 hover:bg-peach-500 text-white"
								onClick={handleApproveClick}
							>
								회원 등급 변경
							</Button>
						</div>
						{activeFilterTags.length > 0 && (
							<FilterTagGroup className="flex-wrap xl:justify-end">
								{activeFilterTags.map((tag) => (
									<FilterTag key={tag.label} label={tag.label} onClick={tag.onRemove} />
								))}
								<FilterResetButton onClick={handleResetFilters}>초기화</FilterResetButton>
							</FilterTagGroup>
						)}
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
						generationSort={generationSort}
						onGenerationSortChange={setGenerationSort}
						dateSort={dateSort}
						onDateSortChange={setDateSort}
						roleFilter={roleFilter}
						onRoleFilterChange={setRoleFilter}
						statusFilter={statusFilter}
						onStatusFilterChange={setStatusFilter}
						enrollmentFilter={enrollmentFilter}
						onEnrollmentFilterChange={setEnrollmentFilter}
					/>
				</div>
			</div>

			{/* 승인 다이얼로그 */}
			<Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
				<DialogContent
					showCloseButton={false}
					className="w-[460px] max-w-[460px] rounded-[12px] p-0 gap-0"
				>
					<div className="pt-[10px] px-[10px] pb-[40px] flex flex-col items-end gap-[10px]">
						<DialogClose asChild>
							<button
								type="button"
								className="size-[35px] flex items-center justify-center hover:opacity-70"
							>
								<X className="size-5" strokeWidth={2.5} />
								<span className="sr-only">닫기</span>
							</button>
						</DialogClose>
						<div className="w-full px-[40px] flex flex-col gap-[50px]">
							<DialogTitle className="text-[24px] font-medium text-[#121212]">
								회원 가입 승인
							</DialogTitle>
							<div className="flex flex-col gap-[40px] items-end">
								{/* 자격 선택 */}
								<div className="flex flex-col gap-[10px] items-start">
									<span className="text-[15px] font-medium text-[#121212]">자격</span>
									<div className="w-[360px] border border-[#dbdfe0] rounded-[5px]">
										{["준회원", "정회원", "활동회원"].map((role) => (
											<button
												key={role}
												type="button"
												onClick={() => setSelectedRole(role)}
												className="w-full h-[50px] flex items-center gap-[10px] px-[16px]"
											>
												<span
													className={`text-[15px] font-medium leading-[20px] ${
														selectedRole === role ? "text-[#e75010]" : "text-[#505050]"
													}`}
												>
													{role}
												</span>
												{selectedRole === role && (
													<Check className="text-[#e75010] size-3" strokeWidth={2.5} />
												)}
											</button>
										))}
									</div>
								</div>
								{/* 하단 버튼 */}
								<div className="flex items-center gap-[16px]">
									<button
										type="button"
										onClick={() => setIsApproveDialogOpen(false)}
										className="h-[50px] px-[50px] border border-[#999] rounded-[4px] text-[17px] font-medium text-[#121212]"
									>
										취소
									</button>
									<button
										type="button"
										onClick={handleApproveSubmit}
										className="h-[50px] px-[50px] bg-[#f77153] rounded-[4px] text-[17px] font-medium text-white"
									>
										확인
									</button>
								</div>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* 반려 확인 다이얼로그 */}
			<Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
				<DialogContent
					showCloseButton={false}
					className="w-[460px] max-w-[460px] rounded-[12px] p-0 gap-0"
				>
					<div className="pt-[10px] px-[10px] pb-[40px] flex flex-col items-end gap-[10px]">
						<DialogClose asChild>
							<button
								type="button"
								className="size-[35px] flex items-center justify-center hover:opacity-70"
							>
								<X className="size-5" strokeWidth={2.5} />
								<span className="sr-only">닫기</span>
							</button>
						</DialogClose>
						<div className="w-full px-[40px] flex flex-col gap-[50px]">
							<DialogTitle className="text-[24px] font-medium text-[#121212]">
								회원 가입 반려
							</DialogTitle>
							<div className="flex flex-col gap-[40px] items-end">
								<p className="w-full text-[15px] font-medium text-[#505050]">
									선택한 회원의 가입을 반려하시겠습니까?
								</p>
								<div className="flex items-center gap-[16px]">
									<button
										type="button"
										onClick={() => setIsRejectDialogOpen(false)}
										className="h-[50px] px-[50px] border border-[#999] rounded-[4px] text-[17px] font-medium text-[#121212]"
									>
										취소
									</button>
									<button
										type="button"
										onClick={handleRejectSubmit}
										className="h-[50px] px-[50px] bg-[#f77153] rounded-[4px] text-[17px] font-medium text-white"
									>
										확인
									</button>
								</div>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* 성공 토스트 알림 */}
			<Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
		</div>
	)
}
