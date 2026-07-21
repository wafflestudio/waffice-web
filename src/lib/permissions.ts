import type { UserDetail } from "@/types"

export const canManageMembers = (user?: Pick<UserDetail, "is_admin" | "is_president"> | null) =>
	Boolean(user?.is_admin || user?.is_president)
