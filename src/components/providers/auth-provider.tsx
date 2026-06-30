"use client"

import { useQueryClient } from "@tanstack/react-query"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { authClient } from "@/lib/auth"
import type { UserDetail } from "@/types"

interface AuthContextValue {
	user: UserDetail | null
	isLoading: boolean
	isAuthenticated: boolean
	refresh: () => Promise<UserDetail | null>
	setUser: (user: UserDetail | null) => void
	logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
	children: React.ReactNode
	enabled?: boolean
}

export function AuthProvider({ children, enabled = true }: AuthProviderProps) {
	const queryClient = useQueryClient()
	const [user, setUser] = useState<UserDetail | null>(null)
	const [isLoading, setIsLoading] = useState(enabled)
	const [hasLoaded, setHasLoaded] = useState(false)

	const refresh = useCallback(async () => {
		setIsLoading(true)

		try {
			const response = await authClient.getMe()
			const nextUser = response.ok && response.data?.user ? response.data.user : null
			setUser(nextUser)
			setHasLoaded(true)
			return nextUser
		} catch {
			setUser(null)
			setHasLoaded(true)
			return null
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		if (!enabled) {
			setUser(null)
			setIsLoading(false)
			setHasLoaded(false)
			return
		}

		void refresh()
	}, [enabled, refresh])

	const logout = useCallback(async () => {
		try {
			await authClient.logout()
		} finally {
			setUser(null)
			queryClient.clear()
		}
	}, [queryClient])

	const value = useMemo(
		() => ({
			user,
			isLoading: enabled && (isLoading || !hasLoaded),
			isAuthenticated: user != null,
			refresh,
			setUser,
			logout,
		}),
		[user, enabled, hasLoaded, isLoading, refresh, logout],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const context = useContext(AuthContext)

	if (!context) {
		throw new Error("useAuth must be used within AuthProvider")
	}

	return context
}
