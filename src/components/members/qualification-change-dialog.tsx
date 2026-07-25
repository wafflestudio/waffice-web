"use client"

import { Check, X as XIcon } from "lucide-react"
import { useEffect, useId, useState } from "react"
import * as z from "zod"
import { DesignDialogContent } from "@/components/ui/design-dialog"
import { Dialog, DialogClose, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import { Label } from "@/components/ui/label"
import { Toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const ROLE_OPTIONS = ["활동회원", "정회원", "준회원", "가입대기"] as const
const DEFAULT_ROLE = "활동회원"

const qualificationChangeSchema = z.object({
	role: z.string().min(1, "자격을 선택해 주세요."),
	reason: z.string().trim().min(1, "변경 사유를 입력해 주세요."),
})

interface QualificationChangeDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (role: string) => Promise<void>
}

export function QualificationChangeDialog({
	open,
	onOpenChange,
	onSubmit,
}: QualificationChangeDialogProps) {
	const [selectedRole, setSelectedRole] = useState(DEFAULT_ROLE)
	const [reason, setReason] = useState("")
	const [reasonError, setReasonError] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")
	const [showErrorToast, setShowErrorToast] = useState(false)
	const reasonId = useId()

	useEffect(() => {
		if (open) {
			setSelectedRole(DEFAULT_ROLE)
			setReason("")
			setReasonError(false)
		}
	}, [open])

	const handleCancel = () => {
		onOpenChange(false)
		setSelectedRole(DEFAULT_ROLE)
		setReason("")
		setReasonError(false)
	}

	const showValidationError = (message: string) => {
		setErrorMessage(message)
		setShowErrorToast(false)
		requestAnimationFrame(() => setShowErrorToast(true))
	}

	const handleSubmit = async () => {
		const result = qualificationChangeSchema.safeParse({ role: selectedRole, reason })

		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors
			setReasonError(Boolean(fieldErrors.reason))
			showValidationError(
				fieldErrors.reason?.[0] ?? fieldErrors.role?.[0] ?? "입력값을 확인해 주세요.",
			)
			return
		}

		setReasonError(false)
		await onSubmit(selectedRole)
		setSelectedRole(DEFAULT_ROLE)
		setReason("")
	}

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DesignDialogContent className="w-[460px] max-w-[460px] overflow-hidden rounded-[12px] border-0 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
					<div className="flex flex-col items-end gap-[10px] w-full pt-[10px] px-[10px] pb-[40px]">
						<DialogClose
							onClick={handleCancel}
							className="shrink-0 size-[35px] flex items-center justify-center rounded-sm opacity-70 hover:opacity-100 transition-opacity"
						>
							<XIcon className="size-5" />
							<span className="sr-only">Close</span>
						</DialogClose>
						<div className="flex flex-col gap-[60px] items-start px-[40px] w-full">
							<DialogTitle className="text-[24px] font-medium text-black-900">
								회원 자격 변경
							</DialogTitle>
							<div className="flex flex-col gap-[40px] items-end w-full">
								<div className="flex flex-col gap-[40px] items-start w-full">
									{/* 자격 선택 */}
									<div className="flex flex-col gap-[10px] items-start">
										<Label className="text-[15px] font-medium text-black-900">자격</Label>
										<div className="border border-black-300 rounded-[5px] w-[360px]">
											{ROLE_OPTIONS.map((role) => (
												<button
													key={role}
													type="button"
													onClick={() => setSelectedRole(role)}
													className={cn(
														"flex h-[50px] w-full items-center justify-between p-[16px] rounded-[5px]",
														"hover:bg-peach-100 hover:border-black-300",
													)}
												>
													<span
														className={`text-[15px] font-medium leading-[20px] ${
															selectedRole === role ? "text-peach-500" : "text-black-700"
														}`}
													>
														{role}
													</span>
													{selectedRole === role && (
														<Check className="w-[12px] h-[12px] text-peach-500" strokeWidth={2.5} />
													)}
												</button>
											))}
										</div>
									</div>

									{/* 변경 사유 */}
									<div className="flex flex-col gap-[10px] items-start">
										<Label htmlFor={reasonId} className="text-[15px] font-medium text-black-900">
											변경 사유
										</Label>
										<textarea
											id={reasonId}
											placeholder="변경 사유를 입력해 주세요."
											value={reason}
											onChange={(e) => {
												setReason(e.target.value)
												if (reasonError) setReasonError(false)
											}}
											className={cn(
												"w-[360px] h-[90px] p-[16px] border border-black-300 rounded-[5px] bg-white text-[14px] font-normal text-black-900 placeholder:text-black-600 placeholder:text-[14px] tracking-[-0.28px] resize-none outline-none",
												reasonError && "border-red-500",
											)}
										/>
									</div>
								</div>

								{/* 버튼 */}
								<div className="flex gap-[10px] items-center">
									<DialogActionButton variant="cancel" onClick={handleCancel}>
										취소
									</DialogActionButton>
									<DialogActionButton onClick={handleSubmit}>확인</DialogActionButton>
								</div>
							</div>
						</div>
					</div>
				</DesignDialogContent>
			</Dialog>

			<Toast
				message={errorMessage}
				isVisible={showErrorToast}
				onClose={() => setShowErrorToast(false)}
				variant="error"
			/>
		</>
	)
}
