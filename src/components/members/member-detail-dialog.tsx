"use client"

import { Check, ChevronDown, ChevronRight, Plus, UserRound, X as XIcon } from "lucide-react"
import type * as React from "react"
import { useEffect, useState } from "react"
import { CalendarDateField } from "@/components/ui/calendar"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterRadioItem,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { SelectField } from "@/components/ui/select-field"
import { cn } from "@/lib/utils"
import type { AccessRight, Member } from "@/types"

interface MemberDetailDialogProps {
	member: Member | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess?: (message: string) => void
}

interface ActivityRow {
	id: number
	projectName: string
	position: string
	status: "활동 중" | "비활동"
	startDate: string
	endDate: string
	description: string
	expanded: boolean
}

const ROLE_OPTIONS = ["활동회원", "정회원", "준회원", "가입대기"] as const
const ENROLLMENT_OPTIONS = ["학부생", "대학원생", "졸업생"] as const
const ACCESS_RIGHT_OPTIONS = ["팀장", "운영진"] satisfies AccessRight[]
const FIELD_CLASS =
	"h-[50px] w-[360px] rounded-[5px] border-black-300 bg-white px-[16px] text-[15px] font-normal text-black-900 shadow-none outline-none placeholder:text-black-500 focus-visible:border-peach-300 focus-visible:ring-0"
const SMALL_FIELD_CLASS =
	"h-[50px] w-[175px] rounded-[5px] border-black-300 bg-white px-[16px] text-[15px] font-normal text-black-900 shadow-none outline-none placeholder:text-black-500 focus-visible:border-peach-300 focus-visible:ring-0"

const formatDate = (value?: string) => {
	if (!value) return ""

	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value

	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
		date.getDate(),
	).padStart(2, "0")}`
}

function FieldRow({
	label,
	required = false,
	children,
}: {
	label: string
	required?: boolean
	children: React.ReactNode
}) {
	return (
		<div className="flex h-[70px] w-[500px] items-center justify-between">
			<span className="flex shrink-0 items-center text-[15px] font-medium tracking-[-0.3px] text-black-900">
				{label}
				{required && <span className="text-[17px] text-red-500">*</span>}
			</span>
			{children}
		</div>
	)
}

function TextField({
	label,
	value,
	onChange,
	required = false,
	placeholder,
}: {
	label: string
	value: string
	onChange: (value: string) => void
	required?: boolean
	placeholder?: string
}) {
	return (
		<FieldRow label={label} required={required}>
			<Input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				className={FIELD_CLASS}
			/>
		</FieldRow>
	)
}

function AccessRightToggle({
	right,
	checked,
	onToggle,
}: {
	right: AccessRight
	checked: boolean
	onToggle: () => void
}) {
	return (
		<button type="button" onClick={onToggle} className="flex items-center gap-[16px]">
			<span
				className={cn(
					"flex size-[20px] items-center justify-center rounded-[4px]",
					checked ? "bg-peach-300 text-white" : "border border-black-500 bg-white text-transparent",
				)}
			>
				{checked && <Check className="size-[12px]" strokeWidth={2.5} />}
			</span>
			<span className="text-[17px] font-normal tracking-[-0.34px] text-black-700">{right}</span>
		</button>
	)
}

function ConfirmDialog({
	open,
	onOpenChange,
	onConfirm,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: () => void
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="w-[360px] max-w-[360px] gap-0 rounded-[12px] border border-black-300 bg-white px-[40px] pt-[30px] pb-[26px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.06)]"
				showCloseButton={false}
			>
				<p className="text-[15px] font-medium leading-[1.4] text-black-900">
					회원 정보를 변경하시겠습니까?
				</p>
				<div className="mt-[40px] flex justify-end gap-[10px]">
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="flex h-[40px] items-center justify-center rounded-[4px] border border-black-500 bg-white px-[30px] text-[15px] font-semibold leading-[24px] text-black-900"
					>
						취소
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="flex h-[40px] items-center justify-center rounded-[4px] bg-peach-300 px-[30px] text-[15px] font-semibold leading-[24px] text-white"
					>
						확인
					</button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

function ActivityHistorySection() {
	const [activities, setActivities] = useState<ActivityRow[]>([
		{
			id: 1,
			projectName: "인터널프로덕트",
			position: "프로젝트장, 디자이너",
			status: "활동 중",
			startDate: "2025.10.01",
			endDate: "2026.04.22",
			description:
				"담당 업무 어쩌고저쩌고 어쩌고저쩌고 어쩌고저쩌고 어쩌고저쩌고 어쩌고저쩌고 어쩌고저쩌고 어쩌고저쩌고",
			expanded: true,
		},
		{
			id: 2,
			projectName: "SNUTT",
			position: "디자이너",
			status: "비활동",
			startDate: "2025.10.01",
			endDate: "2026.04.22",
			description: "",
			expanded: false,
		},
	])
	const [openCalendarKey, setOpenCalendarKey] = useState<string | null>(null)

	const updateActivity = (id: number, data: Partial<ActivityRow>) => {
		setActivities((prev) =>
			prev.map((activity) => (activity.id === id ? { ...activity, ...data } : activity)),
		)
	}

	const handleAdd = () => {
		setActivities((prev) => [
			...prev,
			{
				id: Date.now(),
				projectName: "",
				position: "",
				status: "활동 중",
				startDate: "2026.05.07",
				endDate: "2026.05.07",
				description: "",
				expanded: true,
			},
		])
	}

	return (
		<section className="flex flex-col gap-[15px]">
			<div className="flex items-center justify-between">
				<h3 className="text-[20px] font-medium tracking-[-0.4px] text-black-900">활동 이력</h3>
				<button
					type="button"
					onClick={handleAdd}
					className="flex items-center justify-center rounded-[3px] bg-black-100 px-[8px] py-[6px] text-black-900 hover:bg-black-300 active:bg-black-300"
				>
					<Plus className="size-[16px]" />
					<span className="sr-only">활동 이력 추가</span>
				</button>
			</div>
			{/* TODO: 회원별 활동 이력 API 연결 */}
			<div className="border-black-300 border-t">
				{activities.map((activity) => (
					<div key={activity.id} className="border-black-200 border-b">
						<div className="flex min-h-[78px] items-center">
							<button
								type="button"
								onClick={() => updateActivity(activity.id, { expanded: !activity.expanded })}
								className="flex w-[64px] items-center justify-center"
							>
								<ChevronRight
									className={cn(
										"size-[24px] text-black-600 transition-transform",
										activity.expanded && "rotate-90",
									)}
								/>
								<span className="sr-only">활동 내역 열기</span>
							</button>
							<div className="grid flex-1 grid-cols-[200px_180px_1fr] items-center gap-[16px]">
								<Input
									value={activity.projectName}
									onChange={(event) =>
										updateActivity(activity.id, { projectName: event.target.value })
									}
									placeholder="프로젝트명"
									className="h-[36px] rounded-[5px] border-black-300 text-[15px] shadow-none focus-visible:border-peach-300 focus-visible:ring-0"
								/>
								<Input
									value={activity.position}
									onChange={(event) =>
										updateActivity(activity.id, { position: event.target.value })
									}
									placeholder="역할"
									className="h-[36px] rounded-[5px] border-black-300 text-[14px] shadow-none focus-visible:border-peach-300 focus-visible:ring-0"
								/>
								<div className="flex items-center justify-end gap-[12px]">
									<SelectActivityStatus
										value={activity.status}
										onChange={(status) => updateActivity(activity.id, { status })}
									/>
									<CalendarDateField
										value={activity.startDate}
										onChange={(startDate) => updateActivity(activity.id, { startDate })}
										open={openCalendarKey === `${activity.id}-start`}
										onOpenChange={(open) =>
											setOpenCalendarKey(open ? `${activity.id}-start` : null)
										}
									/>
									<span className="text-[13px] text-black-600">-</span>
									<CalendarDateField
										value={activity.endDate}
										onChange={(endDate) => updateActivity(activity.id, { endDate })}
										open={openCalendarKey === `${activity.id}-end`}
										onOpenChange={(open) => setOpenCalendarKey(open ? `${activity.id}-end` : null)}
									/>
								</div>
							</div>
						</div>
						{activity.expanded && (
							<div className="ml-[64px] pb-[20px]">
								<textarea
									value={activity.description}
									onChange={(event) =>
										updateActivity(activity.id, { description: event.target.value })
									}
									placeholder="담당 업무를 입력해주세요."
									className="h-[70px] w-full resize-none rounded-[5px] border border-black-300 bg-white px-[20px] py-[10px] text-[14px] leading-[21px] text-black-700 outline-none placeholder:text-black-500 focus:border-peach-300"
								/>
							</div>
						)}
					</div>
				))}
			</div>
		</section>
	)
}

function SelectActivityStatus({
	value,
	onChange,
}: {
	value: ActivityRow["status"]
	onChange: (value: ActivityRow["status"]) => void
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex h-[36px] w-[92px] items-center justify-between rounded-[5px] border border-black-300 bg-white px-[10px] text-[13px] text-black-700"
				>
					<span className="flex items-center gap-[8px]">
						<span
							className={cn(
								"size-[10px] rounded-full",
								value === "활동 중" ? "bg-[#84aef1]" : "bg-[#ffd21f]",
							)}
						/>
						{value}
					</span>
					<ChevronDown className="size-[14px]" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-[92px] rounded-[6px] border-black-300 p-[5px]"
			>
				<DropdownMenuRadioGroup
					value={value}
					onValueChange={(next) => onChange(next as ActivityRow["status"])}
				>
					<DropdownMenuFilterRadioItem value="활동 중">활동 중</DropdownMenuFilterRadioItem>
					<DropdownMenuFilterRadioItem value="비활동">비활동</DropdownMenuFilterRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export function MemberDetailDialog({
	member,
	open,
	onOpenChange,
	onSuccess,
}: MemberDetailDialogProps) {
	const [role, setRole] = useState<(typeof ROLE_OPTIONS)[number]>("활동회원")
	const [generation, setGeneration] = useState("")
	const [email, setEmail] = useState("")
	const [githubId, setGithubId] = useState("")
	const [linkedInUrl, setLinkedInUrl] = useState("")
	const [enrollment, setEnrollment] = useState<(typeof ENROLLMENT_OPTIONS)[number]>("학부생")
	const [studentId, setStudentId] = useState("")
	const [department, setDepartment] = useState("")
	const [phone, setPhone] = useState("")
	const [accessRights, setAccessRights] = useState<AccessRight[]>([])
	const [confirmOpen, setConfirmOpen] = useState(false)

	useEffect(() => {
		if (!member || !open) return

		setRole(
			ROLE_OPTIONS.includes(member.role as (typeof ROLE_OPTIONS)[number])
				? (member.role as (typeof ROLE_OPTIONS)[number])
				: "활동회원",
		)
		setGeneration(member.generation || "")
		setEmail(member.email || "")
		setGithubId(member.github_username || "")
		setLinkedInUrl("")
		setEnrollment(
			ENROLLMENT_OPTIONS.includes(member.affiliation as (typeof ENROLLMENT_OPTIONS)[number])
				? (member.affiliation as (typeof ENROLLMENT_OPTIONS)[number])
				: "학부생",
		)
		setStudentId("")
		setDepartment("")
		setPhone(member.phone || "")
		setAccessRights(member.access_rights || [])
		setConfirmOpen(false)
	}, [member, open])

	if (!member) return null

	const toggleAccessRight = (right: AccessRight) => {
		setAccessRights((prev) =>
			prev.includes(right) ? prev.filter((item) => item !== right) : [...prev, right],
		)
	}

	const handleConfirm = () => {
		// TODO: 회원 상세 수정 API 연결
		setConfirmOpen(false)
		onOpenChange(false)
		onSuccess?.("성공적으로 변경이 완료되었습니다.")
	}

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent
					className="!w-[1500px] !max-w-none max-h-[calc(100vh-40px)] overflow-y-auto rounded-[15px] border-0 bg-white p-0 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
					showCloseButton={false}
				>
					<div className="flex h-[1130px] flex-col bg-white">
						<div className="flex h-[40px] shrink-0 justify-end px-[10px] pt-[10px]">
							<DialogClose className="flex size-[35px] items-center justify-center text-black-900 transition-opacity hover:opacity-70">
								<XIcon className="size-[24px]" strokeWidth={2.2} />
								<span className="sr-only">닫기</span>
							</DialogClose>
						</div>

						<div className="mx-auto flex w-[1162px] max-w-[calc(100%-80px)] flex-1 flex-col overflow-hidden pt-0">
							<DialogTitle className="h-[43px] shrink-0 text-[36px] font-medium leading-none text-black-900">
								회원 상세
							</DialogTitle>

							<div className="mt-[50px] flex-1 overflow-y-auto pr-[12px]">
								<div className="flex flex-col gap-[40px] pb-[40px]">
									<header className="flex h-[80px] items-center gap-[20px]">
										<div className="flex size-[80px] shrink-0 items-center justify-center rounded-full bg-black-300 text-black-700">
											<UserRound className="size-[36px]" strokeWidth={1.8} />
										</div>
										<div className="flex flex-col gap-[4px]">
											<p className="text-[20px] font-medium leading-[1.4] tracking-[-0.4px] text-black-900">
												{member.name}
											</p>
											<p className="text-[15px] font-normal leading-[1.4] tracking-[-0.3px] text-black-600">
												{email}
											</p>
										</div>
									</header>

									<section className="flex flex-col gap-[15px]">
										<h3 className="text-[20px] font-medium tracking-[-0.4px] text-black-900">
											회원 정보 수정하기
										</h3>
										<div className="flex justify-between border-black-300 border-t pt-[10px]">
											<div className="flex flex-col">
												<SelectField
													label="자격"
													value={role}
													options={ROLE_OPTIONS}
													onChange={setRole}
													required
												/>
												<TextField
													label="기수"
													value={generation}
													onChange={setGeneration}
													required
													placeholder="기수를 입력해주세요"
												/>
												<TextField label="이메일" value={email} onChange={setEmail} required />
												<TextField
													label="Github 아이디"
													value={githubId}
													onChange={setGithubId}
													placeholder="Github 아이디를 입력해주세요"
												/>
												<div className="flex h-[70px] w-[500px] items-center">
													<div className="flex w-[325px] items-center gap-[85px]">
														<p className="shrink-0 text-[15px] font-medium tracking-[-0.3px] text-black-900">
															접근 권한
														</p>
														<div className="flex items-center gap-[30px]">
															{ACCESS_RIGHT_OPTIONS.map((right) => (
																<AccessRightToggle
																	key={right}
																	right={right}
																	checked={accessRights.includes(right)}
																	onToggle={() => toggleAccessRight(right)}
																/>
															))}
														</div>
													</div>
												</div>
											</div>

											<div className="flex flex-col">
												<SelectField
													label="재학여부"
													value={enrollment}
													options={ENROLLMENT_OPTIONS}
													onChange={setEnrollment}
													required
												/>
												<FieldRow label="학번 · 학과">
													<div className="flex gap-[10px]">
														<Input
															value={studentId}
															onChange={(event) => setStudentId(event.target.value)}
															placeholder="2025-12345"
															className={SMALL_FIELD_CLASS}
														/>
														<Input
															value={department}
															onChange={(event) => setDepartment(event.target.value)}
															placeholder="컴퓨터공학부"
															className={SMALL_FIELD_CLASS}
														/>
													</div>
												</FieldRow>
												<TextField
													label="링크드인 링크"
													value={linkedInUrl}
													onChange={setLinkedInUrl}
													placeholder="URL을 입력해주세요"
												/>
												<TextField
													label="전화번호"
													value={phone}
													onChange={setPhone}
													placeholder="010-1234-5678"
												/>
												<FieldRow label="계정 생성일">
													<Input
														value={formatDate(member.created_at)}
														readOnly
														className={FIELD_CLASS}
													/>
												</FieldRow>
											</div>
										</div>
									</section>

									<ActivityHistorySection />
								</div>
							</div>

							<div className="flex h-[90px] shrink-0 items-start justify-end bg-white pt-[40px]">
								<div className="flex gap-[16px]">
									<button
										type="button"
										onClick={() => onOpenChange(false)}
										className="flex h-[50px] w-[130px] items-center justify-center rounded-[4px] border border-black-300 bg-white text-[15px] font-semibold leading-[24px] text-black-900 transition-colors hover:bg-black-300 active:bg-black-300"
									>
										취소
									</button>
									<button
										type="button"
										onClick={() => setConfirmOpen(true)}
										className="flex h-[50px] w-[130px] items-center justify-center rounded-[4px] bg-peach-300 text-[15px] font-semibold leading-[24px] text-white transition-colors hover:bg-peach-500 active:bg-peach-500"
									>
										확인
									</button>
								</div>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
			<ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={handleConfirm} />
		</>
	)
}
