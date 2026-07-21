"use client"

import { useQueryClient } from "@tanstack/react-query"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { authClient } from "@/lib/auth"
import type { UserDetail, UserLnbRole, UserRoleFlags } from "@/types"

const ROLE_PRIORITY: UserLnbRole[] = ["waffle_leader", "operations", "leader", "regular"]

const toRoleFlags = (user: UserDetail | null): UserRoleFlags => {
	if (!user) {
		return {
			is_regular_member: false,
			is_team_leader: false,
			is_waffle_leader: false,
			is_operations_member: false,
		}
	}

	return {
		is_regular_member: ["regular", "active"].includes(user.qualification),
		is_team_leader: user.is_leader,
		is_waffle_leader: user.is_president,
		is_operations_member: user.is_admin,
	}
}

const getAvailableRoles = (flags: UserRoleFlags): UserLnbRole[] => {
	const roleMap: Record<UserLnbRole, boolean> = {
		regular: flags.is_regular_member,
		leader: flags.is_team_leader,
		waffle_leader: flags.is_waffle_leader,
		operations: flags.is_operations_member,
	}

	return ROLE_PRIORITY.filter((role) => roleMap[role])
}

interface AuthContextValue {
	user: UserDetail | null
	isLoading: boolean
	isAuthenticated: boolean
	roleFlags: UserRoleFlags
	availableRoles: UserLnbRole[]
	activeRole: UserLnbRole
	setActiveRole: (role: UserLnbRole) => void
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
	const [selectedRole, setSelectedRole] = useState<UserLnbRole | null>(null)
	const roleFlags = useMemo(() => toRoleFlags(user), [user])
	const availableRoles = useMemo(() => getAvailableRoles(roleFlags), [roleFlags])
	const activeRole =
		selectedRole && availableRoles.includes(selectedRole)
			? selectedRole
			: (availableRoles[0] ?? "regular")

	const setActiveRole = useCallback(
		(role: UserLnbRole) => {
			if (availableRoles.includes(role)) setSelectedRole(role)
		},
		[availableRoles],
	)

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
			roleFlags,
			availableRoles,
			activeRole,
			setActiveRole,
			refresh,
			setUser,
			logout,
		}),
		[
			user,
			enabled,
			hasLoaded,
			isLoading,
			roleFlags,
			availableRoles,
			activeRole,
			setActiveRole,
			refresh,
			logout,
		],
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
