import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Logo, LogoMark } from "@/components/auth/logo"

export default function SignupPendingPage() {
	return (
		<div className="relative min-h-screen bg-white flex items-center justify-center">
			<div className="absolute left-[20px] top-[20px] sm:left-[30px] sm:top-[30px]">
				<Link
					href="/login"
					className="inline-flex items-center gap-[10px] text-[17px] leading-[140%] tracking-[-0.02em] text-black-700 hover:opacity-70"
				>
					<ArrowLeft className="w-6 h-6" />
					이전 화면으로
				</Link>
			</div>

			<div className="flex w-full max-w-[424px] flex-col items-center gap-[48px] px-[24px] sm:px-0">
				<LogoMark width={70} height={74} className="sm:hidden" />
				<Logo size="lg" className="hidden sm:flex" />

				<div className="flex w-full flex-col items-center gap-[36px]">
					<h1 className="text-center text-[24px] font-bold leading-[140%] text-black-900 sm:text-[28px] sm:font-semibold">
						가입 승인 대기 중입니다.
					</h1>

					<div className="flex flex-col items-center gap-[36px]">
						<p className="text-[15px] font-normal leading-[140%] tracking-[-0.02em] text-black-700 text-center sm:text-[17px]">
							가입 요청이 잘 접수되었어요. 운영진이 확인 후 승인 메일을 보내드릴게요. 조금만
							기다려주세요.
						</p>

						<p className="text-[14px] leading-[140%] tracking-[-0.02em] text-black-500 sm:text-[16px]">
							문의가 필요하신가요?{" "}
							<a href="mailto:master@wafflestudio.com" className="underline underline-offset-2">
								master@wafflestudio.com
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
