"use client"

import { X as XIcon } from "lucide-react"
import { useId, useRef, useState } from "react"
import { CalendarDateField } from "@/components/ui/calendar"
import { DesignDialogContent } from "@/components/ui/design-dialog"
import { Dialog, DialogClose, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import { cn } from "@/lib/utils"

interface MemberBulkUpdateDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit?: (values: { effectiveDate: string; file: File | null }) => void | Promise<void>
	onDownloadTemplate?: () => void
	isSubmitting?: boolean
}

const XLSX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
const XLSX_ACCEPT = ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

const formatFileSize = (size: number) => {
	const sizeInKb = Math.ceil(size / 1024)
	return `${sizeInKb.toLocaleString()}KB`
}

const isXlsxFile = (file: File) =>
	file.name.toLowerCase().endsWith(".xlsx") || file.type === XLSX_MIME_TYPE

const todayDateInput = () => {
	const now = new Date()
	return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(
		now.getDate(),
	).padStart(2, "0")}`
}

export function MemberBulkUpdateDialog({
	open,
	onOpenChange,
	onSubmit,
	onDownloadTemplate,
	isSubmitting = false,
}: MemberBulkUpdateDialogProps) {
	const [effectiveDate, setEffectiveDate] = useState(todayDateInput)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [isDragging, setIsDragging] = useState(false)
	const fileInputId = useId()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const reset = () => {
		setEffectiveDate(todayDateInput())
		setSelectedFile(null)
		setIsDragging(false)
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	const handleOpenChange = (nextOpen: boolean) => {
		if (isSubmitting && !nextOpen) return
		onOpenChange(nextOpen)
		if (!nextOpen) reset()
	}

	const selectFile = (file?: File) => {
		if (!file || !isXlsxFile(file)) return
		setSelectedFile(file)
	}

	const clearFile = () => {
		setSelectedFile(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	const handleCancel = () => {
		handleOpenChange(false)
	}

	const handleSubmit = async () => {
		if (!selectedFile || isSubmitting) return
		await onSubmit?.({ effectiveDate, file: selectedFile })
		if (onSubmit) {
			reset()
		} else {
			handleOpenChange(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DesignDialogContent className="w-[460px] max-w-[460px] overflow-visible rounded-[12px] border border-black-300 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
				<div className="flex w-full flex-col items-end gap-[10px] px-[10px] pt-[10px] pb-[40px]">
					<DialogClose
						onClick={handleCancel}
						disabled={isSubmitting}
						className="flex size-[35px] shrink-0 items-center justify-center text-black-800 transition-colors hover:text-black-900"
					>
						<XIcon className="size-[28px]" strokeWidth={2.4} />
						<span className="sr-only">닫기</span>
					</DialogClose>

					<div className="flex w-full flex-col items-start px-[40px]">
						<DialogTitle className="text-[24px] font-medium leading-normal text-black-900">
							활동회원 명부 일괄 갱신
						</DialogTitle>

						<div className="mt-[50px] flex w-full flex-col items-end gap-[40px]">
							<div className="flex w-full flex-col items-start gap-[10px]">
								<p className="text-[15px] font-medium leading-normal text-black-900">
									자격 변경 기준일
								</p>
								<CalendarDateField
									value={effectiveDate}
									onChange={setEffectiveDate}
									className="h-[42px] w-[360px] rounded-[6px] border-black-300 px-[10px] text-[14px] leading-[20px] text-black-900"
									popoverClassName="left-0 right-auto"
								/>
							</div>

							<div className="flex w-full flex-col items-start gap-[15px]">
								<div className="flex w-full flex-col items-start gap-[10px]">
									<p className="text-[15px] font-medium leading-normal text-black-900">파일 첨부</p>
									<input
										ref={fileInputRef}
										id={fileInputId}
										type="file"
										accept={XLSX_ACCEPT}
										aria-label="활동회원 명부 xlsx 파일 선택"
										className="sr-only"
										onChange={(event) => selectFile(event.target.files?.[0])}
									/>
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										onDragEnter={(event) => {
											event.preventDefault()
											setIsDragging(true)
										}}
										onDragOver={(event) => event.preventDefault()}
										onDragLeave={(event) => {
											event.preventDefault()
											setIsDragging(false)
										}}
										onDrop={(event) => {
											event.preventDefault()
											setIsDragging(false)
											selectFile(event.dataTransfer.files[0])
										}}
										className={cn(
											"flex h-[120px] w-[360px] cursor-pointer flex-col items-center justify-center gap-[10px] rounded-[4px] bg-black-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peach-300/50",
											isDragging && "bg-peach-100",
										)}
									>
										<p className="text-center text-[12px] font-normal leading-[1.4] text-black-500">
											첨부할 파일을 여기에 끌어다 놓거나,
											<br />
											파일 선택 버튼을 클릭해주세요.
										</p>
										<span className="flex h-[30px] items-center justify-center rounded-[4px] border border-black-300 bg-white px-[14px] py-[4px] text-[14px] font-medium leading-[24px] text-black-900 transition-colors hover:bg-black-100">
											파일 선택
										</span>
									</button>
								</div>

								<div className="flex w-[352px] flex-col items-end overflow-hidden">
									<button
										type="button"
										onClick={onDownloadTemplate}
										className="flex h-[30px] items-center justify-center rounded-[4px] border border-black-300 bg-white px-[14px] py-[4px] text-[14px] font-medium leading-[20px] tracking-[-0.28px] text-black-900 transition-colors hover:bg-black-100"
									>
										.xlsx 양식 다운로드 받기
									</button>
								</div>

								{selectedFile && (
									<div className="flex h-[40px] w-[360px] items-center justify-between rounded-[6px] bg-black-100 px-[10px] py-[5px]">
										<div className="flex min-w-0 items-center gap-[2px] leading-[20px]">
											<span className="truncate text-[13px] font-normal tracking-[-0.26px] text-black-900">
												{selectedFile.name}
											</span>
											<span className="shrink-0 text-[12px] font-normal tracking-[-0.24px] text-black-600">
												({formatFileSize(selectedFile.size)})
											</span>
										</div>
										<button
											type="button"
											onClick={clearFile}
											className="flex size-[18px] shrink-0 items-center justify-center rounded-full text-black-500 transition-colors hover:bg-black-300 hover:text-black-900"
										>
											<XIcon className="size-[14px]" />
											<span className="sr-only">첨부 파일 삭제</span>
										</button>
									</div>
								)}
							</div>

							<div className="flex h-[50px] items-center gap-[10px]">
								<DialogActionButton variant="cancel" onClick={handleCancel} disabled={isSubmitting}>
									취소
								</DialogActionButton>
								<DialogActionButton onClick={handleSubmit} disabled={!selectedFile || isSubmitting}>
									{isSubmitting ? "처리 중..." : "확인"}
								</DialogActionButton>
							</div>
						</div>
					</div>
				</div>
			</DesignDialogContent>
		</Dialog>
	)
}
