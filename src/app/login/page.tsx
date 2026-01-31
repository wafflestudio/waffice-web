"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { GoogleButton } from "@/components/auth/google-button"
import { Logo } from "@/components/auth/logo"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useGoogleOAuth } from "@/hooks/use-google-oauth"
import { authClient } from "@/lib/auth"
import type { AuthStatus } from "@/types"

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
				</CardContent>
			</Card>
		</div>
	)
}
