import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Logo } from "@/components/auth/logo"

export default function SignupPendingPage() {
	return (
		<div className="relative min-h-screen p-6 flex items-center justify-center">
			<div className="absolute left-4 top-4">
				<Link
					href="/login"
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					이전 화면으로
				</Link>
			</div>

			<div className="text-center max-w-xl">
				<Logo size="lg" className="mx-auto mb-6" />
				<h1 className="text-2xl md:text-3xl font-bold">가입 승인 대기 중입니다.</h1>
				<p className="mt-4 text-muted-foreground">
					가입 요청이 잘 접수되었어요.
					<br className="hidden sm:block" />
					운영진이 확인 후 승인 메일을 보내드릴게요. 조금만 기다려주세요.
				</p>
				<p className="mt-6 text-sm text-muted-foreground">
					문의가 필요하신가요?{" "}
					<a href="mailto:master@wafflestudio.com" className="underline underline-offset-2">
						master@wafflestudio.com
					</a>
				</p>
			</div>
		</div>
	)
}
