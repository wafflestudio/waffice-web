"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { authClient } from "@/lib/auth"
import type { AuthStatus } from "@/types"

interface OAuthResult {
	status: AuthStatus
	authToken: string
}

interface UseGoogleOAuthReturn {
	openPopup: () => void
	isLoading: boolean
	error: string | null
}

const POPUP_WIDTH = 500
const POPUP_HEIGHT = 600

export function useGoogleOAuth(
	onSuccess: (result: OAuthResult) => void,
	onError?: (error: string) => void,
): UseGoogleOAuthReturn {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const popupRef = useRef<Window | null>(null)
	const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

	// Store callbacks in refs to avoid useEffect re-runs on every render
	const onSuccessRef = useRef(onSuccess)
	const onErrorRef = useRef(onError)

	// Keep refs updated
	useEffect(() => {
		onSuccessRef.current = onSuccess
		onErrorRef.current = onError
	}, [onSuccess, onError])

	const clearCheckInterval = useCallback(() => {
		if (checkIntervalRef.current) {
			clearInterval(checkIntervalRef.current)
			checkIntervalRef.current = null
		}
	}, [])

	const handleMessage = useCallback(
		async (event: MessageEvent) => {
			console.log("[OAuth Parent] message received:", {
				origin: event.origin,
				expectedOrigin: window.location.origin,
				sourceMatches: event.source === popupRef.current,
				data: event.data,
			})

			// Validate origin
			if (event.origin !== window.location.origin) {
				console.warn("[OAuth Parent] origin mismatch")
				return
			}

			// Validate source is our popup
			if (event.source !== popupRef.current) {
				console.warn("[OAuth Parent] source mismatch")
				return
			}

			if (event.data?.type !== "GOOGLE_OAUTH_CALLBACK") {
				return
			}

			clearCheckInterval()

			const { code, error: oauthError } = event.data

			if (oauthError) {
				setError(oauthError)
				setIsLoading(false)
				onErrorRef.current?.(oauthError)
				console.log("에러발생", oauthError)
				return
			}

			if (!code) {
				setError("인증 코드를 받지 못했습니다.")
				setIsLoading(false)
				onErrorRef.current?.("인증 코드를 받지 못했습니다.")
				console.log("코드 안받는 에러발생", oauthError)
				return
			}

			try {
				// Exchange code for auth token
				const redirectUri = `${window.location.origin}/auth/callback/`
				const response = await authClient.exchangeCodeForToken({
					code,
					redirect_uri: redirectUri,
				})

				if (response.ok) {
					onSuccessRef.current({
						status: response.data.status,
						authToken: response.data.auth_token,
					})
				} else {
					throw new Error("토큰 교환에 실패했습니다.")
				}
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
				setError(errorMessage)
				onErrorRef.current?.(errorMessage)
			} finally {
				setIsLoading(false)
			}
		},
		[clearCheckInterval],
	)

	// Message listener - now stable since handleMessage only depends on clearCheckInterval
	useEffect(() => {
		window.addEventListener("message", handleMessage)
		return () => {
			window.removeEventListener("message", handleMessage)
		}
	}, [handleMessage])

	// Cleanup interval on unmount only
	useEffect(() => {
		return () => {
			clearCheckInterval()
		}
	}, [clearCheckInterval])

	const openPopup = useCallback(() => {
		// Clear any existing interval first
		clearCheckInterval()

		setIsLoading(true)
		setError(null)

		// Calculate popup position (center of screen)
		const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2
		const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2

		// Close existing popup if any
		if (popupRef.current && !popupRef.current.closed) {
			popupRef.current.close()
		}

		const redirectUri = `${window.location.origin}/auth/callback/`
		const popup = window.open(
			authClient.getGoogleAuthUrl(redirectUri),
			"google-oauth-popup",
			`width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},scrollbars=yes,resizable=yes`,
		)

		if (!popup) {
			setError("팝업이 차단되었습니다. 팝업 차단을 해제해주세요.")
			setIsLoading(false)
			onErrorRef.current?.("팝업이 차단되었습니다.")
			return
		}

		popupRef.current = popup

		// Check if popup was closed without completing auth
		checkIntervalRef.current = setInterval(() => {
			try {
				if (popup.closed) {
					clearCheckInterval()
					setIsLoading((current) => {
						if (current) {
							setError("인증이 취소되었습니다. 다시 시도해주세요.")
							onErrorRef.current?.("인증이 취소되었습니다.")
							return false
						}
						return current
					})
				}
			} catch {
				// Cross-Origin-Opener-Policy may block window.closed access
				// In this case, we can't detect popup close
			}
		}, 500)
	}, [clearCheckInterval])

	return {
		openPopup,
		isLoading,
		error,
	}
}
