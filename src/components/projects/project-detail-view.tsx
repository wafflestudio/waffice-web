"use client"

import { ArrowUpRight, ChevronDown, MoreHorizontal, Plus, Search, X } from "lucide-react"
import type * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { CalendarDateField } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
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
import { cn } from "@/lib/utils"
import type {
	ProjectDetail,
	ProjectDetailMember,
	ProjectDetailViewMode,
	ProjectManagementStatus,
} from "@/types"
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

const PROJECT_STATUS_OPTIONS: ProjectManagementStatus[] = ["활성화", "유지보수", "종결"]
const ACTIVITY_MEMBERS_PER_PAGE = 5
type ActivityStatusFilterValue = ProjectDetailMember["status"] | "전체"

const STATUS_DOT_CLASS: Record<ProjectManagementStatus, string> = {
	활성화: "bg-[#7aee7f]",
	유지보수: "bg-[#caa8f6]",
	종결: "bg-black-400",
}

const ACTIVITY_STATUS_DOT_CLASS: Record<ProjectDetailMember["status"], string> = {
	"활동 중": "bg-[#7aee7f]",
	비활성화: "bg-black-400",
}

function StatusBadge({ status }: { status: ProjectManagementStatus }) {
	return (
		<DotStatusBadge dotClassName={STATUS_DOT_CLASS[status]} className="text-[15px] tracking-normal">
			{status}
		</DotStatusBadge>
	)
}

function ActivityStatusBadge({ status }: { status: ProjectDetailMember["status"] }) {
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
	const [members, setMembers] = useState(project.activeMembers)
	const [pastMembers] = useState(project.pastMembers)
	const [selectedMember, setSelectedMember] = useState<ProjectDetailMember | null>(null)
	const [currentStatus, setCurrentStatus] = useState(project.status)
	const [pendingStatus, setPendingStatus] = useState(project.status)
	const [dialog, setDialog] = useState<DialogState>(null)
	const [toastMessage, setToastMessage] = useState("")
	const [showToast, setShowToast] = useState(false)
	const isAdmin = viewMode === "admin"
	const hasPendingStatusChange = pendingStatus !== currentStatus

	const visibleMembers = useMemo(() => {
		const source = showPastMembers ? pastMembers : members
		const statusFilteredSource =
			!showPastMembers && activityStatusFilter !== "전체"
				? source.filter((member) => member.status === activityStatusFilter)
				: source
		const normalizedQuery = searchQuery.trim().toLowerCase()
		if (!normalizedQuery) return statusFilteredSource

		return statusFilteredSource.filter((member) =>
			[member.name, member.position, member.email, member.githubId, member.studentNumber]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery),
		)
	}, [activityStatusFilter, members, pastMembers, searchQuery, showPastMembers])

	const openMemberEdit = (member: ProjectDetailMember) => {
		setSelectedMember(member)
		setDialog("member-edit")
	}

	const handleStatusSave = (status: ProjectManagementStatus) => {
		setPendingStatus(status)
		setDialog("status-confirm")
	}

	const commitStatusChange = () => {
		setCurrentStatus(pendingStatus)
		setDialog("status-success")
	}

	const showMockToast = (message: string) => {
		setToastMessage(message)
		setShowToast(true)
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
					totalCount={showPastMembers ? pastMembers.length : members.length}
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
					onStatusChange={(memberId, status) =>
						setMembers((prev) =>
							prev.map((member) => (member.id === memberId ? { ...member, status } : member)),
						)
					}
					onBulkUpdate={() => setDialog("member-bulk-update")}
				/>

				<RelatedLinksSection
					linkGroups={project.linkGroups}
					isAdmin={isAdmin}
					onAddLink={(groupName) => showMockToast(`${groupName} 링크 추가 API 연결 전입니다.`)}
				/>

				<OperatingStatusSection
					status={pendingStatus}
					onStatusChange={setPendingStatus}
					onSave={() => handleStatusSave(pendingStatus)}
					canSave={hasPendingStatusChange}
					onOpenHistory={() => setDialog("status-history")}
				/>

				{isAdmin && <ProjectDeleteSection onDelete={() => setDialog("project-delete")} />}
			</div>

			<ProjectMemberDialog
				mode="add"
				open={dialog === "member-add"}
				onOpenChange={(open) => setDialog(open ? "member-add" : null)}
				onSubmit={() => {
					setDialog(null)
					showMockToast("팀원 추가 API 연결 전입니다.")
				}}
			/>
			<ProjectMemberDialog
				mode="edit"
				member={selectedMember}
				open={dialog === "member-edit"}
				onOpenChange={(open) => setDialog(open ? "member-edit" : null)}
				onDeleteRecord={() => setDialog("member-record-delete")}
				onSubmit={() => {
					setDialog(null)
					showMockToast("팀원 수정 API 연결 전입니다.")
				}}
			/>
			<ProjectMemberBulkUpdateDialog
				open={dialog === "member-bulk-update"}
				onOpenChange={(open) => setDialog(open ? "member-bulk-update" : null)}
				onSubmit={async (files) => {
					// TODO(API): 프로젝트별 팀원 일괄 수정 API가 준비되면 project.id와 files를
					// multipart mutation으로 전송하고 팀원 목록 query를 invalidate한다.
					setDialog(null)
					showMockToast(`${files.length}개 파일이 선택되었습니다. API 연결 후 반영됩니다.`)
				}}
				onDownloadTemplate={() => {
					// TODO(API): 백엔드 또는 정적 asset의 실제 팀원 명부 양식 다운로드로 교체한다.
					showMockToast("팀원 명부 양식은 API 연결 후 제공됩니다.")
				}}
			/>
			<ProjectStatusHistoryDialog
				open={dialog === "status-history"}
				histories={project.statusHistories}
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
				onConfirm={() => {
					setDialog(null)
					showMockToast("프로젝트 삭제 API 연결 전입니다.")
				}}
			/>
			<SmallAlertDialog
				open={dialog === "member-record-delete"}
				title="정말로 해당 기록을 삭제하시겠습니까?"
				description="기록을 삭제하면, 해당 회원은 이 팀과 관련된 활동 이력을 추가할 수 없게 됩니다. 팀원의 활동이 마무리된 경우에는 기록을 삭제하는 대신 활동 기간 종료일을 수정해 주세요."
				onOpenChange={(open) => setDialog(open ? "member-record-delete" : "member-edit")}
				onConfirm={() => {
					setDialog(null)
					showMockToast("팀원 기록 삭제 API 연결 전입니다.")
				}}
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
	members: ProjectDetailMember[]
	totalCount: number
	searchQuery: string
	showPastMembers: boolean
	activityStatusFilter: ActivityStatusFilterValue
	isAdmin: boolean
	onSearchChange: (value: string) => void
	onTogglePast: () => void
	onActivityStatusFilterChange: (value: ActivityStatusFilterValue) => void
	onResetActivityStatusFilter: () => void
	onOpenAdd: () => void
	onOpenEdit: (member: ProjectDetailMember) => void
	onStatusChange: (memberId: number, status: ProjectDetailMember["status"]) => void
	onBulkUpdate: () => void
}

function ActivityMembersSection({
	members,
	totalCount,
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
	onStatusChange,
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
				<div
					className={cn(
						"w-full overflow-x-auto bg-white transition-all duration-300",
						showPastMembers && "translate-y-[2px]",
					)}
				>
					<DesignTable className="w-full min-w-[1000px]">
						<thead>
							<DesignTableHeaderRow>
								<DesignTableHeaderCell className="w-[120px]">이름</DesignTableHeaderCell>
								<DesignTableHeaderCell className="w-[200px]">포지션</DesignTableHeaderCell>
								<DesignTableHeaderCell>이메일</DesignTableHeaderCell>
								<DesignTableHeaderCell>Github 아이디</DesignTableHeaderCell>
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
									<DesignTableBodyCell className="truncate">
										<div className="flex min-w-0 items-center gap-[6px]">
											<span className="truncate">{member.name}</span>
											{member.isLeader && <TagBadge>팀장</TagBadge>}
										</div>
									</DesignTableBodyCell>
									<DesignTableBodyCell className="truncate">{member.position}</DesignTableBodyCell>
									<DesignTableBodyCell className="max-w-0 truncate">
										{member.email}
									</DesignTableBodyCell>
									<DesignTableBodyCell className="max-w-0 truncate">
										{member.githubId}
									</DesignTableBodyCell>
									<DesignTableBodyCell className="w-[100px]">
										<ActivityStatusSelect
											value={member.status}
											disabled={showPastMembers}
											onChange={(status) => onStatusChange(member.id, status)}
										/>
									</DesignTableBodyCell>
									<DesignTableBodyCell className="truncate">
										{member.startDate} - {member.endDate}
									</DesignTableBodyCell>
									<DesignTableBodyCell className="px-0">
										<button
											type="button"
											aria-label={`${member.name} 팀원 수정`}
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
					{(["전체", "활동 중", "비활성화"] satisfies ActivityStatusFilterValue[]).map((status) => (
						<DropdownMenuFilterRadioItem key={status} value={status}>
							{status}
						</DropdownMenuFilterRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

function ActivityStatusSelect({
	value,
	disabled,
	onChange,
}: {
	value: ProjectDetailMember["status"]
	disabled?: boolean
	onChange: (value: ProjectDetailMember["status"]) => void
}) {
	if (disabled) {
		return <ActivityStatusBadge status={value} />
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button type="button" className="outline-none">
					<ActivityStatusBadge status={value} />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-[125px] rounded-[6px] border-black-300 bg-white p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
			>
				<DropdownMenuRadioGroup
					value={value}
					onValueChange={(next) => onChange(next as ProjectDetailMember["status"])}
				>
					{(["활동 중", "비활성화"] satisfies ProjectDetailMember["status"][]).map((status) => (
						<DropdownMenuFilterRadioItem key={status} value={status} className="h-[40px]">
							{status}
						</DropdownMenuFilterRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

function RelatedLinksSection({
	linkGroups,
	isAdmin,
	onAddLink,
}: {
	linkGroups: ProjectDetail["linkGroups"]
	isAdmin: boolean
	onAddLink: (groupName: string) => void
}) {
	const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
		Object.fromEntries(linkGroups.map((group) => [group.name, group.name !== "ETC"])),
	)

	const toggleGroup = (groupName: string) => {
		setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }))
	}

	return (
		<SectionRow title="관련 링크">
			<div className="w-[1456px] max-w-full overflow-x-auto bg-white">
				<div className="min-w-[960px] border-black-300 border-t">
					{linkGroups.map((group) => {
						const isExpanded = expandedGroups[group.name] ?? false

						return (
							<div key={group.name}>
								<div className="flex h-[50px] items-center border-black-300 border-b bg-white">
									<button
										type="button"
										onClick={() => toggleGroup(group.name)}
										aria-expanded={isExpanded}
										className="flex h-full flex-1 items-center gap-[10px] px-[20px] text-[14px] font-medium leading-[1.4] whitespace-nowrap text-black-900"
									>
										<ChevronDown
											className={cn(
												"size-[24px] text-black-800 transition-transform",
												isExpanded && "rotate-180",
											)}
											strokeWidth={1.7}
										/>
										{group.name} ({group.links.length})
									</button>
									{isAdmin && (
										<button
											type="button"
											onClick={() => onAddLink(group.name)}
											className="mr-[20px] flex h-[37px] items-center gap-[8px] rounded-[3px] px-[10px] text-[14px] font-medium leading-[17px] whitespace-nowrap text-black-800 transition-colors hover:bg-black-100"
										>
											<Plus className="size-[16px]" strokeWidth={1.8} />
											링크추가
										</button>
									)}
								</div>
								{isExpanded &&
									group.links.map((link) => (
										<div key={link.id} className="flex h-[40px] border-black-300 border-b">
											<div className="flex w-[220px] items-center overflow-hidden px-[80px] text-[14px] font-normal whitespace-nowrap text-black-900">
												{link.type}
											</div>
											<a
												href={link.url}
												target="_blank"
												rel="noreferrer"
												className="flex min-w-0 flex-1 items-center gap-[4px] overflow-hidden px-[20px] text-[14px] font-normal whitespace-nowrap text-black-600 hover:underline"
											>
												<span className="truncate">{link.label}</span>
												<ArrowUpRight className="size-[20px] shrink-0" strokeWidth={1.6} />
											</a>
										</div>
									))}
							</div>
						)
					})}
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
	status: ProjectManagementStatus
	onStatusChange: (status: ProjectManagementStatus) => void
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
								onValueChange={(next) => onStatusChange(next as ProjectManagementStatus)}
							>
								{PROJECT_STATUS_OPTIONS.map((option) => (
									<DropdownMenuFilterRadioItem key={option} value={option}>
										{option}
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

function ProjectStatusHistoryDialog({
	open,
	histories,
	onOpenChange,
}: {
	open: boolean
	histories: ProjectDetail["statusHistories"]
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
									key={history.status}
									className="flex h-[80px] items-center justify-between border-black-300 border-b px-[20px]"
								>
									<span className="text-[15px] font-medium tracking-[-0.3px] text-black-900">
										{history.status}
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

function ProjectMemberDialog({
	mode,
	member,
	open,
	onOpenChange,
	onDeleteRecord,
	onSubmit,
}: {
	mode: "add" | "edit"
	member?: ProjectDetailMember | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onDeleteRecord?: () => void
	onSubmit: () => void
}) {
	const [startDate, setStartDate] = useState(member?.startDate ?? "YYYY.MM.DD")
	const [endDate, setEndDate] = useState(
		member?.endDatePending ? "YYYY.MM.DD" : (member?.endDate ?? "YYYY.MM.DD"),
	)
	const [endDatePending, setEndDatePending] = useState(member?.endDatePending ?? true)
	const [isLeader, setIsLeader] = useState(member?.isLeader ?? true)

	useEffect(() => {
		if (!open) return

		setStartDate(member?.startDate ?? "YYYY.MM.DD")
		setEndDate(member?.endDatePending ? "YYYY.MM.DD" : (member?.endDate ?? "YYYY.MM.DD"))
		setEndDatePending(member?.endDatePending ?? true)
		setIsLeader(member?.isLeader ?? true)
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
								{mode === "add" ? "팀원 추가" : "팀원 수정"}
							</DialogTitle>
							<div className="flex flex-col items-end gap-[40px]">
								<div className="w-[487px] border-black-300 border-t">
									<MemberDialogRow label="이름">
										<MemberSearchSelect
											initialLabel={member ? `${member.name}(${member.studentNumber})` : undefined}
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
											defaultValue={member?.position ?? ""}
											placeholder="포지션을 입력해 주세요."
											className="h-[42px] w-[300px] rounded-[5px] border-black-300 px-[10px] text-[14px] tracking-[-0.28px] text-black-900 shadow-none placeholder:text-black-600 focus-visible:border-peach-300 focus-visible:ring-0"
										/>
									</MemberDialogRow>
									<MemberDialogRow label="활동 기간">
										<div className="flex w-full items-center gap-[10px]">
											<div className="flex shrink-0 items-center gap-[5px]">
												<CalendarDateField
													value={startDate}
													onChange={setStartDate}
													className="h-[42px] w-[140px] rounded-[6px] border-black-300 px-[10px] text-[14px] leading-[20px] text-black-600"
												/>
												<span className="text-[15px] text-black-300">-</span>
												<CalendarDateField
													value={endDate}
													onChange={setEndDate}
													className="h-[42px] w-[140px] rounded-[6px] border-black-300 px-[10px] text-[14px] leading-[20px] text-black-600"
													popoverClassName="right-0"
												/>
											</div>
											<button
												type="button"
												aria-pressed={endDatePending}
												onClick={() => setEndDatePending((prev) => !prev)}
												className="flex shrink-0 cursor-pointer items-center gap-[10px] text-[14px] text-black-700 tracking-[-0.28px]"
											>
												<Checkbox
													checked={endDatePending}
													className="pointer-events-none size-[16px] rounded-[3px] border border-black-500 bg-white text-white shadow-none transition-colors data-[state=checked]:border-peach-300 data-[state=checked]:bg-peach-300 data-[state=unchecked]:bg-white [&_svg]:size-[12px]"
												/>
												미정
											</button>
										</div>
									</MemberDialogRow>
									{mode === "edit" && (
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
									)}
								</div>
								<div className="flex h-[50px] items-center gap-[10px]">
									<DialogActionButton variant="cancel" onClick={() => onOpenChange(false)}>
										취소
									</DialogActionButton>
									<DialogActionButton onClick={onSubmit}>확인</DialogActionButton>
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

function MemberSearchSelect({ initialLabel }: { initialLabel?: string }) {
	const memberSearchOptions = ["김와플(2021-23456)", "목록에 없음"]
	const [selectedLabel, setSelectedLabel] = useState(initialLabel ?? "")

	useEffect(() => {
		setSelectedLabel(initialLabel ?? "")
	}, [initialLabel])

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex h-[42px] w-[300px] items-center gap-[10px] rounded-[5px] border border-black-300 bg-white px-[10px] text-left text-[14px] text-black-600 transition-colors hover:border-peach-300 focus-visible:border-peach-300 focus-visible:outline-none"
				>
					<SearchInputIcon />
					<span className={cn("truncate", !selectedLabel && "text-black-600")}>
						{selectedLabel || "이름을 검색해 보세요."}
					</span>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-[300px] rounded-[6px] border-black-300 bg-white p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
			>
				<DropdownMenuRadioGroup value={selectedLabel} onValueChange={setSelectedLabel}>
					{memberSearchOptions.map((option) => (
						<DropdownMenuFilterRadioItem key={option} value={option}>
							{option}
						</DropdownMenuFilterRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

function SearchInputIcon() {
	return <Search className="size-[20px] shrink-0 text-black-600" strokeWidth={1.8} aria-hidden />
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
