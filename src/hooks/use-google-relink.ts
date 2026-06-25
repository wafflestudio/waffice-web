"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authClient } from "@/lib/auth"
import type { AuthResult } from "@/types"
import { useGoogleOAuth } from "./use-google-oauth"

interface UseGoogleRelinkOptions {
	onSuccess?: (result: AuthResult) => void
	onError?: (message: string) => void
}

export const authQueryKeys = {
	all: ["auth"] as const,
	me: () => [...authQueryKeys.all, "me"] as const,
}

export function useGoogleRelink({ onSuccess, onError }: UseGoogleRelinkOptions = {}) {
	const queryClient = useQueryClient()

	const relinkMutation = useMutation({
		mutationFn: (authToken: string) =>
			authClient.relinkGoogleAccount({
				auth_token: authToken,
			}),
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: authQueryKeys.all })

			if (response.ok) {
				onSuccess?.(response.data)
			}
		},
		onError: (error) => {
			const message = error instanceof Error ? error.message : "연동 계정 변경에 실패했습니다."
			onError?.(message)
		},
	})

	const googleOAuth = useGoogleOAuth(
		async ({ authToken }) => {
			await relinkMutation.mutateAsync(authToken)
		},
		(error) => {
			onError?.(error)
		},
	)

	return {
		openRelinkPopup: googleOAuth.openPopup,
		isLoading: googleOAuth.isLoading || relinkMutation.isPending,
		error:
			googleOAuth.error ||
			(relinkMutation.error instanceof Error ? relinkMutation.error.message : null),
	}
}
