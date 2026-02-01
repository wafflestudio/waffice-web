"use client"

import { useRouter } from "next/navigation"
import { GoogleButton } from "@/components/auth/google-button"
import { Logo } from "@/components/auth/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { apiClient } from "@/lib/api"

/**
 * 로그인 페이지
 */
export default function LoginPage() {
	const router = useRouter()

	const handleGoogleLogin = () => {
		// Google OAuth URL 생성
		const redirectUri = `${window.location.origin}/auth/callback`
		const googleAuthUrl = apiClient.getGoogleAuthUrl(redirectUri)

		// Google 인증 페이지로 리다이렉트
		window.location.href = googleAuthUrl
	}

	const handleSignup = () => {
		router.push("/signup")
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/30">
			<Card className="w-full max-w-md">
				<CardHeader className="flex flex-col items-start text-left space-y-3">
					<Logo size="md" />
					<h1 className="text-2xl font-bold">로그인</h1>
				</CardHeader>
				<CardContent className="space-y-4">
					<GoogleButton onClick={handleGoogleLogin} fullWidth>
						Google로 로그인
					</GoogleButton>

					<Button onClick={handleSignup} variant="outline" className="w-full">
						회원가입
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
