"use client"

import type { LucideIcon } from "lucide-react"
import {
	Calculator,
	Check,
	ChevronDown,
	ClipboardList,
	FileText,
	FolderOpen,
	GraduationCap,
	Home,
	LogOut,
	UserRound,
	Users,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { UserLnbRole } from "@/types"

type SubItem = {
	name: string
	href: string
}

type NavItem = {
	name: string
	href: string
	icon: LucideIcon
	subItems?: SubItem[]
}

const ADMIN_NAV_ITEMS: NavItem[] = [
	{ name: "대시보드", href: "/", icon: Home },
	{
		name: "회원 관리",
		href: "/members",
		icon: Users,
		subItems: [
			{ name: "회원 정보 관리", href: "/members" },
			{ name: "가입 요청 관리", href: "/members/applications" },
		],
	},
	{
		name: "프로젝트 관리",
		href: "/projects",
		icon: FolderOpen,
		subItems: [
			{ name: "프로젝트 목록", href: "/projects" },
			{ name: "활동 이력 관리", href: "/projects/activities" },
			{ name: "나에게 온 요청", href: "/projects/requests" },
		],
	},
	{ name: "내 활동 이력 관리", href: "/activities", icon: ClipboardList },
	{ name: "증명서 발급", href: "/certificates", icon: FileText },
	{ name: "회계 관리", href: "/accounting", icon: Calculator },
	{ name: "세미나 수강신청", href: "/seminars", icon: GraduationCap },
]

const REGULAR_NAV_ITEMS: NavItem[] = [
	{ name: "대시보드", href: "/", icon: Home },
	{ name: "내 활동 이력 관리", href: "/activities", icon: ClipboardList },
	{ name: "내 활동증명서 발급", href: "/certificates", icon: FileText },
]

const LEADER_NAV_ITEMS: NavItem[] = [
	{ name: "대시보드", href: "/", icon: Home },
	{ name: "내 프로젝트 관리", href: "/projects/my", icon: FolderOpen },
	{ name: "내 활동 이력 관리", href: "/activities", icon: ClipboardList },
	{ name: "내 활동증명서 발급", href: "/certificates", icon: FileText },
	{ name: "세미나 수강신청", href: "/seminars", icon: GraduationCap },
]

const ROLE_LABELS: Record<UserLnbRole, string> = {
	regular: "정회원",
	leader: "팀장",
	waffle_leader: "와장",
	operations: "운영팀원",
}

const getNavItems = (role: UserLnbRole) => {
	if (role === "regular") return REGULAR_NAV_ITEMS
	if (role === "leader") return LEADER_NAV_ITEMS
	return ADMIN_NAV_ITEMS
}

const isMenuActive = (pathname: string, href: string) => {
	if (href === "/") return pathname === "/"
	return pathname === href || pathname.startsWith(`${href}/`)
}

interface NavMenuItemProps {
	item: NavItem
	pathname: string
}

function NavMenuItem({ item, pathname }: NavMenuItemProps) {
	const active = isMenuActive(pathname, item.href)
	const Icon = item.icon

	return (
		<>
			<Link
				href={item.href}
				className={cn(
					"relative flex h-[40px] w-[180px] items-center rounded-[4px] py-[6px] pr-[8px] pl-[40px]",
					active ? "bg-peach-100" : "bg-white hover:bg-black-100",
				)}
			>
				<Icon
					className={cn(
						"absolute left-[10px] size-[16px]",
						active ? "text-peach-500" : "text-black-900",
					)}
				/>
				<span
					className={cn(
						"min-w-0 flex-1 truncate text-[15px] leading-[20px]",
						active ? "font-semibold text-peach-500" : "font-medium text-black-900",
					)}
				>
					{item.name}
				</span>
			</Link>

			{active && item.subItems && (
				<div className="flex w-[180px] flex-col">
					{item.subItems.map((sub) => {
						const subActive = pathname === sub.href

						return (
							<Link
								key={sub.href}
								href={sub.href}
								className={cn(
									"flex h-[40px] w-[180px] items-center py-[6px] pr-[8px] pl-[40px] text-[14px] leading-[20px]",
									subActive
										? "bg-white font-semibold text-peach-500"
										: "font-medium text-black-900 hover:bg-black-100",
								)}
							>
								{sub.name}
							</Link>
						)
					})}
				</div>
			)}
		</>
	)
}

export function Lnb() {
	const pathname = usePathname()
	const router = useRouter()
	const { user, logout, activeRole, availableRoles, setActiveRole } = useAuth()
	const profileImage = user?.avatar_url || "/profile.png"
	const navItems = getNavItems(activeRole)

	const handleLogout = async () => {
		try {
			await logout()
		} finally {
			router.replace("/login")
		}
	}

	return (
		<aside className="flex h-full w-[220px] shrink-0 flex-col border-[#ebecf0] border-r bg-white px-[20px] pt-[30px] pb-0">
			<div className="flex flex-col gap-[30px]">
				<Link
					href="/"
					aria-label="WAFFICE 홈"
					className="flex h-[20px] w-[180px] items-center px-[20px]"
				>
					<Image
						src="/waffle.svg"
						alt="WAFFICE"
						width={83}
						height={20}
						priority
						className="h-[20px] w-[83px] object-contain"
					/>
				</Link>

				<nav className="flex w-[180px] flex-col gap-[8px]" aria-label="사이드 메뉴">
					{navItems.map((item) => (
						<NavMenuItem key={item.name} item={item} pathname={pathname} />
					))}
				</nav>
			</div>

			<div className="-mx-[20px] mt-auto flex h-[63px] w-[220px] items-center border-[#ebecf0] border-t px-[30px]">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							aria-label="프로필 메뉴 열기"
							className="flex min-w-0 flex-1 items-center rounded-[4px] text-left outline-none"
						>
							<div
								aria-label={`${user?.name || "사용자"} 프로필`}
								className="size-[30px] shrink-0 rounded-full bg-black-300 bg-cover bg-center"
								role="img"
								style={{ backgroundImage: `url(${profileImage})` }}
							/>
							<span className="ml-[8px] min-w-0 flex-1 truncate text-[15px] font-medium text-black-900 leading-normal">
								{user?.name || "사용자"}
							</span>
						</button>
					</DropdownMenuTrigger>
					{user && (
						<DropdownMenuContent
							align="start"
							side="top"
							sideOffset={8}
							className="w-[180px] rounded-[6px] border-[#dbdfe0] p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
						>
							<DropdownMenuItem
								onSelect={() => router.push("/mypage")}
								className="h-[40px] cursor-pointer rounded-[3px] px-[8px] text-[14px] font-medium text-black-700 focus:bg-black-100"
							>
								<UserRound className="size-[16px] text-black-600" strokeWidth={1.8} />
								마이페이지
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={handleLogout}
								className="h-[40px] cursor-pointer rounded-[3px] px-[8px] text-[14px] font-medium text-black-700 focus:bg-black-100"
							>
								<LogOut className="size-[16px] text-black-600" strokeWidth={1.8} />
								로그아웃
							</DropdownMenuItem>
						</DropdownMenuContent>
					)}
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							aria-label="LNB 역할 선택"
							className="ml-[8px] flex h-[20px] shrink-0 items-center gap-[3px] rounded-[20px] border border-black-400 px-[8px] text-center text-[12px] font-medium text-black-400 leading-normal tracking-[-0.36px] outline-none"
						>
							{ROLE_LABELS[activeRole]}
							<ChevronDown className="h-[5px] w-[8px]" strokeWidth={2} />
						</button>
					</DropdownMenuTrigger>
					{user && (
						<DropdownMenuContent
							align="end"
							side="top"
							sideOffset={14}
							className="w-[120px] rounded-[6px] border-[#dbdfe0] p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
						>
							{availableRoles.map((role) => (
								<DropdownMenuItem
									key={role}
									onSelect={() => setActiveRole(role)}
									className={cn(
										"h-[40px] cursor-pointer rounded-[3px] px-[8px] text-[14px] font-medium focus:bg-peach-100",
										activeRole === role ? "text-peach-500" : "text-black-600",
									)}
								>
									<span className="flex-1">{ROLE_LABELS[role]}</span>
									{activeRole === role && <Check className="size-[12px]" strokeWidth={2.5} />}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					)}
				</DropdownMenu>
			</div>
		</aside>
	)
}
