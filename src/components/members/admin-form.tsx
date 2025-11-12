"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Admin {
	id: number
	role: string
	name: string
	generation?: string
	email?: string
	permission?: string
	belongTo?: string
	category?: string
	github_username?: string
	slack_id?: string
	phone?: string
	created_at?: string
}

interface AdminFormProps {
	admin?: Admin
	onSubmit: (id: number, data: Partial<Admin>) => void
	trigger?: React.ReactNode
}

export function AdminForm({ admin, onSubmit, trigger }: AdminFormProps) {
	const [open, setOpen] = useState(false)
	const [category, setCategory] = useState<string>(admin?.category || "")
	const [belongTo, setBelongTo] = useState<string>(admin?.belongTo || "")

	const handleSave = () => {
		if (!admin) return
		onSubmit(admin.id, { category, belongTo })
		setOpen(false)
	}

	const content = (
		<div className="space-y-4 py-2">
			<div className="grid grid-cols-3 gap-4 items-center">
				<Label className="col-span-1">이름</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{admin?.name}</div>
				</div>

				<Label className="col-span-1">분류</Label>
				<div className="col-span-2">
					<select
						value={category}
						onChange={(e) => setCategory(e.target.value)}
						className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm"
					>
						<option value="">선택</option>
						<option value="관리자">관리자</option>
						<option value="팀장">팀장</option>
						<option value="슈퍼 관리자">슈퍼 관리자</option>
					</select>
				</div>

				<Label className="col-span-1">소속 팀</Label>
				<div className="col-span-2">
					<select
						value={belongTo}
						onChange={(e) => setBelongTo(e.target.value)}
						className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm"
					>
						<option value="">선택</option>
						<option value="운영팀">운영팀</option>
						<option value="인터넷 프로덕트">인터넷 프로덕트</option>
						<option value="내부 프로젝트">내부 프로젝트</option>
					</select>
				</div>

				<Label className="col-span-1">기수</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{admin?.generation}</div>
				</div>

				<Label className="col-span-1">이메일</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{admin?.email}</div>
				</div>

				<Label className="col-span-1">Github 아이디</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{admin?.github_username ?? ""}</div>
				</div>

				<Label className="col-span-1">Slack 아이디</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{admin?.slack_id ?? ""}</div>
				</div>

				<Label className="col-span-1">전화번호</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{admin?.phone ?? ""}</div>
				</div>

				<Label className="col-span-1">계정 생성일</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{admin?.created_at ?? ""}</div>
				</div>
			</div>

			<div className="flex justify-end gap-2">
				<Button variant="outline" onClick={() => setOpen(false)}>
					취소
				</Button>
				<Button className="bg-[#FF6B6B] text-white" onClick={handleSave}>
					저장
				</Button>
			</div>
		</div>
	)

	if (trigger) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>{trigger}</DialogTrigger>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>관리자 정보</DialogTitle>
					</DialogHeader>
					{content}
					<DialogFooter />
				</DialogContent>
			</Dialog>
		)
	}

	return content
}
