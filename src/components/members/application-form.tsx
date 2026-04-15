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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Application {
	id: number
	name: string
	generation: string
	email: string
	github_username: string
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

const ROLE_OPTIONS = ["활동회원", "준회원", "정회원"] as const

export function ApplicationForm({
	application,
	onApprove,
	onReject,
	trigger,
}: ApplicationFormProps) {
	const [open, setOpen] = useState(false)
	const [step, setStep] = useState<1 | 2>(1)
	const [selectedRole, setSelectedRole] = useState<string>(application.role || "활동회원")

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen)
		if (!nextOpen) {
			setStep(1)
			setSelectedRole(application.role || "활동회원")
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
				className="size-[35px] flex items-center justify-center opacity-70 hover:opacity-100"
			>
				<XIcon className="size-4" />
				<span className="sr-only">닫기</span>
			</button>
		</DialogClose>
	)

	const step1Content = (
		<DialogContent
			showCloseButton={false}
			className="w-[600px] max-w-[600px] rounded-[15px] p-0 gap-0"
		>
			<div className="pt-[10px] px-[10px] pb-[40px] flex flex-col items-end gap-[10px]">
				{closeButton}
				<DialogTitle className="w-full text-[24px] font-medium text-[#121212] px-[40px]">
					가입대기 회원 정보
				</DialogTitle>
				{/* 정보 테이블 */}
				<div className="w-full border border-[#dbdfe0] rounded-[5px]">
					{/* 이름 */}
					<div className="h-[90px] flex items-center border-b border-[#dbdfe0]">
						<div className="w-[140px] shrink-0 px-[20px] text-[15px] font-medium text-[#121212]">
							이름
						</div>
						<div className="flex-1 px-[20px] text-[15px] font-normal text-[#121212]">
							{application.name}
						</div>
					</div>
					{/* 자격 */}
					<div className="h-[90px] flex items-center border-b border-[#dbdfe0]">
						<div className="w-[140px] shrink-0 px-[20px] text-[15px] font-medium text-[#121212]">
							자격
						</div>
						<div className="flex-1 px-[20px]">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button
										type="button"
										className="flex items-center gap-1 text-[15px] text-[#121212]"
									>
										{selectedRole}
										<ChevronDown className="size-4" />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuRadioGroup value={selectedRole} onValueChange={setSelectedRole}>
										{ROLE_OPTIONS.map((role) => (
											<DropdownMenuRadioItem key={role} value={role}>
												{role}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
					{/* 기수 */}
					<div className="h-[90px] flex items-center border-b border-[#dbdfe0]">
						<div className="w-[140px] shrink-0 px-[20px] text-[15px] font-medium text-[#121212]">
							기수
						</div>
						<div className="flex-1 px-[20px] text-[15px] font-normal text-[#121212]">
							{application.generation}
						</div>
					</div>
					{/* 이메일 */}
					<div className="h-[90px] flex items-center border-b border-[#dbdfe0]">
						<div className="w-[140px] shrink-0 px-[20px] text-[15px] font-medium text-[#121212]">
							이메일
						</div>
						<div className="flex-1 px-[20px] text-[15px] font-normal text-[#121212]">
							{application.email}
						</div>
					</div>
					{/* Github 아이디 */}
					<div className="h-[90px] flex items-center border-b border-[#dbdfe0]">
						<div className="w-[140px] shrink-0 px-[20px] text-[15px] font-medium text-[#121212]">
							Github 아이디
						</div>
						<div className="flex-1 px-[20px] text-[15px] font-normal text-[#121212]">
							{application.github_username || "-"}
						</div>
					</div>
					{/* 재학여부 */}
					<div className="h-[90px] flex items-center border-b border-[#dbdfe0]">
						<div className="w-[140px] shrink-0 px-[20px] text-[15px] font-medium text-[#121212]">
							재학여부
						</div>
						<div className="flex-1 px-[20px] text-[15px] font-normal text-[#121212]">
							{application.affiliation || "-"}
						</div>
					</div>
					{/* 가입 신청일 */}
					<div className="h-[90px] flex items-center">
						<div className="w-[140px] shrink-0 px-[20px] text-[15px] font-medium text-[#121212]">
							가입 신청일
						</div>
						<div className="flex-1 px-[20px] text-[15px] font-normal text-[#121212]">
							{new Date(application.application_date).toLocaleDateString("ko-KR")}
						</div>
					</div>
				</div>
				{/* 하단 버튼 */}
				<div className="flex justify-end gap-[16px]">
					<button
						type="button"
						onClick={handleReject}
						className="w-[126px] h-[50px] border border-[#999] rounded-[4px] text-[15px] font-semibold text-[#121212] bg-white"
					>
						반려
					</button>
					<button
						type="button"
						onClick={() => setStep(2)}
						className="w-[126px] h-[50px] bg-[#f77153] rounded-[4px] text-[15px] font-semibold text-white"
					>
						승인
					</button>
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
				<DialogTitle className="w-full text-[24px] font-medium text-[#121212] px-[40px]">
					회원 가입 승인
				</DialogTitle>
				{/* 자격 선택 영역 */}
				<div className="w-full px-[40px] flex flex-col gap-[10px]">
					<span className="text-[15px] font-medium text-[#121212]">자격</span>
					<div className="w-[360px] border border-[#dbdfe0] rounded-[5px]">
						{ROLE_OPTIONS.map((role, index) => (
							<button
								key={role}
								type="button"
								onClick={() => setSelectedRole(role)}
								className={`w-full h-[50px] flex items-center justify-between px-[16px]${
									index < ROLE_OPTIONS.length - 1 ? " border-b border-[#dbdfe0]" : ""
								}`}
							>
								<span
									className={`text-[15px] font-medium ${
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
				<div className="flex justify-end gap-[16px]">
					<button
						type="button"
						onClick={() => setStep(1)}
						className="w-[126px] h-[50px] border border-[#999] rounded-[4px] text-[15px] font-semibold text-[#121212]"
					>
						취소
					</button>
					<button
						type="button"
						onClick={handleConfirm}
						className="w-[126px] h-[50px] bg-[#f77153] rounded-[4px] text-[15px] font-semibold text-white"
					>
						확인
					</button>
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
