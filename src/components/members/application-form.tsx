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

interface Application {
	id: number
	name: string
	generation: string
	email: string
	github_username: string
	application_date: string
	status: string
}

interface ApplicationFormProps {
	application: Application
	onApprove: (id: number, role: string) => void
	onReject: (id: number) => void
	trigger?: React.ReactNode
}

export function ApplicationForm({
	application,
	onApprove,
	onReject,
	trigger,
}: ApplicationFormProps) {
	const [open, setOpen] = useState(false)
	const [selectedRole, setSelectedRole] = useState<string>("활동회원")

	const handleApprove = () => {
		onApprove(application.id, selectedRole)
		setOpen(false)
	}

	const handleReject = () => {
		onReject(application.id)
		setOpen(false)
	}

	const content = (
		<div className="space-y-4 py-2">
			<div className="grid grid-cols-3 gap-4 items-center">
				<Label className="col-span-1">이름</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{application.name}</div>
				</div>

				<Label className="col-span-1">자격</Label>
				<div className="col-span-2">
					<select
						value={selectedRole}
						onChange={(e) => setSelectedRole(e.target.value)}
						className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm"
					>
						<option>활동회원</option>
						<option>준회원</option>
						<option>정회원</option>
					</select>
				</div>

				<Label className="col-span-1">기수</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{application.generation}</div>
				</div>

				<Label className="col-span-1">이메일</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{application.email}</div>
				</div>

				<Label className="col-span-1">Github 아이디</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{application.github_username}</div>
				</div>

				<Label className="col-span-1">가입 신청일</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">
						{new Date(application.application_date).toLocaleDateString()}
					</div>
				</div>
			</div>

			<div className="flex justify-end gap-2">
				<Button
					variant="outline"
					onClick={handleReject}
					className="border-[#FF6B6B] text-[#FF6B6B]"
				>
					반려
				</Button>
				<Button className="bg-[#FF6B6B] text-white" onClick={handleApprove}>
					승인
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
						<DialogTitle>가입 신청 정보</DialogTitle>
					</DialogHeader>
					{content}
					<DialogFooter />
				</DialogContent>
			</Dialog>
		)
	}

	return content
}
