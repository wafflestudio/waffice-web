"use client"

import { Check, X as XIcon } from "lucide-react"
import { useEffect, useId, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const ROLE_OPTIONS = ["활동회원", "정회원", "준회원", "가입대기"] as const
const DEFAULT_ROLE = "활동회원"

interface QualificationChangeDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (role: string, reason: string) => Promise<void>
}

export function QualificationChangeDialog({
	open,
	onOpenChange,
	onSubmit,
}: QualificationChangeDialogProps) {
	const [selectedRole, setSelectedRole] = useState(DEFAULT_ROLE)
	const [reason, setReason] = useState("")
	const reasonId = useId()

	useEffect(() => {
		if (open) {
			setSelectedRole(DEFAULT_ROLE)
			setReason("")
		}
	}, [open])

	const handleCancel = () => {
		onOpenChange(false)
		setSelectedRole(DEFAULT_ROLE)
		setReason("")
	}

	const handleSubmit = async () => {
		await onSubmit(selectedRole, reason)
		setSelectedRole(DEFAULT_ROLE)
		setReason("")
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="w-[460px] max-w-[460px] gap-0 overflow-hidden rounded-[12px] border-0 p-0 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
				showCloseButton={false}
			>
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
													"flex h-[50px] w-full items-center p-[16px] rounded-[5px]",
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
													<Check
														className="ml-[10px] w-[12px] h-[12px] text-peach-500"
														strokeWidth={2.5}
													/>
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
										onChange={(e) => setReason(e.target.value)}
										className="w-[360px] h-[90px] p-[16px] border border-black-300 rounded-[5px] bg-white text-[14px] font-normal text-black-900 placeholder:text-black-600 placeholder:text-[14px] tracking-[-0.28px] resize-none outline-none"
									/>
								</div>
							</div>

							{/* 버튼 */}
							<div className="flex gap-[10px] items-center">
								<button
									type="button"
									onClick={handleCancel}
									className="flex items-center justify-center w-[121px] h-[50px] border border-black-300 rounded-[4px] text-[15px] leading-[24px] font-semibold text-black-900 hover:bg-black-300 active:bg-black-300 transition-colors"
								>
									취소
								</button>
								<button
									type="button"
									onClick={handleSubmit}
									className="flex items-center justify-center w-[121px] h-[50px] bg-peach-300 hover:bg-peach-500 active:bg-peach-500 rounded-[4px] text-[15px] leading-[24px] font-semibold text-white"
								>
									확인
								</button>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
