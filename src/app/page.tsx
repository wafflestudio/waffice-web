"use client"

import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { usePendingUsers } from "@/hooks/use-members"
import { useRequests } from "@/hooks/use-requests"
import type { UserLnbRole } from "@/types"

interface StatCardProps {
	href: string
	label: string
	value: string
	unit: string
}

function StatCard({ href, label, value, unit }: StatCardProps) {
	return (
		<Link
			href={href}
			className="group relative flex h-[218px] w-[340px] shrink-0 border-black-900 border-l-[0.5px] px-[46px] py-[40px] transition-colors hover:bg-black-100 focus-visible:bg-black-100 focus-visible:outline-2 focus-visible:outline-peach-500 focus-visible:outline-offset-2"
		>
			<div className="flex flex-col gap-[40px]">
				<h2 className="text-[18px] font-bold leading-[1.5] tracking-[-0.18px] text-black-900">
					{label}
				</h2>
				<div className="flex items-end gap-[4px] whitespace-nowrap text-black-900">
					<span className="text-[64px] font-medium leading-[0.7] tracking-[-0.64px]">{value}</span>
					<span className="text-[16px] font-medium leading-[0.9] tracking-[-0.16px]">{unit}</span>
				</div>
			</div>
			<Image
				src="/dashboard/arrow-outward.svg"
				alt=""
				width={50}
				height={50}
				className="absolute top-[40px] right-[46px] size-[50px]"
			/>
		</Link>
	)
}

interface QuickLinkCardProps {
	href: string
	imageSrc: string
	imageAlt: string
	imageClassName: string
	title: string
	description: string
}

function QuickLinkCard({
	href,
	imageSrc,
	imageAlt,
	imageClassName,
	title,
	description,
}: QuickLinkCardProps) {
	return (
		<Link
			href={href}
			className="relative h-[240px] min-w-[280px] flex-1 border-black-300 border-l transition-colors hover:bg-black-100 focus-visible:bg-black-100 focus-visible:outline-2 focus-visible:outline-peach-500 focus-visible:outline-offset-2"
		>
			<Image src={imageSrc} alt={imageAlt} width={100} height={100} className={imageClassName} />
			<div className="absolute right-[30px] bottom-[18px] left-[30px] flex flex-col gap-[4px]">
				<h2 className="text-[18px] font-bold leading-[1.5] tracking-[-0.18px] text-black-900">
					{title}
				</h2>
				<p className="text-[14px] font-medium leading-[1.5] tracking-[-0.14px] text-black-900">
					{description}
				</p>
			</div>
		</Link>
	)
}

const isOperationsDashboard = (role: UserLnbRole) =>
	role === "operations" || role === "waffle_leader"

export default function DashboardPage() {
	const { user, activeRole } = useAuth()
	const showPendingMembers = isOperationsDashboard(activeRole)
	const showReceivedRequests = showPendingMembers || activeRole === "leader"
	const pendingUsers = usePendingUsers(showPendingMembers)
	const receivedRequests = useRequests({
		scope: "received",
		status: "pending",
		limit: 100,
		enabled: showReceivedRequests,
	})
	const pendingCount = pendingUsers.data?.length
	const requestCount = receivedRequests.data?.items.length

	return (
		<div className="mx-auto flex w-full max-w-[1100px] flex-col gap-[60px] px-[20px] pt-[38px] pb-[40px]">
			<header className="flex flex-col gap-[4px]">
				<h1 className="text-[28px] font-semibold leading-[1.5] tracking-[-0.28px] text-black-900">
					안녕하세요, {user?.name ?? "회원"}님
				</h1>
				<p className="text-[16px] font-medium leading-[1.5] tracking-[-0.16px] text-black-900">
					와플스튜디오 회원 포털 와피스에 오신 것을 환영합니다!
				</p>
			</header>

			<div className="flex flex-col gap-[40px]">
				{showReceivedRequests && (
					<div className="flex flex-wrap gap-[20px]">
						{showPendingMembers && (
							<StatCard
								href="/members/applications"
								label="가입 대기 회원"
								value={pendingCount == null ? "—" : String(pendingCount).padStart(2, "0")}
								unit="명"
							/>
						)}
						<StatCard
							href="/projects/requests"
							label="나에게 온 요청"
							value={requestCount == null ? "—" : String(requestCount).padStart(2, "0")}
							unit="건"
						/>
					</div>
				)}

				<div className="flex flex-wrap gap-[20px]">
					<QuickLinkCard
						href="/mypage"
						imageSrc="/dashboard/mypage.svg"
						imageAlt="와플 캐릭터 프로필"
						imageClassName="absolute top-[24px] left-1/2 size-[90px] -translate-x-1/2"
						title="마이페이지"
						description="회원님의 프로필을 업로드해보세요."
					/>
					<QuickLinkCard
						href="/activities"
						imageSrc="/dashboard/activity-history.png"
						imageAlt="노트북을 사용하는 와플 캐릭터"
						imageClassName="absolute top-[48px] left-1/2 h-[57px] w-[95px] -translate-x-1/2"
						title="내 활동이력 관리"
						description="회원님의 활동이력을 확인하고 관리해보세요."
					/>
					<QuickLinkCard
						href="/certificates"
						imageSrc="/dashboard/certificate.svg"
						imageAlt="와플 캐릭터 활동증명서"
						imageClassName="absolute top-[28px] left-1/2 h-[79px] w-[90px] -translate-x-1/2"
						title="내 활동증명서 발급"
						description="활동이력을 증명서로 발급받아보세요."
					/>
				</div>
			</div>
		</div>
	)
}
