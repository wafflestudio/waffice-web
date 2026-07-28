"use client"

import type { LucideIcon } from "lucide-react"
import {
	Check,
	ChevronDown,
	ClipboardList,
	FileText,
	FlaskConical,
	FolderOpen,
	GraduationCap,
	Home,
	LogOut,
	SquarePen,
	UserRound,
	Users,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMockMode } from "@/hooks/use-mock-mode"
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
	{
		name: "활동증명서 관리",
		href: "/certificate-management",
		icon: SquarePen,
		subItems: [{ name: "활동증명서 발급 이력", href: "/certificate-management" }],
	},
	{ name: "내 활동 이력 관리", href: "/activities", icon: ClipboardList },
	{ name: "내 활동증명서 발급", href: "/certificates", icon: FileText },
]

const PRESIDENT_NAV_ITEMS: NavItem[] = ADMIN_NAV_ITEMS.map((item) =>
	item.href === "/certificate-management"
		? {
				...item,
				subItems: [
					{ name: "활동증명서 발급 이력", href: "/certificate-management" },
					{ name: "내 서명 등록", href: "/certificate-management/signature" },
				],
			}
		: item,
)

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

const SHOW_MOCK_MODE = process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === "true"

const ROLE_LABELS: Record<UserLnbRole, string> = {
	regular: "정회원",
	leader: "팀장",
	waffle_leader: "와장",
	operations: "운영팀원",
}

const getNavItems = (role: UserLnbRole) => {
	if (role === "regular") return REGULAR_NAV_ITEMS
	if (role === "leader") return LEADER_NAV_ITEMS
	if (role === "waffle_leader") return PRESIDENT_NAV_ITEMS
	return ADMIN_NAV_ITEMS
}

const isMenuActive = (pathname: string, href: string) => {
	if (href === "/") return pathname === "/"
	return pathname === href || pathname.startsWith(`${href}/`)
}

function MockModeMenuItem({
	isCollapsed,
	enabled,
	onToggle,
}: {
	isCollapsed: boolean
	enabled: boolean
	onToggle: () => void
}) {
	return (
		<button
			type="button"
			onClick={onToggle}
			aria-pressed={enabled}
			title={isCollapsed ? "Mock 활성화" : undefined}
			className={cn(
				"relative flex h-[40px] items-center rounded-[4px] py-[6px] outline-none transition-[width,padding] duration-200",
				isCollapsed ? "w-[40px] justify-center px-[8px]" : "w-[180px] pr-[8px] pl-[40px]",
				enabled ? "bg-peach-100" : "bg-white hover:bg-black-100",
			)}
		>
			<FlaskConical
				className={cn(
					"size-[16px] shrink-0",
					!isCollapsed && "absolute left-[10px]",
					enabled ? "text-peach-500" : "text-black-900",
				)}
				strokeWidth={1.8}
			/>
			{!isCollapsed && (
				<span
					className={cn(
						"min-w-0 flex-1 truncate text-left text-[15px] leading-[20px]",
						enabled ? "font-semibold text-peach-500" : "font-medium text-black-900",
					)}
				>
					Mock 활성화
				</span>
			)}
			{!isCollapsed && (
				<span
					className={cn(
						"flex h-[18px] w-[30px] shrink-0 items-center rounded-full px-[2px] transition-colors",
						enabled ? "justify-end bg-peach-300" : "justify-start bg-black-300",
					)}
				>
					<span className="size-[14px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
				</span>
			)}
		</button>
	)
}

function DockToRightIcon() {
	return (
		<svg
			aria-hidden="true"
			className="size-[14px]"
			viewBox="0 0 14 14"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M1.39583 14C1.01194 14 0.683333 13.8633 0.41 13.59C0.136667 13.3167 0 12.9881 0 12.6042V1.39583C0 1.01194 0.136667 0.683333 0.41 0.41C0.683333 0.136667 1.01194 0 1.39583 0H12.6042C12.9881 0 13.3167 0.136667 13.59 0.41C13.8633 0.683333 14 1.01194 14 1.39583V12.6042C14 12.9881 13.8633 13.3167 13.59 13.59C13.3167 13.8633 12.9881 14 12.6042 14H1.39583ZM4 12.5V1.5H1.5V12.5H4ZM5.5 12.5H12.5V1.5H5.5V12.5Z"
				fill="currentColor"
			/>
		</svg>
	)
}

interface NavMenuItemProps {
	item: NavItem
	pathname: string
	isCollapsed: boolean
}

function NavMenuItem({ item, pathname, isCollapsed }: NavMenuItemProps) {
	const active = isMenuActive(pathname, item.href)
	const Icon = item.icon
	const matchedSubItem =
		item.subItems?.find((sub) => pathname === sub.href) ??
		[...(item.subItems ?? [])]
			.sort((a, b) => b.href.length - a.href.length)
			.find((sub) => pathname.startsWith(`${sub.href}/`))
	const activeSubHref =
		matchedSubItem?.href ?? (pathname === item.href ? item.subItems?.[0]?.href : null)

	return (
		<div className={cn("flex flex-col", isCollapsed ? "w-[40px]" : "w-[180px]")}>
			<Link
				href={item.href}
				title={isCollapsed ? item.name : undefined}
				className={cn(
					"relative flex h-[40px] items-center rounded-[4px] py-[6px] transition-[width,padding] duration-200",
					isCollapsed ? "w-[40px] justify-center px-[8px]" : "w-[180px] pr-[8px] pl-[40px]",
					active ? "bg-peach-100" : "bg-white hover:bg-black-100",
				)}
			>
				<Icon
					className={cn(
						"size-[16px] shrink-0",
						!isCollapsed && "absolute left-[10px]",
						active ? "text-peach-500" : "text-black-900",
					)}
				/>
				<span
					className={cn(
						"min-w-0 flex-1 truncate text-[15px] leading-[20px]",
						isCollapsed && "sr-only",
						active ? "font-semibold text-peach-500" : "font-medium text-black-900",
					)}
				>
					{item.name}
				</span>
			</Link>

			{!isCollapsed && active && item.subItems && (
				<div className="flex w-[180px] flex-col">
					{item.subItems.map((sub) => {
						const subActive = sub.href === activeSubHref

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
		</div>
	)
}

export function Lnb() {
	const pathname = usePathname()
	const router = useRouter()
	const { user, logout, activeRole, availableRoles, setActiveRole } = useAuth()
	const { enabled: mockModeEnabled, toggle: toggleMockMode } = useMockMode()
	const [isCollapsed, setIsCollapsed] = useState(false)
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
		<aside
			className={cn(
				"flex h-full shrink-0 flex-col overflow-hidden border-[#ebecf0] border-r bg-white pt-[30px] pb-0 transition-[width,padding] duration-200",
				isCollapsed ? "w-[60px] px-[10px]" : "w-[220px] px-[20px]",
			)}
		>
			<div className="flex flex-col gap-[30px]">
				<div
					className={cn(
						"relative flex h-[20px] items-center",
						isCollapsed ? "w-[40px]" : "w-[180px]",
					)}
				>
					{!isCollapsed && (
						<Link
							href="/"
							aria-label="WAFFICE 홈"
							className="flex h-[20px] w-[140px] items-center px-[20px]"
						>
							<Image
								src="/waffice-logo.svg"
								alt="WAFFICE"
								width={94}
								height={20}
								priority
								className="h-[20px] w-[94px] object-contain"
							/>
						</Link>
					)}
					<button
						type="button"
						onClick={() => setIsCollapsed((collapsed) => !collapsed)}
						aria-label={isCollapsed ? "LNB 펼치기" : "LNB 접기"}
						aria-expanded={!isCollapsed}
						className={cn(
							"flex size-[20px] shrink-0 items-center justify-center rounded-[3px] text-black-400 outline-none hover:bg-black-100 focus-visible:ring-2 focus-visible:ring-peach-500",
							isCollapsed ? "mx-auto" : "absolute right-0",
						)}
					>
						<DockToRightIcon />
					</button>
				</div>

				<nav
					className={cn("flex flex-col gap-[8px]", isCollapsed ? "w-[40px]" : "w-[180px]")}
					aria-label="사이드 메뉴"
				>
					{navItems.map((item) => (
						<NavMenuItem
							key={item.name}
							item={item}
							pathname={pathname}
							isCollapsed={isCollapsed}
						/>
					))}
					{SHOW_MOCK_MODE && (
						<MockModeMenuItem
							isCollapsed={isCollapsed}
							enabled={mockModeEnabled}
							onToggle={toggleMockMode}
						/>
					)}
				</nav>
			</div>

			<div
				className={cn(
					"mt-auto flex items-center gap-[9px] border-[#ebecf0] border-t p-[16px] transition-[width,padding,margin] duration-200",
					isCollapsed ? "-mx-[10px] w-[60px] justify-center" : "-mx-[20px] w-[220px]",
				)}
			>
				<div
					className={cn(
						"flex min-w-0 items-center",
						isCollapsed ? "justify-center" : "flex-1 justify-between",
					)}
				>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								aria-label="프로필 메뉴 열기"
								className="flex min-w-0 items-center gap-[4px] rounded-[4px] text-left outline-none"
							>
								<div
									aria-label={`${user?.name || "사용자"} 프로필`}
									className="size-[30px] shrink-0 rounded-full bg-black-300 bg-cover bg-center"
									role="img"
									style={{ backgroundImage: `url(${profileImage})` }}
								/>
								<span
									className={cn(
										"min-w-0 flex-1 truncate text-[14px] font-medium text-black-900 leading-normal",
										isCollapsed && "sr-only",
									)}
								>
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

					{!isCollapsed && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									aria-label="LNB 역할 선택"
									className="flex h-[20px] shrink-0 items-center gap-[3px] rounded-[20px] border border-black-400 px-[8px] text-center text-[12px] font-medium text-black-400 leading-normal tracking-[-0.36px] outline-none"
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
					)}
				</div>
			</div>
		</aside>
	)
}
