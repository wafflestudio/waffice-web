"use client"

import type { LucideIcon } from "lucide-react"
import {
	Calculator,
	ChevronDown,
	FileText,
	FolderOpen,
	GraduationCap,
	Home,
	Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

interface NavItem {
	name: string
	href: string
	icon: LucideIcon
	subItems?: { name: string; href: string }[]
	comingSoon?: boolean
}

const navigation: NavItem[] = [
	{ name: "대시보드", href: "/", icon: Home },
	{
		name: "회원 관리",
		href: "/members",
		icon: Users,
		subItems: [{ name: "가입 신청 관리", href: "/members/applications" }],
	},
	{ name: "프로젝트 관리", href: "/projects", icon: FolderOpen },
	{ name: "증명서 발급", href: "/certificates", icon: FileText, comingSoon: true },
	{ name: "회계 관리", href: "/accounting", icon: Calculator, comingSoon: true },
	{ name: "세미나 수강신청", href: "/seminars", icon: GraduationCap, comingSoon: true },
]

export function Navigation() {
	const pathname = usePathname()
	const [expandedItems, setExpandedItems] = useState<string[]>(["회원 관리"])
	const [showToast, setShowToast] = useState(false)

	const toggleExpand = (itemName: string) => {
		setExpandedItems((prev) =>
			prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName],
		)
	}

	const handleComingSoonClick = () => {
		setShowToast(true)
	}

	return (
		<>
			<nav className="flex flex-col space-y-1 p-4">
				{navigation.map((item) => {
					const isActive = pathname === item.href
					const isExpanded = expandedItems.includes(item.name)
					const hasSubItems = item.subItems && item.subItems.length > 0

					if (item.comingSoon) {
						return (
							<Button
								key={item.name}
								variant="ghost"
								className="w-full justify-start hover:bg-accent"
								onClick={handleComingSoonClick}
							>
								<item.icon className="mr-2 h-4 w-4" />
								{item.name}
							</Button>
						)
					}

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
			<Toast
				message="🚧 아직 구현 중인 기능입니다."
				isVisible={showToast}
				onClose={() => setShowToast(false)}
			/>
		</>
	)
}
