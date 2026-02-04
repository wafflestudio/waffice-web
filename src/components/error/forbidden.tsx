"use client"

import { ShieldX } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface ForbiddenProps {
	message?: string
}

export function Forbidden({ message }: ForbiddenProps) {
	const router = useRouter()

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
			<div className="flex items-center justify-center w-24 h-24 rounded-full bg-red-50">
				<ShieldX className="w-12 h-12 text-[#FF6B6B]" />
			</div>

			<div className="space-y-2">
				<h1 className="text-2xl font-bold text-gray-900">접근 권한이 없습니다</h1>
				<p className="text-gray-500 max-w-md">
					{message || "이 페이지에 접근할 수 있는 권한이 없습니다. 관리자에게 문의해주세요."}
				</p>
			</div>

			<div className="text-6xl font-bold text-gray-200">403</div>

			<div className="flex gap-3">
				<Button variant="outline" onClick={() => router.back()}>
					이전 페이지로
				</Button>
				<Button
					className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
					onClick={() => router.push("/")}
				>
					홈으로 이동
				</Button>
			</div>
		</div>
	)
}
