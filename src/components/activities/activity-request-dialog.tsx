"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useId, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ActivityDialogRow } from "@/components/activities/activity-dialog-row"
import {
	ACTIVITY_PROJECT_OPTIONS,
	ACTIVITY_REQUEST_TARGET_OPTIONS,
} from "@/components/activities/activity-history.mock"
import { CalendarDateField } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { DesignDialogContent } from "@/components/ui/design-dialog"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import { SelectField } from "@/components/ui/select-field"
import { Toast } from "@/components/ui/toast"
import type { ActivityHistoryRecord, ActivityRequestFormValues } from "@/types"

const requestSchema = z
	.object({
		projectName: z.string().min(1),
		requestTarget: z.string().min(1),
		startDate: z.string().min(1),
		endDate: z.string(),
		isEndDateUnknown: z.boolean(),
		description: z.string().trim().min(1),
		note: z.string(),
	})
	.refine((value) => value.isEndDateUnknown || value.endDate.length > 0, {
		path: ["endDate"],
		message: "종료일을 입력해주세요.",
	})

interface ActivityRequestDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	mode?: "add" | "edit"
	record?: ActivityHistoryRecord | null
	onSubmit: (values: ActivityRequestFormValues) => void
}

const EMPTY_VALUES: ActivityRequestFormValues = {
	projectName: ACTIVITY_PROJECT_OPTIONS[0],
	requestTarget: ACTIVITY_REQUEST_TARGET_OPTIONS[0],
	startDate: "",
	endDate: "",
	isEndDateUnknown: true,
	description: "",
	note: "",
}

export function ActivityRequestDialog({
	open,
	onOpenChange,
	mode = "add",
	record,
	onSubmit,
}: ActivityRequestDialogProps) {
	const endDateUnknownId = useId()
	const [showErrorToast, setShowErrorToast] = useState(false)
	const form = useForm<ActivityRequestFormValues>({
		resolver: zodResolver(requestSchema),
		defaultValues: EMPTY_VALUES,
	})

	useEffect(() => {
		if (!open) return
		form.reset(
			record
				? {
						...EMPTY_VALUES,
						projectName: record.projectName,
						startDate: record.startDate,
						endDate: record.endDate ?? "",
						isEndDateUnknown: record.endDate == null,
						description: record.description,
					}
				: EMPTY_VALUES,
		)
		setShowErrorToast(false)
	}, [form, open, record])

	const projectName = form.watch("projectName")
	const requestTarget = form.watch("requestTarget")
	const startDate = form.watch("startDate")
	const endDate = form.watch("endDate")
	const isEndDateUnknown = form.watch("isEndDateUnknown")

	const showValidationToast = () => {
		setShowErrorToast(false)
		requestAnimationFrame(() => setShowErrorToast(true))
	}

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DesignDialogContent
					showDesignClose
					className="max-h-[calc(100vh-32px)] w-[calc(100vw-32px)] max-w-[calc(100vw-32px)] overflow-x-hidden overflow-y-auto rounded-[12px] border-0 px-[24px] py-[40px] sm:!w-[1000px] sm:!max-w-[1000px] sm:px-[100px]"
					closeClassName="fixed top-[15px] right-[15px]"
				>
					<DialogTitle className="text-[28px] font-medium leading-normal text-black-900">
						활동 이력 {mode === "add" ? "추가" : "수정"} 요청
					</DialogTitle>

					<form
						className="mt-[50px] flex flex-col gap-[40px]"
						onSubmit={form.handleSubmit((values) => {
							onSubmit(values)
							onOpenChange(false)
						}, showValidationToast)}
					>
						<ActivityDialogRow label="활동 프로젝트">
							<SelectField
								value={projectName}
								options={ACTIVITY_PROJECT_OPTIONS}
								onChange={(value) => form.setValue("projectName", value, { shouldValidate: true })}
								triggerClassName="h-[42px] w-[300px] rounded-[6px] px-[10px] text-[14px]"
								contentClassName="z-[70] w-[300px] rounded-[6px] p-[5px]"
								itemClassName="h-[40px] px-[8px] text-[14px]"
							/>
						</ActivityDialogRow>

						<ActivityDialogRow label="요청대상">
							<SelectField
								value={requestTarget}
								options={ACTIVITY_REQUEST_TARGET_OPTIONS}
								onChange={(value) =>
									form.setValue("requestTarget", value, { shouldValidate: true })
								}
								triggerClassName="h-[42px] w-[300px] rounded-[6px] px-[10px] text-[14px]"
								contentClassName="z-[70] w-[300px] rounded-[6px] p-[5px]"
								itemClassName="h-[40px] px-[8px] text-[14px]"
							/>
						</ActivityDialogRow>

						<ActivityDialogRow label="활동 기간">
							<div className="flex flex-wrap items-center gap-[20px]">
								<div className="flex items-center gap-[5px]">
									<CalendarDateField
										value={startDate || "YYYY.MM.DD"}
										onChange={(value) =>
											form.setValue("startDate", value, { shouldValidate: true })
										}
										className="h-[42px] w-[140px] rounded-[6px] text-[14px]"
									/>
									<span className="text-[15px] text-black-300">-</span>
									<CalendarDateField
										value={isEndDateUnknown ? "YYYY.MM.DD" : endDate || "YYYY.MM.DD"}
										onChange={(value) => {
											form.setValue("endDate", value, { shouldValidate: true })
											form.setValue("isEndDateUnknown", false, { shouldValidate: true })
										}}
										className="h-[42px] w-[140px] rounded-[6px] text-[14px]"
									/>
								</div>
								<label
									htmlFor={endDateUnknownId}
									className="flex cursor-pointer items-center gap-[10px] text-[14px] tracking-[-0.28px] text-black-700"
								>
									<Checkbox
										id={endDateUnknownId}
										checked={isEndDateUnknown}
										onCheckedChange={(checked) => {
											form.setValue("isEndDateUnknown", checked === true, {
												shouldValidate: true,
											})
											if (checked) form.setValue("endDate", "")
										}}
										className="size-[16px] border-black-300 data-[state=checked]:border-peach-300 data-[state=checked]:bg-peach-300"
									/>
									미정
								</label>
							</div>
						</ActivityDialogRow>

						<ActivityDialogRow label="활동 내용">
							<textarea
								{...form.register("description")}
								placeholder="추가로 요청하실 활동 내용을 작성해주세요."
								className="h-[70px] w-full resize-none rounded-[5px] border border-black-300 px-[16px] py-[10px] text-[14px] outline-none placeholder:text-black-600 focus:border-peach-300"
							/>
						</ActivityDialogRow>

						<ActivityDialogRow label="요청 비고">
							<textarea
								{...form.register("note")}
								placeholder="요청 대상에게 전달할 말이 있다면 작성해주세요."
								className="h-[70px] w-full resize-none rounded-[5px] border border-black-300 px-[16px] py-[10px] text-[14px] outline-none placeholder:text-black-600 focus:border-peach-300"
							/>
						</ActivityDialogRow>

						<div className="flex justify-end gap-[10px]">
							<DialogActionButton variant="cancel" onClick={() => onOpenChange(false)}>
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
