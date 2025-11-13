"use client"

import type { LucideIcon } from "lucide-react"
import { ChevronDown, FolderOpen, Home, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavItem {
	name: string
	href: string
	icon: LucideIcon
	subItems?: { name: string; href: string }[]
}

const navigation: NavItem[] = [
	{ name: "대시보드", href: "/", icon: Home },
	{
		name: "회원 관리",
		href: "/members",
		icon: Users,
		subItems: [
			{ name: "가입 신청 관리", href: "/members/applications" },
			{ name: "접근 권한 관리", href: "/members/permissions" },
			{ name: "관리자 설정", href: "/members/admins" },
		],
	},
	{ name: "프로젝트", href: "/projects", icon: FolderOpen },
]

export function Navigation() {
	const pathname = usePathname()
	const [expandedItems, setExpandedItems] = useState<string[]>(["회원 관리"])

	const toggleExpand = (itemName: string) => {
		setExpandedItems((prev) =>
			prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName],
		)
	}

	return (
		<nav className="flex flex-col space-y-1 p-4">
			{navigation.map((item) => {
				const isActive = pathname === item.href
				const isExpanded = expandedItems.includes(item.name)
				const hasSubItems = item.subItems && item.subItems.length > 0

				return (
					<div key={item.name}>
						{hasSubItems ? (
							<>
								<div className="flex items-center">
									<Link href={item.href} className="flex-1">
										<Button
											variant="ghost"
											className={cn(
												"w-full justify-start hover:bg-accent",
												pathname === item.href && "text-[#FF6B6B]",
											)}
										>
											<item.icon className="mr-2 h-4 w-4" />
											{item.name}
										</Button>
									</Link>
									<Button
										variant="ghost"
										size="icon"
										className="h-10 w-10 shrink-0"
										onClick={() => toggleExpand(item.name)}
									>
										<ChevronDown
											className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")}
										/>
									</Button>
								</div>
								{isExpanded && item.subItems && (
									<div className="ml-6 mt-1 space-y-1">
										{item.subItems.map((subItem) => {
											const isSubActive = pathname === subItem.href
											return (
												<Link key={subItem.name} href={subItem.href}>
													<Button
														variant="ghost"
														className={cn(
															"w-full justify-start text-sm hover:bg-accent",
															isSubActive && "text-[#FF6B6B]",
														)}
													>
														{subItem.name}
													</Button>
												</Link>
											)
										})}
									</div>
								)}
							</>
						) : (
							<Link href={item.href}>
								<Button
									variant="ghost"
									className={cn(
										"w-full justify-start hover:bg-accent",
										isActive && "text-[#FF6B6B]",
									)}
								>
									<item.icon className="mr-2 h-4 w-4" />
									{item.name}
								</Button>
							</Link>
						)}
					</div>
				)
			})}
		</nav>
	)
}
