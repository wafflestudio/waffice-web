"use client"

import { UserRound, X as XIcon } from "lucide-react"
import type * as React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import { Input } from "@/components/ui/input"
import { SelectField } from "@/components/ui/select-field"
import { Toast } from "@/components/ui/toast"
import { useUserActivities, useUserAuditLog } from "@/hooks/use-members"
import { cn } from "@/lib/utils"
import type { Member, MemberUpdate, Website } from "@/types"

interface MemberDetailDialogProps {
	member: Member | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onMemberUpdate?: (id: number, data: MemberUpdate) => Promise<void>
}

const ENROLLMENT_OPTIONS = ["학부생", "대학원생", "휴학생", "졸업생"] as const
const FIELD_ROW_CLASS = "relative flex h-[60px] w-[500px] items-center pl-[140px] py-[10px]"
const FIELD_LABEL_CLASS =
	"absolute left-0 top-1/2 flex -translate-y-1/2 items-center text-[14px] font-medium text-black-900"
const FIELD_CLASS =
	"h-[40px] w-[360px] rounded-[5px] border-black-300 bg-white px-[16px] text-[14px] font-normal text-black-900 shadow-none outline-none placeholder:text-black-500 focus-visible:border-peach-300 focus-visible:ring-0"
const SMALL_FIELD_CLASS =
	"h-[40px] w-[175px] rounded-[5px] border-black-300 bg-white px-[16px] text-[14px] font-normal text-black-900 shadow-none outline-none placeholder:text-black-500 focus-visible:border-peach-300 focus-visible:ring-0"

const getLinkedInUrl = (websites?: Website[] | null) =>
	websites?.find((website) => website.type.toLowerCase() === "linkedin")?.url ?? ""

const buildWebsites = (websites: Website[] | null | undefined, linkedInUrl: string) => {
	const nextWebsites = (websites ?? []).filter(
		(website) => website.type.toLowerCase() !== "linkedin",
	)
	const trimmedUrl = linkedInUrl.trim()

	if (trimmedUrl) {
		nextWebsites.push({
			url: trimmedUrl,
			type: "linkedin",
		})
	}

	return nextWebsites.length > 0 ? nextWebsites : null
}

const formatDate = (value?: string | number) => {
	if (!value) return ""

	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return String(value)

	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
		date.getDate(),
	).padStart(2, "0")}`
}

const QUALIFICATION_LABELS: Record<string, string> = {
	active: "활동회원",
	regular: "정회원",
	associate: "준회원",
	pending: "가입 대기",
}

const formatUnixDate = (value?: number | null) => {
	if (value == null) return "-"

	const date = new Date(value * 1000)
	if (Number.isNaN(date.getTime())) return "-"

	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
		date.getDate(),
	).padStart(2, "0")}`
}

const getPayloadText = (payload: Record<string, unknown>, key: string) => {
	const value = payload[key]
	return typeof value === "string" || typeof value === "number" ? String(value) : ""
}

interface HistoryColumn {
	label: string
	width?: number
}

interface HistoryRow {
	id: string | number
	cells: React.ReactNode[]
}

function HistorySection({
	title,
	columns,
	rows,
	isLoading = false,
	isError = false,
}: {
	title: string
	columns: HistoryColumn[]
	rows: HistoryRow[]
	isLoading?: boolean
	isError?: boolean
}) {
	const statusMessage = isLoading
		? "불러오는 중입니다."
		: isError
			? "이력을 불러오지 못했습니다."
			: "(해당 사항 없음.)"

	return (
		<section className="flex w-full flex-col gap-[20px]">
			<h2 className="text-[20px] font-medium leading-normal tracking-[-0.4px] text-black-900">
				{title}
			</h2>
			<div className="w-full overflow-x-auto">
				<table className="w-full min-w-[760px] table-fixed border-collapse bg-white">
					<colgroup>
						{columns.map((column) => (
							<col key={column.label} style={column.width ? { width: column.width } : undefined} />
						))}
					</colgroup>
					<thead>
						<tr className="h-[40px] border-black-300 border-y bg-black-100">
							{columns.map((column) => (
								<th
									key={column.label}
									className="overflow-hidden px-[20px] text-left text-[14px] font-medium leading-normal whitespace-nowrap text-black-900 tracking-[-0.28px]"
								>
									{column.label}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.length > 0 && !isLoading && !isError ? (
							rows.map((row) => (
								<tr key={row.id} className="h-[50px] border-black-300 border-b">
									{row.cells.map((cell, index) => (
										<td
											key={`${row.id}-${columns[index]?.label ?? index}`}
											className="overflow-hidden px-[20px] text-[14px] leading-normal whitespace-nowrap text-black-900 text-ellipsis tracking-[-0.28px]"
										>
											{cell || "-"}
										</td>
									))}
								</tr>
							))
						) : (
							<tr className="h-[50px] border-black-300 border-b">
								<td
									colSpan={columns.length}
									className="px-[20px] text-center text-[14px] font-normal text-black-700 tracking-[-0.28px]"
								>
									{statusMessage}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	)
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
		<div className={FIELD_ROW_CLASS}>
			<span className={FIELD_LABEL_CLASS}>
				{label}
				{required && <span className="text-red-500">*</span>}
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

function ConfirmDialog({
	open,
	onOpenChange,
	onConfirm,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: () => void | Promise<void>
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
					<DialogActionButton variant="cancel" size="sm" onClick={() => onOpenChange(false)}>
						취소
					</DialogActionButton>
					<DialogActionButton size="sm" onClick={onConfirm}>
						확인
					</DialogActionButton>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export function MemberDetailDialog({
	member,
	open,
	onOpenChange,
	onMemberUpdate,
}: MemberDetailDialogProps) {
	const [generation, setGeneration] = useState("")
	const [email, setEmail] = useState("")
	const [githubId, setGithubId] = useState("")
	const [linkedInUrl, setLinkedInUrl] = useState("")
	const [enrollment, setEnrollment] = useState<(typeof ENROLLMENT_OPTIONS)[number]>("학부생")
	const [studentId, setStudentId] = useState("")
	const [department, setDepartment] = useState("")
	const [phone, setPhone] = useState("")
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [showRequiredToast, setShowRequiredToast] = useState(false)
	const historyUserId = open && member ? member.id : null
	const auditLogQuery = useUserAuditLog(historyUserId)
	const activitiesQuery = useUserActivities(historyUserId)

	useEffect(() => {
		if (!member || !open) return

		setGeneration(member.generation || "")
		setEmail(member.user?.contact_email || member.email || "")
		setGithubId(member.github_username || "")
		setLinkedInUrl(getLinkedInUrl(member.user?.websites))
		setEnrollment(
			ENROLLMENT_OPTIONS.includes(member.affiliation as (typeof ENROLLMENT_OPTIONS)[number])
				? (member.affiliation as (typeof ENROLLMENT_OPTIONS)[number])
				: "학부생",
		)
		setStudentId(member.user?.student_id || "")
		setDepartment(member.user?.department || "")
		setPhone(member.phone || "")
		setConfirmOpen(false)
		setShowRequiredToast(false)
	}, [member, open])

	if (!member) return null

	const qualificationRows: HistoryRow[] = (auditLogQuery.data ?? [])
		.filter((entry) => entry.action === "qualification_changed")
		.map((entry) => {
			const from = getPayloadText(entry.payload, "from")
			const to = getPayloadText(entry.payload, "to")
			const reason =
				getPayloadText(entry.payload, "reason") || getPayloadText(entry.payload, "description")

			return {
				id: entry.id,
				cells: [
					formatUnixDate(entry.created_at),
					`${QUALIFICATION_LABELS[from] ?? (from || "-")} → ${QUALIFICATION_LABELS[to] ?? (to || "-")}`,
					reason || "-",
				],
			}
		})
	const projectRows: HistoryRow[] = (activitiesQuery.data ?? [])
		.filter((activity) => activity.project_id !== null || activity.project_name !== null)
		.map((activity) => ({
			id: activity.id,
			cells: [
				activity.project_name || "-",
				`${formatUnixDate(activity.start_date)} - ${
					activity.end_date ? formatUnixDate(activity.end_date) : "현재"
				}`,
				activity.position || "-",
			],
		}))
	const operationRows: HistoryRow[] = (activitiesQuery.data ?? [])
		.filter((activity) => activity.project_id === null && activity.project_name === null)
		.map((activity) => ({
			id: activity.id,
			cells: [
				`${formatUnixDate(activity.start_date)} - ${
					activity.end_date ? formatUnixDate(activity.end_date) : "현재"
				}`,
				activity.position || "-",
			],
		}))

	const hasRequiredFields = () => Boolean(generation.trim() && email.trim() && enrollment.trim())

	const handleSubmitClick = () => {
		if (!hasRequiredFields()) {
			setShowRequiredToast(true)
			return
		}

		setConfirmOpen(true)
	}

	const handleConfirm = async () => {
		try {
			const websites = buildWebsites(member.user?.websites, linkedInUrl)

			await onMemberUpdate?.(member.id, {
				name: member.name,
				email,
				generation,
				github_username: githubId,
				affiliation: enrollment,
				student_id: studentId,
				department,
				phone,
				websites,
			})

			setConfirmOpen(false)
			onOpenChange(false)
		} catch {
			setConfirmOpen(false)
		}
	}

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent
					className="!block !w-[1300px] !max-w-[calc(100vw-40px)] max-h-[calc(100vh-40px)] overflow-hidden rounded-[12px] border-0 bg-white p-0 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
					showCloseButton={false}
				>
					<DialogClose className="absolute top-[10px] right-[10px] z-10 flex size-[35px] items-center justify-center text-black-900 transition-opacity hover:opacity-70">
						<XIcon className="size-[24px]" strokeWidth={2.2} />
						<span className="sr-only">닫기</span>
					</DialogClose>

					<div className="flex max-h-[calc(100vh-40px)] w-full flex-col items-center overflow-y-auto bg-white pt-[40px] pb-[40px]">
						<div className="flex w-[1100px] max-w-[calc(100%-80px)] flex-col gap-[40px]">
							<DialogTitle className="shrink-0 text-[28px] font-medium leading-normal text-black-900">
								회원 상세
							</DialogTitle>

							<div className="flex flex-col gap-[40px]">
								<header className="flex h-[80px] items-center gap-[20px]">
									<div className="flex size-[80px] shrink-0 items-center justify-center rounded-full bg-black-300 text-white">
										<UserRound className="size-[36px]" strokeWidth={1.8} />
									</div>
									<div className="flex flex-col gap-[4px]">
										<p className="text-[18px] font-medium leading-[1.4] tracking-[-0.36px] text-black-900">
											{member.name}
										</p>
										<p className="text-[14px] font-normal leading-[1.4] tracking-[-0.28px] text-black-600">
											{email}
										</p>
									</div>
								</header>

								<section className="flex w-full flex-col gap-[30px]">
									<div className="flex w-full items-start justify-between pt-[10px]">
										<div className="flex flex-col">
											<FieldRow label="자격">
												<Input
													value={member.role || "활동회원"}
													disabled
													readOnly
													className={cn(
														FIELD_CLASS,
														"cursor-not-allowed bg-black-100 text-black-900 opacity-100",
													)}
												/>
											</FieldRow>
											<TextField
												label="기수"
												value={generation}
												onChange={setGeneration}
												required
												placeholder="기수를 입력해주세요"
											/>
											<TextField
												label="Github 아이디"
												value={githubId}
												onChange={setGithubId}
												placeholder="Github 아이디를 입력해주세요"
											/>
											<TextField
												label="소식 수신용 이메일"
												value={email}
												onChange={setEmail}
												placeholder="example@gmail.com"
											/>
											<FieldRow label="계정 생성일">
												<Input
													value={formatDate(member.created_at)}
													disabled
													readOnly
													className={cn(
														FIELD_CLASS,
														"cursor-not-allowed bg-black-100 text-black-500 opacity-100",
													)}
												/>
											</FieldRow>
										</div>

										<div className="flex flex-col">
											<SelectField
												label="학적 상태"
												value={enrollment}
												options={ENROLLMENT_OPTIONS}
												onChange={setEnrollment}
												required
												className={FIELD_ROW_CLASS}
												labelClassName={FIELD_LABEL_CLASS}
												triggerClassName={FIELD_CLASS}
												contentClassName="w-[360px]"
												itemClassName="h-[40px] px-[16px] text-[14px]"
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
										</div>
									</div>

									<HistorySection
										title="회원 자격 변경 이력"
										columns={[
											{ label: "기준일", width: 220 },
											{ label: "내용" },
											{ label: "사유" },
										]}
										rows={qualificationRows}
										isLoading={auditLogQuery.isLoading}
										isError={auditLogQuery.isError}
									/>

									<HistorySection
										title="프로젝트 활동이력"
										columns={[
											{ label: "소속 프로젝트명", width: 220 },
											{ label: "기간", width: 220 },
											{ label: "역할" },
										]}
										rows={projectRows}
										isLoading={activitiesQuery.isLoading}
										isError={activitiesQuery.isError}
									/>

									<HistorySection
										title="운영팀 활동이력"
										columns={[{ label: "기간", width: 220 }, { label: "역할" }]}
										rows={operationRows}
										isLoading={activitiesQuery.isLoading}
										isError={activitiesQuery.isError}
									/>

									<HistorySection
										title="징계 이력"
										columns={[
											{ label: "징계" },
											{ label: "이유" },
											{ label: "의결일", width: 220 },
											{ label: "개시일", width: 220 },
										]}
										rows={[]}
									/>

									<div className="flex w-full justify-end">
										<div className="flex h-[50px] items-center gap-[10px]">
											<DialogActionButton variant="cancel" onClick={() => onOpenChange(false)}>
												취소
											</DialogActionButton>
											<DialogActionButton onClick={handleSubmitClick}>확인</DialogActionButton>
										</div>
									</div>
								</section>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
			<ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={handleConfirm} />
			<Toast
				message="필수 입력사항을 확인해주세요."
				isVisible={showRequiredToast}
				onClose={() => setShowRequiredToast(false)}
				variant="error"
			/>
		</>
	)
}
