"use client"

import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { dateInputToUnix } from "@/components/activities/activity-history.utils"
import { Forbidden } from "@/components/error/forbidden"
import { ActiveRosterConfirmDialog } from "@/components/members/active-roster-confirm-dialog"
import { MemberBulkUpdateDialog } from "@/components/members/member-bulk-update-dialog"
import { MemberTable } from "@/components/members/member-table"
import { QualificationChangeDialog } from "@/components/members/qualification-change-dialog"
import { useAuth } from "@/components/providers/auth-provider"
import { ActionButton } from "@/components/ui/action-button"
import { Button } from "@/components/ui/button"
import { FilterResetButton, FilterTag, FilterTagGroup } from "@/components/ui/filter-tag"
import { SearchInput } from "@/components/ui/search-input"
import { Toast } from "@/components/ui/toast"
import { ToastStack } from "@/components/ui/toast-stack"
import {
	roleToQualification,
	useApplyActiveRoster,
	useMembers,
	usePreviewActiveRoster,
	useUpdateUserAdmin,
} from "@/hooks/use-members"
import { useToastStack } from "@/hooks/use-toast-stack"
import { ApiError } from "@/lib/api/client"
import { canManageMembers } from "@/lib/permissions"
import type { ActiveRosterCounts, MemberCreate, MemberUpdate } from "@/types"
import { toUserUpdateRequest } from "@/types"

export default function MembersPage() {
	const { user, isLoading: isAuthLoading } = useAuth()
	const [searchQuery, setSearchQuery] = useState("")
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
	const [currentPage, setCurrentPage] = useState(1)
	const [selectedMembers, setSelectedMembers] = useState<number[]>([])
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [isBulkUpdateDialogOpen, setIsBulkUpdateDialogOpen] = useState(false)
	const [showToast, setShowToast] = useState(false)
	const [toastMessage, setToastMessage] = useState("")
	const [toastVariant, setToastVariant] = useState<"default" | "error">("default")
	const [rosterPreview, setRosterPreview] = useState<{
		counts: ActiveRosterCounts
		file: File
		referenceDate: number
	} | null>(null)
	const [generationSort, setGenerationSort] = useState<"desc" | "asc" | null>(null)
	const [roleFilter, setRoleFilter] = useState("전체")
	const [enrollmentFilter, setEnrollmentFilter] = useState("전체")
	const errorToastStack = useToastStack()
	const canViewMembers = canManageMembers(user)
	const {
		data: members = [],
		isLoading,
		error,
		refetch: refetchMembers,
	} = useMembers(undefined, 100, {
		enabled: !isAuthLoading && canViewMembers,
		name: debouncedSearchQuery,
	})
	const updateUserMutation = useUpdateUserAdmin()
	const previewActiveRosterMutation = usePreviewActiveRoster()
	const applyActiveRosterMutation = useApplyActiveRoster()
	const isForbidden = error?.message.includes("403") ?? false

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setDebouncedSearchQuery(searchQuery.trim())
			setCurrentPage(1)
		}, 300)

		return () => window.clearTimeout(timeoutId)
	}, [searchQuery])

	// 회원 정보 수정 핸들러
	const handleMemberUpdate = async (id: number, data: MemberCreate | MemberUpdate) => {
		try {
			await updateUserMutation.mutateAsync({ userId: id, data: toUserUpdateRequest(data) })
			setToastMessage("회원 정보가 성공적으로 업데이트되었습니다.")
			setShowToast(true)
		} catch (err) {
			console.error("Failed to update member:", err)
			setToastMessage(err instanceof Error ? err.message : "회원 정보 업데이트에 실패했습니다.")
			setShowToast(true)
			throw err
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
	]

	const handleResetFilters = () => {
		setGenerationSort(null)
		setRoleFilter("전체")
		setEnrollmentFilter("전체")
	}

	const handleRoleChange = () => {
		if (selectedMembers.length === 0) {
			setToastMessage("변경할 회원을 선택해주세요.")
			setShowToast(true)
			return
		}
		setIsDialogOpen(true)
	}

	const showActiveRosterError = (err: unknown) => {
		if (err instanceof ApiError && err.rowErrors && err.rowErrors.length > 0) {
			errorToastStack.pushMany(err.rowErrors.map((rowError) => rowError.message))
			return
		}
		setToastVariant("error")
		setToastMessage(err instanceof Error ? err.message : "활동회원 명부 갱신에 실패했습니다.")
		setShowToast(true)
	}

	const handleBulkUpdateSubmit = async ({
		effectiveDate,
		file,
	}: {
		effectiveDate: string
		file: File | null
	}) => {
		if (!file) return
		setShowToast(false)

		try {
			const referenceDate = dateInputToUnix(effectiveDate) ?? Math.floor(Date.now() / 1000)
			const counts = await previewActiveRosterMutation.mutateAsync({ file, referenceDate })
			setIsBulkUpdateDialogOpen(false)
			setRosterPreview({ counts, file, referenceDate })
		} catch (err) {
			setIsBulkUpdateDialogOpen(false)
			showActiveRosterError(err)
		}
	}

	const handleRosterApplyConfirm = async () => {
		if (!rosterPreview) return

		try {
			const result = await applyActiveRosterMutation.mutateAsync({
				file: rosterPreview.file,
				referenceDate: rosterPreview.referenceDate,
			})
			setRosterPreview(null)
			setToastVariant("default")
			setToastMessage(
				`활동회원 명부가 반영되었습니다. (활동회원 전환 ${result.promoted_count}명, 정회원 전환 ${result.demoted_count}명)`,
			)
			setShowToast(true)
		} catch (err) {
			setRosterPreview(null)
			showActiveRosterError(err)
		}
	}

	const handleDialogSubmit = async (role: string, reason: string) => {
		try {
			const qualification = roleToQualification(role)
			const updatePromises = selectedMembers.map((userId) =>
				updateUserMutation.mutateAsync({
					userId,
					data: { qualification, qualification_change_reason: reason },
				}),
			)
			await Promise.all(updatePromises)
			setToastMessage(`${selectedMembers.length}명의 회원 자격이 성공적으로 변경되었습니다.`)
			setSelectedMembers([])
			setShowToast(true)
		} catch (err) {
			setToastMessage(err instanceof Error ? err.message : "자격 변경 처리 중 오류가 발생했습니다.")
			setShowToast(true)
		} finally {
			setIsDialogOpen(false)
		}
	}

	if (isAuthLoading || isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	if (!canViewMembers || isForbidden) {
		return (
			<Forbidden message="회원 관리 페이지에 접근할 권한이 없습니다. 관리자 권한이 필요합니다." />
		)
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen space-y-4">
				<p className="text-destructive">{error.message}</p>
				<Button onClick={() => refetchMembers()}>다시 시도</Button>
			</div>
		)
	}

	return (
		<div className="flex flex-1 flex-col gap-[40px]">
			{/* 헤더 */}
			<h1 className="text-[28px] font-semibold leading-[normal] text-[#121212]">회원 정보 관리</h1>

			{/* 검색 영역 */}
			<div className="flex flex-1 flex-col gap-[16px]">
				<h2 className="flex items-center gap-[2px] text-[#121212]">
					<span className="text-[16px] font-medium leading-none">전체 회원</span>
					<span className="text-[14px] font-medium leading-[1.4] tracking-[-0.28px]">
						({members.length.toString().padStart(2, "0")})
					</span>
				</h2>

				<div className="flex flex-1 flex-col gap-[12px]">
					<div className="flex flex-col gap-[12px] xl:flex-row xl:items-center xl:justify-between">
						<div className="flex flex-wrap items-center gap-[10px] xl:gap-[15px]">
							<SearchInput
								containerClassName="h-[36px] w-full sm:w-[260px]"
								placeholder="검색어를 입력해 주세요"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<ActionButton
								variant="primary"
								size="inline"
								className="h-[36px] text-[14px] leading-[24px] tracking-normal"
								onClick={handleRoleChange}
							>
								회원 자격 변경
							</ActionButton>
							<ActionButton
								variant="secondary"
								size="inline"
								className="h-[36px] bg-peach-100 text-peach-300 hover:bg-peach-100/80 text-[14px] leading-[24px] tracking-normal"
								onClick={() => setIsBulkUpdateDialogOpen(true)}
							>
								활동회원 명부 일괄 갱신
							</ActionButton>
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
					/>
				</div>
			</div>

			<QualificationChangeDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				onSubmit={handleDialogSubmit}
			/>
			<MemberBulkUpdateDialog
				open={isBulkUpdateDialogOpen}
				onOpenChange={setIsBulkUpdateDialogOpen}
				onSubmit={handleBulkUpdateSubmit}
				isSubmitting={previewActiveRosterMutation.isPending}
				onDownloadTemplate={() => {
					const link = document.createElement("a")
					link.href = "/templates/active-member-roster-template.xlsx"
					link.download = "활동회원_명부_양식.xlsx"
					link.click()
				}}
			/>
			<ActiveRosterConfirmDialog
				open={rosterPreview !== null}
				counts={rosterPreview?.counts ?? null}
				isSubmitting={applyActiveRosterMutation.isPending}
				onOpenChange={(open) => {
					if (!open) setRosterPreview(null)
				}}
				onConfirm={handleRosterApplyConfirm}
			/>

			{/* 성공 토스트 알림 */}
			<Toast
				message={toastMessage}
				isVisible={showToast}
				onClose={() => setShowToast(false)}
				variant={toastVariant}
			/>
			<ToastStack items={errorToastStack.items} onDismiss={errorToastStack.dismiss} />
		</div>
	)
}
