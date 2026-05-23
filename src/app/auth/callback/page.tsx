"use client"

import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

function CallbackContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [status, setStatus] = useState<"processing" | "success" | "error" | "no-opener">(
		"processing",
	)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	useEffect(() => {
		const code = searchParams.get("code")
		const error = searchParams.get("error")

		if (error) {
			setStatus("error")
			setErrorMessage(error)

			// Send error to parent window
			if (window.opener) {
				window.opener.postMessage(
					{
						type: "GOOGLE_OAUTH_CALLBACK",
						error,
					},
					window.location.origin,
				)
				window.close()
			}
			return
		}

		if (code) {
			// Send code to parent window
			if (window.opener) {
				setStatus("success")
				window.opener.postMessage(
					{
						type: "GOOGLE_OAUTH_CALLBACK",
						code,
					},
					window.location.origin,
				)
				window.close()
			} else {
				// No opener - user directly accessed this page
				setStatus("no-opener")
			}
		} else {
			setStatus("error")
			setErrorMessage("인증 코드를 받지 못했습니다.")
		}
	}, [searchParams])

	const handleGoToLogin = () => {
		router.replace("/login")
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/30">
			<div className="text-center space-y-4">
				{status === "processing" && (
					<>
						<Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
						<p className="text-muted-foreground">인증 처리 중...</p>
					</>
				)}
				{status === "success" && (
					<>
						<p className="text-muted-foreground">인증이 완료되었습니다.</p>
						<p className="text-sm text-muted-foreground">이 창은 자동으로 닫힙니다.</p>
					</>
				)}
				{status === "error" && (
					<>
						<p className="text-destructive">인증 중 오류가 발생했습니다.</p>
						{errorMessage && <p className="text-sm text-muted-foreground">{errorMessage}</p>}
						<p className="text-sm text-muted-foreground">이 창을 닫고 다시 시도해주세요.</p>
					</>
				)}
				{status === "no-opener" && (
					<>
						<p className="text-muted-foreground">잘못된 접근입니다.</p>
						<p className="text-sm text-muted-foreground">로그인 페이지에서 다시 시도해주세요.</p>
						<button
							type="button"
							onClick={handleGoToLogin}
							className="mt-4 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90"
						>
							로그인 페이지로 이동
						</button>
					</>
				)}
			</div>
		</div>
	)
}

export default function AuthCallbackPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-muted/30">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			}
		>
			<CallbackContent />
		</Suspense>
	)
}
