"use client"

import { Check, ChevronDown, X as XIcon } from "lucide-react"
import { useState } from "react"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterRadioItem,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Application {
	id: number
	name: string
	generation: string
	email: string
	application_date: string
	role?: string
	status: string
	affiliation?: string | null
}

interface ApplicationFormProps {
	application: Application
	onApprove: (id: number, role: string) => void
	onReject: (id: number) => void
	trigger?: React.ReactNode
}

const ROLE_OPTIONS = ["활동회원", "정회원", "준회원"] as const

const toSelectableRole = (role?: string): string =>
	role && (ROLE_OPTIONS as readonly string[]).includes(role) ? role : "활동회원"

export function ApplicationForm({
	application,
	onApprove,
	onReject,
	trigger,
}: ApplicationFormProps) {
	const [open, setOpen] = useState(false)
	const [step, setStep] = useState<1 | 2>(1)
	// 신청자가 가입 시 고른 자격(requested_qualification 기반)을 기본 선택값으로 사용한다.
	const [selectedRole, setSelectedRole] = useState<string>(toSelectableRole(application.role))

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen)
		if (!nextOpen) {
			setStep(1)
			setSelectedRole(toSelectableRole(application.role))
		}
	}

	const handleReject = () => {
		onReject(application.id)
		setOpen(false)
	}

	const handleConfirm = () => {
		onApprove(application.id, selectedRole)
		setOpen(false)
	}

	const closeButton = (
		<DialogClose asChild>
			<button
				type="button"
				className="size-[35px] flex items-center justify-center hover:opacity-70"
			>
				<XIcon className="size-5" strokeWidth={2.5} />
				<span className="sr-only">닫기</span>
			</button>
		</DialogClose>
	)

	const isPending = application.status === "대기" || application.status === "pending"

	const infoRows = (
		<div className="w-full flex flex-col">
			<div className="h-[80px] flex items-center border-t border-b border-[#dbdfe0]">
				<div className="w-[150px] shrink-0 px-[20px] text-[15px] font-medium text-[#121212] tracking-[-0.3px]">
					이름
				</div>
				<div className="flex-1 px-[20px] text-[15px] font-normal text-[#121212] tracking-[-0.3px]">
					{application.name}
				</div>
			</div>
			<div className="h-[80px] flex items-center border-b border-[#dbdfe0]">
				<div className="w-[150px] shrink-0 px-[20px] text-[15px] font-medium text-[#121212] tracking-[-0.3px]">
					자격
				</div>
				<div className="flex-1 px-[20px]">
					{isPending ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									className="h-[42px] w-[140px] flex items-center justify-between px-[8px] border border-[#dbdfe0] rounded-[6px] text-[14px] font-medium text-[#121212]"
								>
									{selectedRole}
									<ChevronDown className="size-4 text-[#121212]" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="start"
								className="w-[140px] min-w-0 rounded-[6px] border-[#dbdfe0] p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
							>
								<DropdownMenuRadioGroup value={selectedRole} onValueChange={setSelectedRole}>
									{ROLE_OPTIONS.map((role) => (
										<DropdownMenuFilterRadioItem key={role} value={role}>
											{role}
										</DropdownMenuFilterRadioItem>
									))}
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<span className="text-[15px] font-normal text-[#121212] tracking-[-0.3px]">
							{application.role || "-"}
						</span>
					)}
				</div>
			</div>
			<div className="h-[80px] flex items-center border-b border-[#dbdfe0]">
				<div className="w-[150px] shrink-0 px-[20px] text-[15px] font-medium text-[#121212] tracking-[-0.3px]">
					기수
				</div>
				<div className="flex-1 px-[20px] text-[15px] font-normal text-[#121212] tracking-[-0.3px]">
					{application.generation}
				</div>
			</div>
			<div className="h-[80px] flex items-center border-b border-[#dbdfe0]">
				<div className="w-[150px] shrink-0 px-[20px] text-[15px] font-medium text-[#121212] tracking-[-0.3px]">
					이메일
				</div>
				<div className="flex-1 px-[20px] text-[15px] font-normal text-[#121212]">
					{application.email}
				</div>
			</div>
			<div className="h-[80px] flex items-center border-b border-[#dbdfe0]">
				<div className="w-[150px] shrink-0 px-[20px] text-[15px] font-medium text-[#121212] tracking-[-0.3px]">
					재학여부
				</div>
				<div className="flex-1 px-[20px] text-[15px] font-normal text-[#121212]">
					{application.affiliation || "-"}
				</div>
			</div>
		</div>
	)

	const step1Content = (
		<DialogContent
			showCloseButton={false}
			className="w-[600px] max-w-[600px] rounded-[15px] p-0 gap-0 overflow-hidden"
		>
			<div className="pt-[10px] px-[10px] pb-[40px] flex flex-col items-end gap-[10px]">
				{closeButton}
				<div className="w-full px-[40px] flex flex-col gap-[50px]">
					<DialogTitle className="text-[24px] font-medium text-[#121212]">
						{isPending ? "가입 대기 회원" : "가입 승인 회원"}
					</DialogTitle>
					<div className="flex flex-col gap-[40px] items-center w-full">
						{infoRows}
						<div className="flex items-center gap-[10px] self-end">
							{isPending ? (
								<>
									<DialogActionButton variant="cancel" onClick={handleReject}>
										반려
									</DialogActionButton>
									<DialogActionButton onClick={() => setStep(2)}>승인</DialogActionButton>
								</>
							) : (
								<>
									<DialogActionButton variant="cancel" onClick={() => setOpen(false)}>
										취소
									</DialogActionButton>
									<DialogActionButton onClick={() => setOpen(false)} className="w-auto px-[50px]">
										회원 상세로 이동
									</DialogActionButton>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</DialogContent>
	)

	const step2Content = (
		<DialogContent
			showCloseButton={false}
			className="w-[460px] max-w-[460px] rounded-[12px] p-0 gap-0"
		>
			<div className="pt-[10px] px-[10px] pb-[40px] flex flex-col items-end gap-[10px]">
				{closeButton}
				<div className="w-full px-[40px] flex flex-col gap-[50px]">
					<DialogTitle className="text-[24px] font-medium text-[#121212]">
						회원 가입 승인
					</DialogTitle>
					<div className="flex flex-col gap-[40px] items-end">
						{/* 자격 선택 영역 */}
						<div className="flex flex-col gap-[10px] items-start">
							<span className="text-[15px] font-medium text-[#121212]">자격</span>
							<div className="w-[360px] border border-[#dbdfe0] rounded-[5px]">
								{ROLE_OPTIONS.map((role) => (
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
											<Check
												className="text-[#e75010]"
												style={{ width: 12, height: 12 }}
												strokeWidth={2.5}
											/>
										)}
									</button>
								))}
							</div>
						</div>
						{/* 하단 버튼 */}
						<div className="flex items-center gap-[16px]">
							<DialogActionButton
								variant="cancel"
								onClick={() => setStep(1)}
								className="w-auto px-[50px] text-[17px] font-medium"
							>
								취소
							</DialogActionButton>
							<DialogActionButton
								onClick={handleConfirm}
								className="w-auto px-[50px] text-[17px] font-medium"
							>
								확인
							</DialogActionButton>
						</div>
					</div>
				</div>
			</div>
		</DialogContent>
	)

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			{step === 1 ? step1Content : step2Content}
		</Dialog>
	)
}
