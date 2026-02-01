"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Logo } from "@/components/auth/logo"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { apiClient } from "@/lib/api"

/**
 * Google OAuth 콜백 페이지
 * Google 인증 후 리다이렉트되어 인증 코드를 처리합니다
 */
export default function AuthCallbackPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [error, setError] = useState<string | null>(null)
	const [status, setStatus] = useState<string>("인증 처리 중...")

	useEffect(() => {
		const handleCallback = async () => {
			try {
				// URL에서 인증 코드 추출
				const code = searchParams.get("code")
				const error = searchParams.get("error")

				if (error) {
					setError(`인증 실패: ${error}`)
					return
				}

				if (!code) {
					setError("인증 코드를 받지 못했습니다")
					return
				}

				setStatus("토큰 교환 중...")

				// 콜백 URL 생성 (현재 URL에서 쿼리 파라미터 제거)
				const redirectUri = `${window.location.origin}/auth/callback`

				// 인증 코드를 auth_token으로 교환
				const tokenResponse = await apiClient.exchangeGoogleToken({
					code,
					redirect_uri: redirectUri,
				})

				if (!tokenResponse.ok || !tokenResponse.data) {
					throw new Error(tokenResponse.message || "토큰 교환 실패")
				}

				const { status: userStatus, auth_token } = tokenResponse.data

				// 상태에 따라 분기 처리
				switch (userStatus) {
					case "new":
						// 신규 사용자 - 회원가입 페이지로 이동 (auth_token을 세션 스토리지에 저장)
						setStatus("회원가입 페이지로 이동 중...")
						sessionStorage.setItem("auth_token", auth_token)
						router.push("/signup")
						break

					case "pending":
						// 가입 승인 대기 중 - 대기 페이지로 이동
						setStatus("승인 대기 페이지로 이동 중...")
						router.push("/signup/pending")
						break

					case "active": {
						// 기존 사용자 - 로그인 처리
						setStatus("로그인 처리 중...")
						const signinResponse = await apiClient.signin({ auth_token })

						if (!signinResponse.ok) {
							throw new Error(signinResponse.message || "로그인 실패")
						}

						// 로그인 성공 - 홈으로 이동
						setStatus("로그인 완료! 메인 페이지로 이동 중...")
						router.push("/")
						break
					}

					default:
						throw new Error(`알 수 없는 사용자 상태: ${userStatus}`)
				}
			} catch (err) {
				console.error("OAuth callback error:", err)
				setError(err instanceof Error ? err.message : "인증 처리 중 오류가 발생했습니다")
			}
		}

		handleCallback()
	}, [searchParams, router])

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/30">
			<Card className="w-full max-w-md">
				<CardHeader className="flex flex-col items-center text-center space-y-3">
					<Logo size="md" />
					<h1 className="text-2xl font-bold">{error ? "인증 실패" : "Google 로그인"}</h1>
				</CardHeader>
				<CardContent className="space-y-4">
					{error ? (
						<div className="space-y-4">
							<p className="text-destructive text-center">{error}</p>
							<button
								type="button"
								onClick={() => router.push("/login")}
								className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
							>
								로그인 페이지로 돌아가기
							</button>
						</div>
					) : (
						<div className="text-center">
							<div className="flex justify-center mb-4">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
							</div>
							<p className="text-muted-foreground">{status}</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
