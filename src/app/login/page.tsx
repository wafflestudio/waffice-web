"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DevSigninForm } from "@/components/auth/dev-signin-form"
import { GoogleButton } from "@/components/auth/google-button"
import { Logo } from "@/components/auth/logo"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useGoogleOAuth } from "@/hooks/use-google-oauth"
import { authClient } from "@/lib/auth"
import type { AuthResult, AuthStatus } from "@/types"

const ENABLE_DEV_AUTH = process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === "true"

export default function LoginPage() {
	const router = useRouter()
	const [authError, setAuthError] = useState<string | null>(null)

	const handleOAuthSuccess = async (result: { status: AuthStatus; authToken: string }) => {
		setAuthError(null)

		if (result.status === "new") {
			// New user - store auth token in sessionStorage and redirect to signup
			sessionStorage.setItem("auth_token", result.authToken)
			router.push("/signup")
		} else {
			// Existing user (pending or active) - sign in
			try {
				const response = await authClient.signin({ auth_token: result.authToken })
				if (response.ok) {
					if (response.data.status === "pending") {
						router.push("/signup/pending")
					} else {
						router.push("/")
					}
				} else {
					setAuthError("로그인에 실패했습니다.")
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : "로그인에 실패했습니다."
				setAuthError(message)
			}
		}
	}

	const handleOAuthError = (error: string) => {
		setAuthError(error)
	}

	const handleDevSigninSuccess = async (result: AuthResult) => {
		setAuthError(null)

		// 로그인 성공 후 인증 상태 확인
		try {
			const authStatus = await authClient.getMe()
			console.log("Auth status after dev signin:", authStatus)

			if (!authStatus.ok) {
				setAuthError("로그인 후 인증 확인 실패. 쿠키가 설정되지 않았을 수 있습니다.")
				return
			}
		} catch (error) {
			console.error("Failed to verify auth status:", error)
			setAuthError("인증 확인 실패. 브라우저 콘솔을 확인하세요.")
			return
		}

		if (result.status === "pending") {
			router.push("/signup/pending")
		} else {
			router.push("/")
		}
	}

	const handleDevSigninError = (error: string) => {
		setAuthError(error)
	}

	const {
		openPopup,
		isLoading,
		error: oauthError,
	} = useGoogleOAuth(handleOAuthSuccess, handleOAuthError)

	const displayError = authError || oauthError

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/30">
			<Card className="w-full max-w-md">
				<CardHeader className="flex flex-col items-start text-left space-y-3">
					<Logo size="md" />
					<h1 className="text-2xl font-bold">로그인</h1>
				</CardHeader>
				<CardContent className="space-y-4">
					{displayError && (
						<div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
							{displayError}
						</div>
					)}

					<GoogleButton onClick={openPopup} fullWidth disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								로그인 중...
							</>
						) : (
							"Google로 로그인"
						)}
					</GoogleButton>

					<p className="text-sm text-center text-muted-foreground">
						아직 계정이 없으시다면 Google 로그인 후 회원가입을 진행해주세요.
					</p>

					{ENABLE_DEV_AUTH && (
						<DevSigninForm onSuccess={handleDevSigninSuccess} onError={handleDevSigninError} />
					)}
				</CardContent>
			</Card>
		</div>
	)
}
