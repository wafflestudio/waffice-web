import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Logo } from "@/components/auth/logo"

export default function SignupPendingPage() {
	return (
		<div className="relative min-h-screen bg-white flex items-center justify-center">
			<div className="absolute left-[30px] top-[30px]">
				<Link
					href="/login"
					className="inline-flex items-center gap-[10px] text-[17px] leading-[140%] tracking-[-0.02em] text-black-700 hover:opacity-70"
				>
					<ArrowLeft className="w-6 h-6" />
					이전 화면으로
				</Link>
			</div>

			<div className="flex flex-col items-center gap-[48px] w-[424px]">
				<Logo size="lg" />

				<div className="flex flex-col items-center gap-[36px] w-[424px]">
					<h1 className="text-[40px] font-bold leading-[140%] text-black-900 text-center">
						가입 승인 대기 중입니다.
					</h1>

					<div className="flex flex-col items-center gap-[36px]">
						<p className="text-[17px] font-normal leading-[140%] tracking-[-0.02em] text-black-700 text-center">
							가입 요청이 잘 접수되었어요. 운영진이 확인 후 승인 메일을 보내드릴게요. 조금만
							기다려주세요.
						</p>

						<p className="text-[16px] leading-[140%] tracking-[-0.02em] text-black-500">
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
