"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Forbidden } from "@/components/error/forbidden"
import { useAuth } from "@/components/providers/auth-provider"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import { Toast } from "@/components/ui/toast"
import { useMySignature, useUpsertMySignature } from "@/hooks/use-certificates"
import { canRegisterCertificateSignature } from "@/lib/permissions"

const PNG_ACCEPT = ".png,image/png"

const isPngFile = (file: File) =>
	file.name.toLowerCase().endsWith(".png") && (!file.type || file.type === "image/png")

function useObjectUrl(file: File | null) {
	const [url, setUrl] = useState<string | null>(null)

	useEffect(() => {
		if (!file) {
			setUrl(null)
			return
		}

		const nextUrl = URL.createObjectURL(file)
		setUrl(nextUrl)
		return () => URL.revokeObjectURL(nextUrl)
	}, [file])

	return url
}

function SignaturePreview({ url, emptyText }: { url: string | null; emptyText: string }) {
	return (
		<div className="relative flex h-[120px] w-[360px] items-center justify-center overflow-hidden rounded-[4px] border border-black-300 bg-[linear-gradient(45deg,#f3f3f3_25%,transparent_25%),linear-gradient(-45deg,#f3f3f3_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f3f3f3_75%),linear-gradient(-45deg,transparent_75%,#f3f3f3_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px]">
			{url ? (
				<div
					role="img"
					aria-label="서명 미리보기"
					className="h-full w-full bg-contain bg-center bg-no-repeat"
					style={{ backgroundImage: `url(${url})` }}
				/>
			) : (
				<p className="text-[12px] font-normal text-black-500">{emptyText}</p>
			)}
		</div>
	)
}

export function SignatureRegistrationView() {
	const { user } = useAuth()
	const fileInputId = useId()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [toastMessage, setToastMessage] = useState("")
	const [showErrorToast, setShowErrorToast] = useState(false)
	const selectedPreviewUrl = useObjectUrl(selectedFile)

	const canRegister = canRegisterCertificateSignature(user)
	const { data: signature, isLoading: isSignatureLoading } = useMySignature()
	const upsertSignature = useUpsertMySignature()

	if (!canRegister) {
		return <Forbidden message="서명을 등록할 수 있는 와장 권한이 없습니다." />
	}

	const showError = (message: string) => {
		setToastMessage(message)
		setShowErrorToast(true)
	}

	const selectFile = (file?: File) => {
		if (!file) return

		if (!isPngFile(file)) {
			showError(".png 파일이 맞는지 확인해주세요.")
			if (fileInputRef.current) fileInputRef.current.value = ""
			return
		}

		setSelectedFile(file)
		setShowErrorToast(false)
	}

	const handleCancel = () => {
		setSelectedFile(null)
		if (fileInputRef.current) fileInputRef.current.value = ""
	}

	const handleSubmit = async () => {
		if (!selectedFile) {
			showError("회원들의 활동증명서에 삽입될 내 서명을 등록해주세요.")
			return
		}

		try {
			await upsertSignature.mutateAsync(selectedFile)
			setSelectedFile(null)
			if (fileInputRef.current) fileInputRef.current.value = ""
		} catch (error) {
			showError(error instanceof Error ? error.message : "서명 등록에 실패했습니다.")
		}
	}

	return (
		<div className="relative w-full">
			<div className="flex w-full flex-col items-start">
				<h1 className="text-[28px] font-semibold leading-normal tracking-[-0.56px] text-black-900">
					내 서명 등록
				</h1>
				<p className="mt-[15px] text-[14px] font-normal leading-[24px] text-black-900">
					회원들의 활동증명서에 삽입될 내 서명을 등록해주세요.
				</p>

				<div className="mx-auto mt-[80px] flex min-h-[550px] w-[460px] max-w-full flex-col rounded-[10px] border border-black-300 bg-white px-[49px] py-[48px]">
					<div className="flex flex-col gap-[10px]">
						<p className="text-[15px] font-medium leading-normal text-black-900">현재 서명</p>
						<SignaturePreview
							url={isSignatureLoading ? null : (signature?.url ?? null)}
							emptyText={isSignatureLoading ? "불러오는 중..." : "등록된 서명이 없습니다."}
						/>
					</div>

					<div className="mt-[65px] flex flex-col gap-[10px]">
						<p className="text-[15px] font-medium leading-normal text-black-900">변경된 서명</p>
						<input
							ref={fileInputRef}
							id={fileInputId}
							type="file"
							accept={PNG_ACCEPT}
							aria-label="PNG 서명 파일 선택"
							className="sr-only"
							onChange={(event) => selectFile(event.target.files?.[0])}
						/>
						<div className="flex h-[120px] w-[360px] flex-col items-center justify-center gap-[10px] rounded-[4px] bg-black-100">
							{selectedPreviewUrl ? (
								<div
									role="img"
									aria-label="변경할 서명 미리보기"
									className="h-[70px] w-[320px] bg-contain bg-center bg-no-repeat"
									style={{ backgroundImage: `url(${selectedPreviewUrl})` }}
								/>
							) : (
								<p className="text-center text-[12px] font-normal leading-[1.4] text-[#999]">
									배경이 Transparent인
									<br />
									.png 서명 파일을 첨부해주세요.
								</p>
							)}
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className="flex h-[30px] items-center justify-center rounded-[4px] border border-black-300 bg-white px-[14px] py-[4px] text-[14px] font-medium leading-[24px] text-black-900 hover:bg-black-100"
							>
								파일 선택
							</button>
						</div>
					</div>

					<div className="mt-auto flex justify-end gap-[10px] pt-[40px]">
						<DialogActionButton
							variant="cancel"
							onClick={handleCancel}
							disabled={upsertSignature.isPending}
						>
							취소
						</DialogActionButton>
						<DialogActionButton onClick={handleSubmit} disabled={upsertSignature.isPending}>
							{upsertSignature.isPending ? "등록 중..." : "확인"}
						</DialogActionButton>
					</div>
				</div>
			</div>

			<Toast
				message={toastMessage}
				isVisible={showErrorToast}
				onClose={() => setShowErrorToast(false)}
				variant="error"
				positionClassName="absolute top-[88px]"
			/>
		</div>
	)
}
