"use client"

import type { LucideIcon } from "lucide-react"
import { Calculator, FileText, FolderOpen, GraduationCap, Home, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"
import { cn } from "@/lib/utils"

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
			{ name: "내 프로젝트 목록", href: "/projects" },
			{ name: "프로젝트 상세", href: "/projects/detail" },
		],
	},
	{ name: "증명서 발급", href: "/certificates", icon: FileText },
	{ name: "회계 관리", href: "/accounting", icon: Calculator },
	{ name: "세미나 수강신청", href: "/seminars", icon: GraduationCap },
]

const isMenuActive = (pathname: string, href: string) => {
	if (href === "/") return pathname === "/"
	return pathname === href || pathname.startsWith(`${href}/`)
}

export function Lnb() {
	const pathname = usePathname()

	return (
		<aside className="flex h-full w-[280px] shrink-0 flex-col gap-[12px] border-r border-black-150 bg-white px-[20px] py-[40px]">
			{NAV_ITEMS.map((item) => {
				const active = isMenuActive(pathname, item.href)
				const Icon = item.icon

				return (
					<Fragment key={item.name}>
						<Link
							href={item.href}
							className={cn(
								"flex h-[45px] w-full items-center gap-[8px] rounded-[4px] px-[16px] py-[6px]",
								active ? "bg-peach-50" : "hover:bg-black-100",
							)}
						>
							<Icon className={cn("size-[24px]", active ? "text-peach-500" : "text-black-900")} />
							<span
								className={cn(
									"text-[17px] leading-[1.4] tracking-[-0.34px]",
									active ? "font-semibold text-peach-500" : "font-medium text-black-900",
								)}
							>
								{item.name}
							</span>
						</Link>

						{active && item.subItems && (
							<div className="flex w-full flex-col">
								{item.subItems.map((sub) => {
									const subActive = pathname === sub.href
									return (
										<Link
											key={sub.href}
											href={sub.href}
											className={cn(
												"flex h-[45px] w-full items-center py-[6px] pl-[50px] pr-[8px] text-[15px]",
												subActive
													? "font-semibold leading-[1.4] tracking-[-0.3px] text-peach-500"
													: "font-medium leading-normal text-black-900 hover:bg-black-100",
											)}
										>
											{sub.name}
										</Link>
									)
								})}
							</div>
						)}
					</Fragment>
				)
			})}
		</aside>
	)
}
