"use client"

import { useRouter } from "next/navigation"
import { GoogleButton } from "@/components/auth/google-button"
import { Logo } from "@/components/auth/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

/**
 * 로그인 페이지
 */
export default function LoginPage() {
	const router = useRouter()

	const handleGoogleLogin = () => {
		// TODO: Google OAuth 로그인 로직 구현
		console.log("Google 로그인 클릭")
	}

	const handleSignup = () => {
		router.push("/signup")
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/30">
			<Card className="w-full max-w-md">
				<CardHeader className="items-center">
					<Logo size="md" className="mb-4" />
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
