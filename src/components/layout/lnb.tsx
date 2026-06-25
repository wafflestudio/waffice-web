"use client"

import type { LucideIcon } from "lucide-react"
import {
	Calculator,
	ClipboardList,
	FileText,
	FolderOpen,
	GraduationCap,
	Home,
	Users,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Qualification, UserDetail } from "@/types"

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

const NAV_ITEMS: NavItem[] = [
	{ name: "대시보드", href: "/", icon: Home },
	{
		name: "회원 관리",
		href: "/members",
		icon: Users,
		subItems: [{ name: "가입 신청 관리", href: "/members/applications" }],
	},
	{
		name: "프로젝트 관리",
		href: "/projects",
		icon: FolderOpen,
		subItems: [
			{ name: "내 프로젝트 목록", href: "/projects/my" },
			{ name: "프로젝트 상세", href: "/projects/detail" },
		],
	},
	{ name: "내 활동 이력 관리", href: "/activities", icon: ClipboardList },
	{ name: "증명서 발급", href: "/certificates", icon: FileText },
	{ name: "회계 관리", href: "/accounting", icon: Calculator },
	{ name: "세미나 수강신청", href: "/seminars", icon: GraduationCap },
]

const isMenuActive = (pathname: string, href: string) => {
	if (href === "/") return pathname === "/"
	return pathname === href || pathname.startsWith(`${href}/`)
}

const getProfileRoleLabel = (user?: UserDetail | null) => {
	if (!user) return "프로필"
	if (user.is_admin) return "운영진"

	const qualificationLabel: Record<Qualification, string> = {
		active: "활동",
		regular: "정회원",
		associate: "준회원",
		pending: "대기",
	}

	return qualificationLabel[user.qualification]
}

interface LnbProps {
	user?: UserDetail | null
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
				<div className="flex w-[180px] flex-col gap-[2px]">
					{item.subItems.map((sub) => {
						const subActive = sub.href !== item.href && pathname === sub.href

						return (
							<Link
								key={sub.href}
								href={sub.href}
								className={cn(
									"flex h-[34px] w-[180px] items-center rounded-[4px] py-[6px] pr-[8px] pl-[40px] text-[13px]",
									subActive
										? "bg-white font-semibold leading-[20px] text-peach-500"
										: "font-medium leading-[18px] text-black-700 hover:bg-black-100",
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

export function Lnb({ user }: LnbProps) {
	const pathname = usePathname()
	const profileImage = user?.avatar_url || "/profile.png"

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
					{NAV_ITEMS.map((item) => (
						<NavMenuItem key={item.name} item={item} pathname={pathname} />
					))}
				</nav>
			</div>

			<Link
				href="/mypage"
				aria-label="마이페이지"
				className="-mx-[20px] mt-auto flex h-[63px] w-[220px] items-center border-[#ebecf0] border-t px-[30px] hover:bg-black-100"
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
				<span className="ml-[8px] flex h-[20px] w-[50px] shrink-0 items-center justify-center rounded-[20px] border border-black-400 text-center text-[12px] font-medium text-black-400 leading-normal">
					{getProfileRoleLabel(user)}
				</span>
			</Link>
		</aside>
	)
}
