"use client"

import { X as XIcon } from "lucide-react"
import { useId, useRef, useState } from "react"
import { DesignDialogContent } from "@/components/ui/design-dialog"
import { Dialog, DialogClose, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import { Toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

interface ProjectMemberBulkUpdateDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit?: (files: File[]) => void | Promise<void>
	onDownloadTemplate?: () => void
	isSubmitting?: boolean
}

interface SelectedFile {
	id: string
	file: File
}

const XLSX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
const XLSX_ACCEPT = ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

const isXlsxFile = (file: File) =>
	file.name.toLowerCase().endsWith(".xlsx") || file.type === XLSX_MIME_TYPE

const formatFileSize = (size: number) => `${Math.ceil(size / 1024).toLocaleString()}KB`

export const getMissingProjectMemberColumnMessage = (columnName: string) =>
	`${columnName} 열 이름을/를 찾을 수 없습니다.`

export function ProjectMemberBulkUpdateDialog({
	open,
	onOpenChange,
	onSubmit,
	onDownloadTemplate,
	isSubmitting = false,
}: ProjectMemberBulkUpdateDialogProps) {
	const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
	const [isDragging, setIsDragging] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")
	const [showError, setShowError] = useState(false)
	const fileInputId = useId()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const nextFileIdRef = useRef(0)

	const reset = () => {
		setSelectedFiles([])
		setIsDragging(false)
		setErrorMessage("")
		setShowError(false)
		if (fileInputRef.current) fileInputRef.current.value = ""
	}

	const handleOpenChange = (nextOpen: boolean) => {
		if (isSubmitting && !nextOpen) return
		onOpenChange(nextOpen)
		if (!nextOpen) reset()
	}

	const showValidationError = (message: string) => {
		setShowError(false)
		setErrorMessage(message)
		requestAnimationFrame(() => setShowError(true))
	}

	const addFiles = (files: File[]) => {
		const xlsxFiles = files.filter(isXlsxFile)
		if (xlsxFiles.length !== files.length) {
			showValidationError(".xlsx 파일을 첨부해주세요.")
		}

		if (xlsxFiles.length === 0) return

		setSelectedFiles((current) => [
			...current,
			...xlsxFiles.map((file) => ({
				id: `${file.name}-${file.lastModified}-${nextFileIdRef.current++}`,
				file,
			})),
		])
		if (fileInputRef.current) fileInputRef.current.value = ""
	}

	const removeFile = (fileId: string) => {
		setSelectedFiles((current) => current.filter(({ id }) => id !== fileId))
	}

	const handleSubmit = async () => {
		if (selectedFiles.length === 0 || isSubmitting) return

		try {
			// TODO(API): 팀원 일괄 수정 API가 추가되면 파일 배열을 mutation에 전달한다.
			await onSubmit?.(selectedFiles.map(({ file }) => file))
			if (onSubmit) reset()
		} catch (error) {
			showValidationError(error instanceof Error ? error.message : "팀원 일괄 수정에 실패했습니다.")
		}
	}

	return (
		<>
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DesignDialogContent className="w-[460px] max-w-[calc(100vw-32px)] overflow-visible rounded-[12px] border border-black-300 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
					<div className="flex w-full flex-col items-end gap-[10px] px-[10px] pt-[10px] pb-[40px]">
						<DialogClose
							onClick={() => handleOpenChange(false)}
							disabled={isSubmitting}
							className="flex size-[35px] shrink-0 items-center justify-center text-black-800 transition-colors hover:text-black-900"
						>
							<XIcon className="size-[28px]" strokeWidth={2.4} />
							<span className="sr-only">닫기</span>
						</DialogClose>

						<div className="flex w-full flex-col items-start px-[40px]">
							<DialogTitle className="text-[24px] font-medium leading-normal text-black-900">
								팀원 일괄 수정
							</DialogTitle>

							<div className="mt-[50px] flex w-full flex-col items-end gap-[40px]">
								<div className="flex w-full flex-col items-start gap-[15px]">
									<div className="flex w-full flex-col items-start gap-[10px]">
										<p className="text-[15px] font-medium leading-normal text-black-900">
											파일 첨부
										</p>
										<input
											ref={fileInputRef}
											id={fileInputId}
											type="file"
											multiple
											accept={XLSX_ACCEPT}
											aria-label="프로젝트 팀원 명부 xlsx 파일 선택"
											className="sr-only"
											onChange={(event) => addFiles(Array.from(event.target.files ?? []))}
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
												addFiles(Array.from(event.dataTransfer.files))
											}}
											className={cn(
												"flex h-[120px] w-[360px] max-w-full cursor-pointer flex-col items-center justify-center gap-[10px] rounded-[4px] bg-black-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peach-300/50",
												isDragging && "bg-peach-100",
											)}
										>
											<p className="text-center text-[12px] font-normal leading-[1.4] text-black-500">
												첨부할 파일을 여기에 끌어다 놓거나,
												<br />
												파일 선택 버튼을 클릭해주세요.
											</p>
											<span className="flex h-[30px] items-center justify-center rounded-[4px] border border-black-300 bg-white px-[14px] py-[4px] text-[14px] font-medium leading-[24px] text-black-900">
												파일 선택
											</span>
										</button>
									</div>

									<div className="flex w-full justify-end">
										<button
											type="button"
											onClick={onDownloadTemplate}
											className="flex h-[30px] items-center justify-center rounded-[4px] border border-black-300 bg-white px-[14px] py-[4px] text-[14px] font-medium leading-[20px] tracking-[-0.28px] text-black-900 transition-colors hover:bg-black-100"
										>
											.xlsx 양식 다운로드 받기
										</button>
									</div>

									{selectedFiles.length > 0 && (
										<div className="flex max-h-[140px] w-full flex-col gap-[10px] overflow-y-auto">
											{selectedFiles.map(({ id, file }) => (
												<div
													key={id}
													className="flex h-[40px] w-full shrink-0 items-center justify-between rounded-[6px] bg-black-100 px-[10px] py-[5px]"
												>
													<div className="flex min-w-0 items-center gap-[2px] leading-[20px]">
														<span className="truncate text-[13px] font-normal tracking-[-0.26px] text-black-900">
															{file.name}
														</span>
														<span className="shrink-0 text-[12px] font-normal tracking-[-0.24px] text-black-600">
															({formatFileSize(file.size)})
														</span>
													</div>
													<button
														type="button"
														onClick={() => removeFile(id)}
														className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-black-300 text-black-500 transition-colors hover:text-black-900"
													>
														<XIcon className="size-[12px]" strokeWidth={2} />
														<span className="sr-only">{file.name} 삭제</span>
													</button>
												</div>
											))}
										</div>
									)}
								</div>

								<div className="flex h-[50px] items-center gap-[10px]">
									<DialogActionButton
										variant="cancel"
										onClick={() => handleOpenChange(false)}
										disabled={isSubmitting}
									>
										취소
									</DialogActionButton>
									<DialogActionButton
										onClick={handleSubmit}
										disabled={selectedFiles.length === 0 || isSubmitting}
									>
										{isSubmitting ? "처리 중..." : "확인"}
									</DialogActionButton>
								</div>
							</div>
						</div>
					</div>
				</DesignDialogContent>
			</Dialog>
			<Toast
				message={errorMessage}
				isVisible={showError}
				onClose={() => setShowError(false)}
				variant="error"
			/>
		</>
	)
}
