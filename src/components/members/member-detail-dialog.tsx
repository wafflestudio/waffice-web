"use client"

import { Check, UserRound, X as XIcon } from "lucide-react"
import type * as React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SelectField } from "@/components/ui/select-field"
import { Toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import type { AccessRight, Member, MemberUpdate, Website } from "@/types"

interface MemberDetailDialogProps {
	member: Member | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onMemberUpdate?: (id: number, data: MemberUpdate) => Promise<void>
}

const ROLE_OPTIONS = ["활동회원", "정회원", "준회원", "가입대기"] as const
const ENROLLMENT_OPTIONS = ["학부생", "대학원생", "휴학생", "졸업생"] as const
const ACCESS_RIGHT_OPTIONS = ["운영진", "팀장"] satisfies AccessRight[]
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
					"flex size-[16px] items-center justify-center rounded-[3.5px]",
					checked ? "bg-peach-300 text-white" : "border border-black-500 bg-white text-transparent",
				)}
			>
				{checked && <Check className="size-[10px]" strokeWidth={3} />}
			</span>
			<span className="text-[14px] font-normal tracking-[-0.28px] text-black-700">{right}</span>
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

export function MemberDetailDialog({
	member,
	open,
	onOpenChange,
	onMemberUpdate,
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
	const [showRequiredToast, setShowRequiredToast] = useState(false)

	useEffect(() => {
		if (!member || !open) return

		setRole(
			ROLE_OPTIONS.includes(member.role as (typeof ROLE_OPTIONS)[number])
				? (member.role as (typeof ROLE_OPTIONS)[number])
				: "활동회원",
		)
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
		setAccessRights(member.access_rights || [])
		setConfirmOpen(false)
		setShowRequiredToast(false)
	}, [member, open])

	if (!member) return null

	const toggleAccessRight = (right: AccessRight) => {
		setAccessRights((prev) =>
			prev.includes(right) ? prev.filter((item) => item !== right) : [...prev, right],
		)
	}

	const hasRequiredFields = () =>
		Boolean(role.trim() && generation.trim() && email.trim() && enrollment.trim())

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
				role,
				generation,
				github_username: githubId,
				affiliation: enrollment,
				access_rights: accessRights,
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
					className="!block !w-[1500px] !max-w-none max-h-[calc(100vh-40px)] overflow-y-auto rounded-[12px] border-0 bg-white p-0 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
					showCloseButton={false}
				>
					<div className="flex min-h-[782px] w-full flex-col items-center bg-white pb-[40px]">
						<div className="flex h-[40px] w-full shrink-0 justify-end px-[10px] pt-[10px]">
							<DialogClose className="flex size-[35px] items-center justify-center text-black-900 transition-opacity hover:opacity-70">
								<XIcon className="size-[24px]" strokeWidth={2.2} />
								<span className="sr-only">닫기</span>
							</DialogClose>
						</div>

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
									<div className="flex w-[1100px] items-start justify-between pt-[10px]">
										<div className="flex flex-col">
											<SelectField
												label="자격"
												value={role}
												options={ROLE_OPTIONS}
												onChange={setRole}
												required
												className={FIELD_ROW_CLASS}
												labelClassName={FIELD_LABEL_CLASS}
												triggerClassName={FIELD_CLASS}
												contentClassName="w-[360px]"
												itemClassName="h-[40px] px-[16px] text-[14px]"
											/>
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
											<div className={cn(FIELD_ROW_CLASS, "gap-[30px]")}>
												<p className={FIELD_LABEL_CLASS}>접근 권한</p>
												<div className="flex items-center gap-[37px]">
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

										<div className="flex flex-col">
											<SelectField
												label="재학여부"
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
									</div>

									<div className="flex w-full justify-end">
										<div className="flex h-[50px] items-center gap-[10px]">
											<button
												type="button"
												onClick={() => onOpenChange(false)}
												className="flex h-[50px] w-[121px] items-center justify-center rounded-[4px] border border-black-300 bg-white text-[15px] font-semibold leading-[24px] text-black-900 transition-colors hover:bg-black-100 active:bg-black-300"
											>
												취소
											</button>
											<button
												type="button"
												onClick={handleSubmitClick}
												className="flex h-[50px] w-[121px] items-center justify-center rounded-[4px] bg-peach-300 text-[15px] font-semibold leading-[24px] text-white transition-colors hover:bg-peach-500 active:bg-peach-500"
											>
												확인
											</button>
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
