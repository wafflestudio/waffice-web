"use client"

import { useCallback, useEffect, useState } from "react"
import { DesignDialogContent } from "@/components/ui/design-dialog"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import { Toast } from "@/components/ui/toast"
import { useIssueCertificate, usePreviewCertificate } from "@/hooks/use-certificates"
import type { CertificateOptions } from "@/types"

interface CertificatePreviewDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	options: CertificateOptions | null
	onIssued: () => void
}

export function CertificatePreviewDialog({
	open,
	onOpenChange,
	options,
	onIssued,
}: CertificatePreviewDialogProps) {
	const [pdfUrl, setPdfUrl] = useState<string | null>(null)
	const [toastMessage, setToastMessage] = useState("")
	const [showErrorToast, setShowErrorToast] = useState(false)
	const previewCertificate = usePreviewCertificate()
	const issueCertificate = useIssueCertificate()

	const showError = useCallback((message: string) => {
		setToastMessage(message)
		setShowErrorToast(true)
	}, [])

	const previewMutate = previewCertificate.mutate

	useEffect(() => {
		if (!open || !options) return

		let cancelled = false
		previewMutate(options, {
			onSuccess: (blob) => {
				if (cancelled) return
				setPdfUrl(URL.createObjectURL(blob))
			},
			onError: (error) => {
				if (cancelled) return
				showError(error instanceof Error ? error.message : "활동증명서 생성에 실패했습니다.")
			},
		})

		return () => {
			cancelled = true
		}
	}, [open, options, showError, previewMutate])

	useEffect(() => {
		if (!pdfUrl) return
		return () => URL.revokeObjectURL(pdfUrl)
	}, [pdfUrl])

	const handleOpenChange = (nextOpen: boolean) => {
		if (issueCertificate.isPending) return
		onOpenChange(nextOpen)
		if (!nextOpen) {
			setPdfUrl(null)
			previewCertificate.reset()
		}
	}

	const handleIssue = async () => {
		if (!options) return
		try {
			await issueCertificate.mutateAsync(options)
			handleOpenChange(false)
			onIssued()
		} catch (error) {
			showError(error instanceof Error ? error.message : "활동증명서 발급에 실패했습니다.")
		}
	}

	return (
		<>
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DesignDialogContent
					showDesignClose
					onClose={() => handleOpenChange(false)}
					className="flex max-h-[calc(100vh-24px)] w-[calc(100vw-24px)] max-w-[calc(100vw-24px)] flex-col gap-[20px] overflow-visible rounded-[12px] border border-black-300 p-[15px] sm:!w-[640px] sm:!max-w-[640px] sm:p-[20px]"
					closeClassName="absolute top-[15px] right-[15px]"
				>
					<DialogTitle className="text-[16px] font-medium leading-[1.4] text-black-900">
						발급 전 내용을 확인하세요.
					</DialogTitle>

					<div className="flex h-[70vh] w-full items-center justify-center overflow-hidden rounded-[4px] border border-black-900 bg-black-100">
						{pdfUrl ? (
							<embed src={pdfUrl} type="application/pdf" className="size-full" />
						) : (
							<p className="text-[14px] text-black-600">미리보기를 불러오는 중...</p>
						)}
					</div>

					<div className="flex justify-end gap-[10px] pt-[10px]">
						<DialogActionButton
							variant="cancel"
							onClick={() => handleOpenChange(false)}
							disabled={issueCertificate.isPending}
						>
							취소
						</DialogActionButton>
						<DialogActionButton
							onClick={handleIssue}
							disabled={!pdfUrl || issueCertificate.isPending}
						>
							{issueCertificate.isPending ? "발급 중..." : "발급"}
						</DialogActionButton>
					</div>
				</DesignDialogContent>
			</Dialog>

			<Toast
				message={toastMessage}
				isVisible={showErrorToast}
				onClose={() => setShowErrorToast(false)}
				variant="error"
			/>
		</>
	)
}
