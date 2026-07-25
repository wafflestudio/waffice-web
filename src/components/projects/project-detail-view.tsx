"use client"

import { ArrowUpRight, ChevronDown, MoreHorizontal, Search, X } from "lucide-react"
import type * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { CalendarDateField } from "@/components/ui/calendar"
import { DesignDialogContent } from "@/components/ui/design-dialog"
import {
	DesignTable,
	DesignTableBodyCell,
	DesignTableHeaderCell,
	DesignTableHeaderRow,
	DesignTableRow,
} from "@/components/ui/design-table"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterRadioItem,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	FilterResetButton,
	FilterTag,
	FilterTagGroup,
	FilterTrigger,
} from "@/components/ui/filter-tag"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { SearchInput } from "@/components/ui/search-input"
import { DotStatusBadge, TagBadge } from "@/components/ui/status-badge"
import { Toast } from "@/components/ui/toast"
import { useUsers } from "@/hooks/use-members"
import {
	useAddProjectMember,
	useDeleteProject,
	useDownloadProjectMemberTemplate,
	useProjectMembers,
	useRemoveProjectMember,
	useReplaceProjectMembers,
	useUpdateProject,
	useUpdateProjectMember,
} from "@/hooks/use-projects"
import { cn } from "@/lib/utils"
import type {
	MemberDetail,
	MemberRole,
	ProjectDetail,
	ProjectDetailViewMode,
	ProjectStatus,
	ProjectStatusHistory,
} from "@/types"
import { MOCK_PROJECT_STATUS_HISTORIES } from "./project-detail.mock"
import { ProjectMemberBulkUpdateDialog } from "./project-member-bulk-update-dialog"

interface ProjectDetailViewProps {
	project: ProjectDetail
	viewMode: ProjectDetailViewMode
}

type DialogState =
	| "member-add"
	| "member-edit"
	| "member-bulk-update"
	| "status-history"
	| "status-confirm"
	| "status-success"
	| "project-delete"
	| "member-record-delete"
	| null

const PROJECT_STATUS_OPTIONS: ProjectStatus[] = ["active", "maintenance", "ended"]

const STATUS_LABEL: Record<ProjectStatus, string> = {
	active: "활성화",
	maintenance: "유지보수",
	ended: "종결",
}

const ACTIVITY_MEMBERS_PER_PAGE = 5
type ActivityStatusFilterValue = "활동 중" | "과거 활동" | "전체"

const STATUS_DOT_CLASS: Record<ProjectStatus, string> = {
	active: "bg-[#7aee7f]",
	maintenance: "bg-[#caa8f6]",
	ended: "bg-black-400",
}

const ACTIVITY_STATUS_DOT_CLASS: Record<"활동 중" | "과거 활동", string> = {
	"활동 중": "bg-[#7aee7f]",
	"과거 활동": "bg-black-400",
}

const toDisplayDate = (isoDate: string | null) => {
	if (!isoDate) return "미정"
	return isoDate.replaceAll("-", ".")
}

const memberActivityStatus = (member: MemberDetail): "활동 중" | "과거 활동" =>
	member.left_at == null ? "활동 중" : "과거 활동"

function StatusBadge({ status }: { status: ProjectStatus }) {
	return (
		<DotStatusBadge dotClassName={STATUS_DOT_CLASS[status]} className="text-[15px] tracking-normal">
			{STATUS_LABEL[status]}
		</DotStatusBadge>
	)
}

function ActivityStatusBadge({ status }: { status: "활동 중" | "과거 활동" }) {
	return <DotStatusBadge dotClassName={ACTIVITY_STATUS_DOT_CLASS[status]}>{status}</DotStatusBadge>
}

function SectionRow({
	title,
	children,
	className,
}: {
	title: string
	children: React.ReactNode
	className?: string
}) {
	return (
		<section className={cn("grid grid-cols-[96px_minmax(0,1fr)] gap-x-[39px]", className)}>
			<h2 className="pt-[2px] text-[15px] font-medium leading-[21px] tracking-[-0.3px] text-black-900">
				{title}
			</h2>
			{children}
		</section>
	)
}

export function ProjectDetailView({ project, viewMode }: ProjectDetailViewProps) {
	const [searchQuery, setSearchQuery] = useState("")
	const [showPastMembers, setShowPastMembers] = useState(false)
	const [activityStatusFilter, setActivityStatusFilter] =
		useState<ActivityStatusFilterValue>("활동 중")
	const [selectedMember, setSelectedMember] = useState<MemberDetail | null>(null)
	const [pendingStatus, setPendingStatus] = useState(project.status)
	const [dialog, setDialog] = useState<DialogState>(null)
	const [toastMessage, setToastMessage] = useState("")
	const [showToast, setShowToast] = useState(false)
	const isAdmin = viewMode === "admin"
	const hasPendingStatusChange = pendingStatus !== project.status

	const updateProject = useUpdateProject()
	const addProjectMember = useAddProjectMember()
	const updateProjectMember = useUpdateProjectMember()
	const removeProjectMember = useRemoveProjectMember()
	const deleteProject = useDeleteProject()
	const replaceProjectMembers = useReplaceProjectMembers()
	const downloadTemplate = useDownloadProjectMemberTemplate()

	useEffect(() => {
		setPendingStatus(project.status)
	}, [project.status])

	// GET /projects/{id}/members — status로 서버 필터링(활동중/과거활동), keyword는 클라이언트에서 필터링.
	const serverStatus = showPastMembers ? "inactive" : "active"
	const { data: memberPage, isLoading: isMembersLoading } = useProjectMembers(project.id, {
		status: serverStatus,
		limit: 100,
	})
	const membersOfCurrentTab = memberPage?.items ?? []
	const totalCount = membersOfCurrentTab.length

	const visibleMembers = useMemo(() => {
		const statusFilteredSource =
			!showPastMembers && activityStatusFilter !== "전체"
				? membersOfCurrentTab.filter(
						(member) => memberActivityStatus(member) === activityStatusFilter,
					)
				: membersOfCurrentTab
		const normalizedQuery = searchQuery.trim().toLowerCase()
		if (!normalizedQuery) return statusFilteredSource

		return statusFilteredSource.filter((member) =>
			[member.user.name, member.position ?? "", member.user.email ?? ""]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery),
		)
	}, [activityStatusFilter, membersOfCurrentTab, searchQuery, showPastMembers])

	const openMemberEdit = (member: MemberDetail) => {
		setSelectedMember(member)
		setDialog("member-edit")
	}

	const showMockToast = (message: string) => {
		setToastMessage(message)
		setShowToast(true)
	}

	const commitStatusChange = async () => {
		try {
			await updateProject.mutateAsync({ projectId: project.id, data: { status: pendingStatus } })
			setDialog("status-success")
		} catch (error) {
			setDialog(null)
			showMockToast(error instanceof Error ? error.message : "운영 상태 변경에 실패했습니다.")
		}
	}

	const handleAddMember = async (input: { userId: number; role: MemberRole; position: string }) => {
		try {
			await addProjectMember.mutateAsync({
				projectId: project.id,
				data: { user_id: input.userId, role: input.role, position: input.position || null },
			})
			setDialog(null)
		} catch (error) {
			showMockToast(error instanceof Error ? error.message : "팀원 추가에 실패했습니다.")
		}
	}

	const handleUpdateMember = async (input: { role: MemberRole; position: string }) => {
		if (!selectedMember) return
		try {
			await updateProjectMember.mutateAsync({
				projectId: project.id,
				userId: selectedMember.user.id,
				data: { role: input.role, position: input.position || null },
			})
			setDialog(null)
		} catch (error) {
			showMockToast(error instanceof Error ? error.message : "팀원 수정에 실패했습니다.")
		}
	}

	const handleRemoveMember = async () => {
		if (!selectedMember) return
		try {
			await removeProjectMember.mutateAsync({
				projectId: project.id,
				userId: selectedMember.user.id,
			})
			setDialog(null)
		} catch (error) {
			showMockToast(error instanceof Error ? error.message : "팀원 기록 삭제에 실패했습니다.")
		}
	}

	const handleDeleteProject = async () => {
		try {
			await deleteProject.mutateAsync(project.id)
			setDialog(null)
		} catch (error) {
			showMockToast(error instanceof Error ? error.message : "프로젝트 삭제에 실패했습니다.")
		}
	}

	return (
		<div className="flex w-full flex-col gap-[40px] pb-[80px]">
			<header className="flex items-end gap-[30px]">
				<h1 className="text-[36px] font-medium leading-none text-black-900">프로젝트 상세</h1>
				<div className="flex h-[25px] flex-col justify-between">
					<span className="text-[14px] font-medium leading-[18px] tracking-[-0.28px] text-black-900">
						{project.name}
					</span>
					<span className="h-[3px] w-full bg-peach-300" />
				</div>
			</header>

			<div className="flex flex-col gap-[60px]">
				<ActivityMembersSection
					members={visibleMembers}
					totalCount={totalCount}
					isLoading={isMembersLoading}
					searchQuery={searchQuery}
					showPastMembers={showPastMembers}
					activityStatusFilter={activityStatusFilter}
					isAdmin={isAdmin}
					onSearchChange={setSearchQuery}
					onTogglePast={() => setShowPastMembers((prev) => !prev)}
					onActivityStatusFilterChange={setActivityStatusFilter}
					onResetActivityStatusFilter={() => setActivityStatusFilter("전체")}
					onOpenAdd={() => setDialog("member-add")}
					onOpenEdit={openMemberEdit}
					onBulkUpdate={() => setDialog("member-bulk-update")}
				/>

				<RelatedLinksSection websites={project.websites ?? []} />

				<OperatingStatusSection
					status={pendingStatus}
					onStatusChange={setPendingStatus}
					onSave={() => setDialog("status-confirm")}
					canSave={hasPendingStatusChange}
					onOpenHistory={() => setDialog("status-history")}
				/>

				{isAdmin && <ProjectDeleteSection onDelete={() => setDialog("project-delete")} />}
			</div>

			<ProjectMemberAddDialog
				open={dialog === "member-add"}
				onOpenChange={(open) => setDialog(open ? "member-add" : null)}
				onSubmit={handleAddMember}
				isSubmitting={addProjectMember.isPending}
			/>
			<ProjectMemberEditDialog
				member={selectedMember}
				open={dialog === "member-edit"}
				onOpenChange={(open) => setDialog(open ? "member-edit" : null)}
				onDeleteRecord={() => setDialog("member-record-delete")}
				onSubmit={handleUpdateMember}
				isSubmitting={updateProjectMember.isPending}
			/>
			<ProjectMemberBulkUpdateDialog
				open={dialog === "member-bulk-update"}
				onOpenChange={(open) => setDialog(open ? "member-bulk-update" : null)}
				onSubmit={async (files) => {
					const file = files[0]
					if (!file) return
					await replaceProjectMembers.mutateAsync({ projectId: project.id, file })
					setDialog(null)
				}}
				onDownloadTemplate={() => {
					downloadTemplate.mutate(project.id, {
						onSuccess: (blob) => {
							const url = URL.createObjectURL(blob)
							const link = document.createElement("a")
							link.href = url
							link.download = `project-${project.id}-members.xlsx`
							link.click()
							URL.revokeObjectURL(url)
						},
						onError: (downloadError) => {
							showMockToast(
								downloadError instanceof Error
									? downloadError.message
									: "양식 다운로드에 실패했습니다.",
							)
						},
					})
				}}
				isSubmitting={replaceProjectMembers.isPending}
			/>
			<ProjectStatusHistoryDialog
				open={dialog === "status-history"}
				histories={MOCK_PROJECT_STATUS_HISTORIES}
				onOpenChange={(open) => setDialog(open ? "status-history" : null)}
			/>
			<SmallAlertDialog
				open={dialog === "status-confirm"}
				title="프로젝트 정보를 변경하시겠습니까?"
				onOpenChange={(open) => setDialog(open ? "status-confirm" : null)}
				onConfirm={commitStatusChange}
			/>
			<SmallAlertDialog
				open={dialog === "status-success"}
				title="성공적으로 변경이 완료되었습니다."
				confirmOnly
				onOpenChange={(open) => setDialog(open ? "status-success" : null)}
				onConfirm={() => setDialog(null)}
			/>
			<SmallAlertDialog
				open={dialog === "project-delete"}
				title="프로젝트를 삭제하시겠습니까?"
				onOpenChange={(open) => setDialog(open ? "project-delete" : null)}
				onConfirm={handleDeleteProject}
			/>
			<SmallAlertDialog
				open={dialog === "member-record-delete"}
				title="정말로 해당 기록을 삭제하시겠습니까?"
				description="기록을 삭제하면, 해당 회원은 이 팀과 관련된 활동 이력을 추가할 수 없게 됩니다. 팀원의 활동이 마무리된 경우에는 기록을 삭제하는 대신 활동 기간 종료일을 수정해 주세요."
				onOpenChange={(open) => setDialog(open ? "member-record-delete" : "member-edit")}
				onConfirm={handleRemoveMember}
			/>
			<Toast
				message={toastMessage}
				isVisible={showToast}
				onClose={() => setShowToast(false)}
				variant="error"
			/>
		</div>
	)
}

interface ActivityMembersSectionProps {
	members: MemberDetail[]
	totalCount: number
	isLoading: boolean
	searchQuery: string
	showPastMembers: boolean
	activityStatusFilter: ActivityStatusFilterValue
	isAdmin: boolean
	onSearchChange: (value: string) => void
	onTogglePast: () => void
	onActivityStatusFilterChange: (value: ActivityStatusFilterValue) => void
	onResetActivityStatusFilter: () => void
	onOpenAdd: () => void
	onOpenEdit: (member: MemberDetail) => void
	onBulkUpdate: () => void
}

function ActivityMembersSection({
	members,
	totalCount,
	isLoading,
	searchQuery,
	showPastMembers,
	activityStatusFilter,
	isAdmin,
	onSearchChange,
	onTogglePast,
	onActivityStatusFilterChange,
	onResetActivityStatusFilter,
	onOpenAdd,
	onOpenEdit,
	onBulkUpdate,
}: ActivityMembersSectionProps) {
	const [currentPage, setCurrentPage] = useState(1)
	const totalPages = Math.max(1, Math.ceil(members.length / ACTIVITY_MEMBERS_PER_PAGE))
	const paginatedMembers = members.slice(
		(currentPage - 1) * ACTIVITY_MEMBERS_PER_PAGE,
		currentPage * ACTIVITY_MEMBERS_PER_PAGE,
	)

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages)
		}
	}, [currentPage, totalPages])

	return (
		<SectionRow title={showPastMembers ? "과거 활동 팀원" : "활동 팀원"}>
			<div className="flex min-w-0 flex-col gap-[20px]">
				<div className="flex h-[36px] items-center justify-between">
					<div className="flex items-center gap-[15px]">
						<SearchInput
							containerClassName="h-[36px] w-[260px]"
							placeholder="검색어를 입력해 주세요"
							value={searchQuery}
							onChange={(event) => onSearchChange(event.target.value)}
						/>
						<button
							type="button"
							onClick={onOpenAdd}
							className="flex h-[36px] items-center justify-center rounded-[3px] bg-peach-300 px-[24px] text-[14px] font-semibold leading-[20px] text-white transition-colors hover:bg-peach-500 active:bg-peach-500"
						>
							추가
						</button>
						{isAdmin && (
							<button
								type="button"
								onClick={onBulkUpdate}
								className="flex h-[36px] items-center justify-center rounded-[3px] bg-peach-50 px-[18px] text-[14px] font-semibold leading-[20px] text-peach-500 transition-colors hover:bg-peach-100 active:bg-peach-100"
							>
								팀원 일괄 수정
							</button>
						)}
						<button
							type="button"
							onClick={onTogglePast}
							className={cn(
								"relative flex h-[36px] min-w-[136px] items-center justify-center overflow-hidden rounded-[3px] border border-black-300 bg-white px-[14px] text-[14px] font-medium text-black-900 transition-all duration-300 hover:bg-black-100 active:scale-[0.98]",
								showPastMembers && "border-peach-300 bg-peach-50 text-peach-500",
							)}
						>
							<span className="transition-transform duration-300">
								{showPastMembers ? "활동 팀원 보기" : "과거 활동 팀원 보기"}
							</span>
						</button>
					</div>
					<FilterTagGroup
						className={cn(
							"transition-all duration-300",
							showPastMembers && "pointer-events-none translate-x-[8px] opacity-0",
						)}
					>
						{activityStatusFilter !== "전체" && (
							<>
								<FilterTag label={activityStatusFilter} onClick={onResetActivityStatusFilter} />
								<FilterResetButton onClick={onResetActivityStatusFilter}>초기화</FilterResetButton>
							</>
						)}
					</FilterTagGroup>
				</div>

				<h3 className="sr-only">
					{showPastMembers ? "과거 활동 팀원" : "활동 팀원"} ({totalCount})
				</h3>
				{isLoading && (
					<p className="py-[20px] text-center text-[14px] text-black-600">불러오는 중...</p>
				)}
				<div
					className={cn(
						"w-full overflow-x-auto bg-white transition-all duration-300",
						isLoading && "hidden",
						showPastMembers && "translate-y-[2px]",
					)}
				>
					<DesignTable className="w-full min-w-[1000px]">
						<thead>
							<DesignTableHeaderRow>
								<DesignTableHeaderCell className="w-[180px]">이름</DesignTableHeaderCell>
								<DesignTableHeaderCell className="w-[200px]">포지션</DesignTableHeaderCell>
								<DesignTableHeaderCell>이메일</DesignTableHeaderCell>
								<DesignTableHeaderCell className="w-[100px]">
									<div className="flex items-center gap-[6px]">
										활동 상태
										<ActivityStatusFilter
											value={activityStatusFilter}
											onChange={onActivityStatusFilterChange}
										/>
									</div>
								</DesignTableHeaderCell>
								<DesignTableHeaderCell className="w-[180px]">활동 기간</DesignTableHeaderCell>
								<DesignTableHeaderCell className="w-[80px] text-center">수정</DesignTableHeaderCell>
							</DesignTableHeaderRow>
						</thead>
						<tbody>
							{paginatedMembers.map((member) => (
								<DesignTableRow key={member.id} className="h-[50px]">
									<DesignTableBodyCell className="overflow-visible">
										<div className="flex items-center gap-[6px]">
											<span className="whitespace-nowrap">{member.user.name}</span>
											{member.role === "leader" && <TagBadge>팀장</TagBadge>}
										</div>
									</DesignTableBodyCell>
									<DesignTableBodyCell className="truncate">{member.position}</DesignTableBodyCell>
									<DesignTableBodyCell className="max-w-0 truncate">
										{member.user.email}
									</DesignTableBodyCell>
									<DesignTableBodyCell className="w-[100px]">
										<ActivityStatusBadge status={memberActivityStatus(member)} />
									</DesignTableBodyCell>
									<DesignTableBodyCell className="truncate">
										{toDisplayDate(member.joined_at)} - {toDisplayDate(member.left_at)}
									</DesignTableBodyCell>
									<DesignTableBodyCell className="px-0">
										<button
											type="button"
											aria-label={`${member.user.name} 팀원 수정`}
											onClick={() => onOpenEdit(member)}
											className="mx-auto flex size-[36px] items-center justify-center rounded-[4px] text-black-800 transition-colors hover:bg-black-100"
										>
											<MoreHorizontal className="size-[24px]" strokeWidth={1.8} />
										</button>
									</DesignTableBodyCell>
								</DesignTableRow>
							))}
						</tbody>
					</DesignTable>
				</div>
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
				/>
			</div>
		</SectionRow>
	)
}

function ActivityStatusFilter({
	value,
	onChange,
}: {
	value: ActivityStatusFilterValue
	onChange: (value: ActivityStatusFilterValue) => void
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<FilterTrigger aria-label="활동 상태 필터" />
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-[125px] rounded-[6px] border-black-300 bg-white p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
			>
				<DropdownMenuRadioGroup
					value={value}
					onValueChange={(next) => onChange(next as ActivityStatusFilterValue)}
				>
					{(["전체", "활동 중", "과거 활동"] satisfies ActivityStatusFilterValue[]).map(
						(status) => (
							<DropdownMenuFilterRadioItem key={status} value={status}>
								{status}
							</DropdownMenuFilterRadioItem>
						),
					)}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

function RelatedLinksSection({ websites }: { websites: NonNullable<ProjectDetail["websites"]> }) {
	return (
		<SectionRow title="관련 링크">
			<div className="w-[1456px] max-w-full overflow-x-auto bg-white">
				<div className="min-w-[960px] border-black-300 border-t">
					{websites.length === 0 && (
						<div className="flex h-[50px] items-center px-[20px] text-[14px] text-black-600">
							등록된 링크가 없습니다.
						</div>
					)}
					{websites.map((website) => (
						<div key={website.url} className="flex h-[40px] border-black-300 border-b">
							<div className="flex w-[220px] items-center overflow-hidden px-[80px] text-[14px] font-normal whitespace-nowrap text-black-900">
								{website.type}
							</div>
							<a
								href={website.url}
								target="_blank"
								rel="noreferrer"
								className="flex min-w-0 flex-1 items-center gap-[4px] overflow-hidden px-[20px] text-[14px] font-normal whitespace-nowrap text-black-600 hover:underline"
							>
								<span className="truncate">{website.description || website.url}</span>
								<ArrowUpRight className="size-[20px] shrink-0" strokeWidth={1.6} />
							</a>
						</div>
					))}
				</div>
			</div>
		</SectionRow>
	)
}

function OperatingStatusSection({
	status,
	onStatusChange,
	onSave,
	canSave,
	onOpenHistory,
}: {
	status: ProjectStatus
	onStatusChange: (status: ProjectStatus) => void
	onSave: () => void
	canSave: boolean
	onOpenHistory: () => void
}) {
	return (
		<SectionRow title="운영 상태">
			<div className="flex items-start gap-[10px]">
				<div className="flex w-[140px] flex-col gap-[10px]">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								className="flex h-[42px] w-[140px] items-center justify-between rounded-[5px] border border-black-300 bg-white px-[12px] text-[14px] text-black-900 transition-colors hover:border-peach-300"
							>
								<StatusBadge status={status} />
								<ChevronDown className="size-[18px] text-black-600" strokeWidth={1.7} />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="start"
							className="w-[140px] rounded-[6px] border-black-300 bg-white p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
						>
							<DropdownMenuRadioGroup
								value={status}
								onValueChange={(next) => onStatusChange(next as ProjectStatus)}
							>
								{PROJECT_STATUS_OPTIONS.map((option) => (
									<DropdownMenuFilterRadioItem key={option} value={option}>
										{STATUS_LABEL[option]}
									</DropdownMenuFilterRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
					<button
						type="button"
						onClick={onOpenHistory}
						className="text-left text-[12px] font-medium leading-[17px] tracking-[-0.24px] text-black-900 underline-offset-[3px] hover:underline"
					>
						변경 이력 보기
					</button>
				</div>
				<button
					type="button"
					onClick={onSave}
					disabled={!canSave}
					className="flex h-[42px] items-center justify-center rounded-[4px] bg-black-500 px-[30px] text-[15px] font-medium leading-[24px] whitespace-nowrap text-white transition-colors hover:bg-black-600 active:bg-black-600 disabled:cursor-not-allowed disabled:bg-black-500"
				>
					저장
				</button>
			</div>
		</SectionRow>
	)
}

function ProjectStatusHistoryDialog({
	open,
	histories,
	onOpenChange,
}: {
	open: boolean
	histories: ProjectStatusHistory[]
	onOpenChange: (open: boolean) => void
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DesignDialogContent
				className="w-[534px] max-w-[calc(100vw-32px)] overflow-visible rounded-[15px] border-0 px-[50px] pt-[10px] pb-[40px] shadow-none"
				showDesignClose
				onClose={() => onOpenChange(false)}
			>
				<div className="mt-[10px] flex flex-col gap-[50px]">
					<DialogTitle className="text-[24px] font-medium leading-normal text-black-900">
						운영 상태 변경 이력
					</DialogTitle>
					<div className="flex flex-col items-end gap-[40px]">
						<div className="w-[434px] border-black-300 border-t">
							{histories.map((history) => (
								<div
									key={`${history.status}-${history.startDate}`}
									className="flex h-[80px] items-center justify-between border-black-300 border-b px-[20px]"
								>
									<span className="text-[15px] font-medium tracking-[-0.3px] text-black-900">
										{STATUS_LABEL[history.status]}
									</span>
									<div className="flex items-center gap-[5px]">
										<CalendarDateField
											value={history.startDate}
											onChange={() => undefined}
											className="h-[42px] w-[140px] rounded-[6px] border-black-300 px-[10px] text-[14px] leading-[20px] text-black-900"
										/>
										<span className="text-[15px] text-black-300">-</span>
										<CalendarDateField
											value={history.endDate}
											onChange={() => undefined}
											className="h-[42px] w-[140px] rounded-[6px] border-black-300 px-[10px] text-[14px] leading-[20px] text-black-900"
											popoverClassName="right-0"
										/>
									</div>
								</div>
							))}
						</div>
						<div className="flex h-[50px] items-center gap-[10px]">
							<DialogActionButton variant="cancel" onClick={() => onOpenChange(false)}>
								취소
							</DialogActionButton>
							<DialogActionButton onClick={() => onOpenChange(false)}>확인</DialogActionButton>
						</div>
					</div>
				</div>
			</DesignDialogContent>
		</Dialog>
	)
}

function ProjectDeleteSection({ onDelete }: { onDelete: () => void }) {
	return (
		<SectionRow title="프로젝트 삭제">
			<button
				type="button"
				onClick={onDelete}
				className="flex h-[40px] w-[108px] items-center justify-center rounded-[4px] bg-[#ffeaea] text-[14px] font-semibold leading-[24px] text-[#f44949] transition-colors hover:bg-[#ffdada] active:bg-[#ffd0d0]"
			>
				프로젝트 삭제
			</button>
		</SectionRow>
	)
}

function useMemberSearch(query: string) {
	const { data } = useUsers(undefined, 20, { name: query, enabled: query.trim().length > 0 })
	return data?.items ?? []
}

function MemberSearchSelect({
	selectedUserId,
	selectedLabel,
	onSelect,
}: {
	selectedUserId: number | null
	selectedLabel: string
	onSelect: (userId: number, label: string) => void
}) {
	const [query, setQuery] = useState("")
	const results = useMemberSearch(query)

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex h-[42px] w-[300px] items-center gap-[10px] rounded-[5px] border border-black-300 bg-white px-[10px] text-left text-[14px] text-black-600 transition-colors hover:border-peach-300 focus-visible:border-peach-300 focus-visible:outline-none"
				>
					<Search className="size-[20px] shrink-0 text-black-600" strokeWidth={1.8} aria-hidden />
					<span className={cn("truncate", !selectedLabel && "text-black-600")}>
						{selectedLabel || "이름을 검색해 보세요."}
					</span>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-[300px] rounded-[6px] border-black-300 bg-white p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
			>
				<div className="p-[5px]">
					<Input
						autoFocus
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="이름을 검색해 보세요."
						className="h-[36px] rounded-[4px] border-black-300 text-[13px]"
					/>
				</div>
				<DropdownMenuRadioGroup
					value={selectedUserId != null ? String(selectedUserId) : ""}
					onValueChange={() => undefined}
				>
					{results.map((user) => (
						<DropdownMenuFilterRadioItem
							key={user.id}
							value={String(user.id)}
							onClick={() => onSelect(user.id, `${user.name}(${user.student_id ?? user.id})`)}
						>
							{user.name}
							{user.student_id ? `(${user.student_id})` : ""}
						</DropdownMenuFilterRadioItem>
					))}
					{results.length === 0 && (
						<p className="px-[10px] py-[8px] text-[13px] text-black-600">검색 결과가 없습니다.</p>
					)}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

function ProjectMemberAddDialog({
	open,
	onOpenChange,
	onSubmit,
	isSubmitting,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (input: { userId: number; role: MemberRole; position: string }) => void
	isSubmitting: boolean
}) {
	const [userId, setUserId] = useState<number | null>(null)
	const [userLabel, setUserLabel] = useState("")
	const [isLeader, setIsLeader] = useState(false)
	const [position, setPosition] = useState("")

	useEffect(() => {
		if (!open) return
		setUserId(null)
		setUserLabel("")
		setIsLeader(false)
		setPosition("")
	}, [open])

	const handleSubmit = () => {
		if (userId == null) return
		onSubmit({ userId, role: isLeader ? "leader" : "member", position })
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DesignDialogContent className="!w-[587px] !max-w-[calc(100vw-32px)] overflow-visible rounded-[15px] border-0 shadow-none">
				<div className="flex flex-col gap-[10px] overflow-visible px-[10px] pt-[10px] pb-[40px]">
					<button
						type="button"
						aria-label="닫기"
						onClick={() => onOpenChange(false)}
						className="ml-auto flex size-[35px] shrink-0 items-center justify-center text-black-800 transition-colors hover:text-black-900"
					>
						<X className="size-[28px]" strokeWidth={2.4} />
					</button>
					<div className="flex w-full flex-col items-end">
						<div className="flex w-full flex-col gap-[50px] px-[40px]">
							<DialogTitle className="w-[420px] text-[24px] font-medium leading-normal text-black-900">
								팀원 추가
							</DialogTitle>
							<div className="flex flex-col items-end gap-[40px]">
								<div className="w-[487px] border-black-300 border-t">
									<MemberDialogRow label="이름">
										<MemberSearchSelect
											selectedUserId={userId}
											selectedLabel={userLabel}
											onSelect={(id, label) => {
												setUserId(id)
												setUserLabel(label)
											}}
										/>
									</MemberDialogRow>
									<MemberDialogRow label="팀장 여부">
										<div className="flex items-center gap-[50px]">
											<RadioButton checked={isLeader} onClick={() => setIsLeader(true)}>
												예
											</RadioButton>
											<RadioButton checked={!isLeader} onClick={() => setIsLeader(false)}>
												아니오
											</RadioButton>
										</div>
									</MemberDialogRow>
									<MemberDialogRow label="포지션">
										<Input
											value={position}
											onChange={(event) => setPosition(event.target.value)}
											placeholder="포지션을 입력해 주세요."
											className="h-[42px] w-[300px] rounded-[5px] border-black-300 px-[10px] text-[14px] tracking-[-0.28px] text-black-900 shadow-none placeholder:text-black-600 focus-visible:border-peach-300 focus-visible:ring-0"
										/>
									</MemberDialogRow>
								</div>
								<div className="flex h-[50px] items-center gap-[10px]">
									<DialogActionButton variant="cancel" onClick={() => onOpenChange(false)}>
										취소
									</DialogActionButton>
									<DialogActionButton
										onClick={handleSubmit}
										disabled={userId == null || isSubmitting}
									>
										확인
									</DialogActionButton>
								</div>
							</div>
						</div>
					</div>
				</div>
			</DesignDialogContent>
		</Dialog>
	)
}

function ProjectMemberEditDialog({
	member,
	open,
	onOpenChange,
	onDeleteRecord,
	onSubmit,
	isSubmitting,
}: {
	member: MemberDetail | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onDeleteRecord: () => void
	onSubmit: (input: { role: MemberRole; position: string }) => void
	isSubmitting: boolean
}) {
	const [isLeader, setIsLeader] = useState(member?.role === "leader")
	const [position, setPosition] = useState(member?.position ?? "")

	useEffect(() => {
		if (!open) return
		setIsLeader(member?.role === "leader")
		setPosition(member?.position ?? "")
	}, [member, open])

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DesignDialogContent className="!w-[587px] !max-w-[calc(100vw-32px)] overflow-visible rounded-[15px] border-0 shadow-none">
				<div className="flex flex-col gap-[10px] overflow-visible px-[10px] pt-[10px] pb-[40px]">
					<button
						type="button"
						aria-label="닫기"
						onClick={() => onOpenChange(false)}
						className="ml-auto flex size-[35px] shrink-0 items-center justify-center text-black-800 transition-colors hover:text-black-900"
					>
						<X className="size-[28px]" strokeWidth={2.4} />
					</button>
					<div className="flex w-full flex-col items-end">
						<div className="flex w-full flex-col gap-[50px] px-[40px]">
							<DialogTitle className="w-[420px] text-[24px] font-medium leading-normal text-black-900">
								팀원 수정
							</DialogTitle>
							<div className="flex flex-col items-end gap-[40px]">
								<div className="w-[487px] border-black-300 border-t">
									<MemberDialogRow label="이름">
										<span className="text-[14px] text-black-900">{member?.user.name}</span>
									</MemberDialogRow>
									<MemberDialogRow label="팀장 여부">
										<div className="flex items-center gap-[50px]">
											<RadioButton checked={isLeader} onClick={() => setIsLeader(true)}>
												예
											</RadioButton>
											<RadioButton checked={!isLeader} onClick={() => setIsLeader(false)}>
												아니오
											</RadioButton>
										</div>
									</MemberDialogRow>
									<MemberDialogRow label="포지션">
										<Input
											value={position}
											onChange={(event) => setPosition(event.target.value)}
											placeholder="포지션을 입력해 주세요."
											className="h-[42px] w-[300px] rounded-[5px] border-black-300 px-[10px] text-[14px] tracking-[-0.28px] text-black-900 shadow-none placeholder:text-black-600 focus-visible:border-peach-300 focus-visible:ring-0"
										/>
									</MemberDialogRow>
									<MemberDialogRow label="기록 삭제">
										<DialogActionButton
											variant="danger"
											size="sm"
											onClick={onDeleteRecord}
											className="h-[36px] rounded-[3px] px-[16px] text-[14px]"
										>
											기록 삭제
										</DialogActionButton>
									</MemberDialogRow>
								</div>
								<div className="flex h-[50px] items-center gap-[10px]">
									<DialogActionButton variant="cancel" onClick={() => onOpenChange(false)}>
										취소
									</DialogActionButton>
									<DialogActionButton
										onClick={() => onSubmit({ role: isLeader ? "leader" : "member", position })}
										disabled={isSubmitting}
									>
										확인
									</DialogActionButton>
								</div>
							</div>
						</div>
					</div>
				</div>
			</DesignDialogContent>
		</Dialog>
	)
}

function MemberDialogRow({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex h-[70px] items-center border-black-300 border-b">
			<div className="flex h-full w-[100px] shrink-0 items-center px-[20px] text-[15px] font-medium tracking-[-0.3px] text-black-900">
				{label}
			</div>
			<div className="flex min-w-0 flex-1 items-center px-[20px]">{children}</div>
		</div>
	)
}

function RadioButton({
	checked,
	children,
	onClick,
}: {
	checked: boolean
	children: React.ReactNode
	onClick: () => void
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center gap-[8px] text-[14px] font-medium leading-[14px] text-black-900"
		>
			<span
				className={cn(
					"flex size-[16px] items-center justify-center rounded-full border",
					checked ? "border-black-900" : "border-black-400",
				)}
			>
				{checked && <span className="size-[8px] rounded-full bg-black-900" />}
			</span>
			{children}
		</button>
	)
}

function SmallAlertDialog({
	open,
	title,
	description,
	confirmOnly,
	onOpenChange,
	onConfirm,
}: {
	open: boolean
	title: string
	description?: string
	confirmOnly?: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: () => void
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DesignDialogContent className="w-[340px] max-w-[calc(100vw-32px)] rounded-[12px] border border-black-300 px-[40px] pt-[30px] pb-[26px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.06)]">
				<DialogTitle className="sr-only">{title}</DialogTitle>
				<div className="flex flex-col items-end gap-[40px]">
					<div className="flex w-full flex-col gap-[15px]">
						<p className="text-[15px] font-medium leading-[1.4] text-black-900">{title}</p>
						{description && (
							<p className="text-[12px] font-normal leading-[1.4] tracking-[-0.36px] text-black-600">
								{description}
							</p>
						)}
					</div>
					<div className="flex items-center gap-[10px]">
						{!confirmOnly && (
							<DialogActionButton variant="cancel" size="sm" onClick={() => onOpenChange(false)}>
								취소
							</DialogActionButton>
						)}
						<DialogActionButton size="sm" onClick={onConfirm}>
							확인
						</DialogActionButton>
					</div>
				</div>
			</DesignDialogContent>
		</Dialog>
	)
}
