"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth"

interface GnbProps {
	isLoggedIn: boolean
	onLogout?: () => void
}

export function Gnb({ isLoggedIn, onLogout }: GnbProps) {
	const router = useRouter()

	const handleLogout = async () => {
		if (onLogout) {
			onLogout()
			return
		}
		try {
			await authClient.logout()
			router.push("/login")
		} catch (err) {
			console.error("로그아웃 실패:", err)
		}
	}

	return (
		<header className="z-40 flex w-full shrink-0 flex-col items-start justify-center bg-white px-[50px] py-[17px] border-b-[1px] border-[#EBECF0]">
			<div className="flex w-full items-center justify-between">
				<Link href="/" className="relative block h-[20px] w-[86px]">
					<Image
						src="/waffle.svg"
						alt="WAFFICE"
						fill
						priority
						sizes="86px"
						className="object-contain"
					/>
				</Link>
				<div className="flex items-center gap-[10px]">
					{isLoggedIn ? (
						<>
							<button
								type="button"
								onClick={handleLogout}
								className="flex items-center justify-center rounded-[3px] px-[14px] py-[6px] font-['Pretendard'] text-[14px] font-medium leading-[1.5] tracking-[-0.14px] text-[#121212] hover:bg-[#F7F7F7]"
							>
								로그아웃
							</button>
							<Link
								href="/mypage"
								aria-label="마이페이지"
								className="relative block size-[40px] overflow-hidden rounded-full"
							>
								<Image src="/profile.png" alt="프로필" fill sizes="40px" className="object-cover" />
							</Link>
						</>
					) : (
						<Link href="/login">
							<Button className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white">로그인</Button>
						</Link>
					)}
				</div>
			</div>
		</header>
	)
}
