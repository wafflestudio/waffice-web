import type { UserDetail, UserRole } from "@/types"

export const isAdminRole = (role?: UserRole | null) =>
	role === "admin" || role === "admin_and_leader"

export const canManageMembers = (user?: Pick<UserDetail, "role"> | null) => isAdminRole(user?.role)
