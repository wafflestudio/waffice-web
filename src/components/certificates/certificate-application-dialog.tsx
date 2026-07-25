"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useId, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Checkbox } from "@/components/ui/checkbox"
import { DesignDialogContent } from "@/components/ui/design-dialog"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import { Toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import type { CertificateApplicationFormValues, CertificateSigner } from "@/types"

const INCLUDED_CONTENT_OPTIONS = [
	"회원 자격 취득, 변동 및 상실의 각 기준일 및 사유",
	"구성원으로서 활동한 소속 프로젝트의 명칭, 기간 및 역할",
	"임원 또는 집행부원으로 활동한 기간 및 역할",
] as const

const applicationSchema = z.object({
	signer: z.enum(["와플스튜디오 회장", "지도교수"]),
	purpose: z.string().trim().min(1),
	includedContents: z.array(z.string()),
})

interface CertificateApplicationDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (values: CertificateApplicationFormValues) => void
}

export function CertificateApplicationDialog({
	open,
	onOpenChange,
	onSubmit,
}: CertificateApplicationDialogProps) {
	const formId = useId()
	const [showErrorToast, setShowErrorToast] = useState(false)
	const form = useForm<CertificateApplicationFormValues>({
		resolver: zodResolver(applicationSchema),
		defaultValues: {
			signer: "와플스튜디오 회장",
			purpose: "",
			includedContents: [],
		},
	})
	const signer = form.watch("signer")
	const includedContents = form.watch("includedContents")

	const toggleIncludedContent = (content: string, checked: boolean) => {
		form.setValue(
			"includedContents",
			checked
				? [...includedContents, content]
				: includedContents.filter((item) => item !== content),
		)
	}

	const handleOpenChange = (nextOpen: boolean) => {
		onOpenChange(nextOpen)
		if (!nextOpen) {
			form.reset()
			setShowErrorToast(false)
		}
	}

	return (
		<>
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DesignDialogContent
					showDesignClose
					className="max-h-[calc(100vh-24px)] w-[calc(100vw-24px)] max-w-[calc(100vw-24px)] overflow-y-auto rounded-[12px] border border-black-300 px-[24px] pt-[50px] pb-[40px] sm:!w-[480px] sm:!max-w-[480px] sm:px-[50px]"
					closeClassName="fixed top-[10px] right-[10px]"
				>
					<DialogTitle className="text-[24px] font-semibold leading-normal text-black-900">
						활동증명서 발급 신청
					</DialogTitle>

					<form
						className="mt-[50px] flex flex-col gap-[40px]"
						onSubmit={form.handleSubmit(
							(values) => {
								onSubmit(values)
								handleOpenChange(false)
							},
							() => {
								setShowErrorToast(false)
								requestAnimationFrame(() => setShowErrorToast(true))
							},
						)}
					>
						<div className="flex flex-col gap-[10px]">
							<p className="text-[15px] font-medium text-black-900">서명 주체</p>
							<div className="flex items-center gap-[50px]">
								{(["와플스튜디오 회장", "지도교수"] as CertificateSigner[]).map((option) => (
									<label
										key={option}
										className={cn(
											"flex cursor-pointer items-center gap-[8px] text-[14px] font-medium",
											signer === option ? "text-black-900" : "text-black-400",
										)}
									>
										<input
											type="radio"
											name={`${formId}-signer`}
											value={option}
											checked={signer === option}
											onChange={() => form.setValue("signer", option)}
											className="size-[16px] accent-black-900"
										/>
										{option}
									</label>
								))}
							</div>
						</div>

						<div className="flex flex-col gap-[10px]">
							<label
								htmlFor={`${formId}-purpose`}
								className="text-[15px] font-medium text-black-900"
							>
								발급 용도
							</label>
							<textarea
								id={`${formId}-purpose`}
								{...form.register("purpose")}
								placeholder="발급 용도를 입력해 주세요."
								className="h-[90px] w-full resize-none rounded-[5px] border border-black-300 p-[16px] text-[14px] tracking-[-0.28px] outline-none placeholder:text-black-600 focus:border-peach-300"
							/>
						</div>

						<div className="flex flex-col gap-[14px]">
							<p className="text-[15px] font-semibold leading-[24px] text-black-900">
								활동증명서에 포함하고자 하는 내용
							</p>
							<div className="flex items-start gap-[10px] pl-[25px] text-[13px] leading-[1.45] tracking-[-0.26px] text-black-900">
								<span className="mt-[1px] flex size-[20px] shrink-0 items-center justify-center rounded-full bg-[#ffc342] text-[13px] font-semibold">
									!
								</span>
								<p>
									징계 이력이 있는 경우, 그 징계 의결의 주문, 이유, 의결일 및 징계 개시일은
									활동증명서에 의무적으로 포함됩니다.
									<br />
									(회원의 자격, 활동 이력 관리 증명 등에 관한 회칙 제5조)
								</p>
							</div>
							<div className="flex flex-col gap-[4px] pl-[25px]">
								{INCLUDED_CONTENT_OPTIONS.map((option, index) => {
									const checkboxId = `${formId}-content-${index}`
									return (
										<label
											key={option}
											htmlFor={checkboxId}
											className="flex cursor-pointer items-center gap-[10px] text-[14px] leading-[1.4] tracking-[-0.42px] text-black-900"
										>
											<Checkbox
												id={checkboxId}
												checked={includedContents.includes(option)}
												onCheckedChange={(checked) =>
													toggleIncludedContent(option, checked === true)
												}
												className="size-[16px] border-[#999] data-[state=checked]:border-peach-300 data-[state=checked]:bg-peach-300"
											/>
											{option}
										</label>
									)
								})}
							</div>
						</div>

						<div className="flex justify-end gap-[10px]">
							<DialogActionButton variant="cancel" onClick={() => handleOpenChange(false)}>
								취소
							</DialogActionButton>
							<DialogActionButton type="submit">확인</DialogActionButton>
						</div>
					</form>
				</DesignDialogContent>
			</Dialog>

			<Toast
				message="필수 입력사항을 확인해주세요."
				isVisible={showErrorToast}
				onClose={() => setShowErrorToast(false)}
				variant="error"
			/>
		</>
	)
}
