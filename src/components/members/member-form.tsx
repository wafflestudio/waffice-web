"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { Member, MemberCreate, MemberUpdate } from "@/types"

// 폼 스키마: 대부분 읽기 전용으로 보여줄 필드를 포함하되, 저장 시에는 role과 affiliation만 전송
const memberSchema = z.object({
	name: z.string().min(1),
	role: z.enum(["활동회원", "준회원", "정회원"]),
	generation: z.string().optional(),
	email: z.string().email().optional(),
	github_username: z.string().optional(),
	slack_id: z.string().optional(),
	phone: z.string().optional(),
	affiliation: z.enum(["학부생", "졸업생"]).optional(),
	created_at: z.string().optional(),
})

type MemberFormData = z.infer<typeof memberSchema>

interface MemberFormProps {
	member?: Member
	onSubmit: (data: MemberCreate | MemberUpdate) => Promise<void>
	trigger?: React.ReactNode
}

export function MemberForm({ member, onSubmit, trigger }: MemberFormProps) {
	const [open, setOpen] = useState(false)
	const isEdit = !!member

	const {
		register,
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = useForm<MemberFormData>({
		resolver: zodResolver(memberSchema),
		defaultValues: (() => {
			if (!member)
				return {
					name: "",
					role: "활동회원",
					generation: "",
					email: "",
					github_username: "",
					slack_id: "",
					phone: "",
					affiliation: "학부생",
					created_at: "",
				}

			const createdAtRaw = member.created_at || member.join_date || ""
			let createdAtFormatted = ""
			if (createdAtRaw) {
				try {
					const d = new Date(createdAtRaw)
					createdAtFormatted = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
						d.getDate(),
					).padStart(2, "0")}`
				} catch (_e) {
					createdAtFormatted = createdAtRaw
				}
			}

			return {
				name: member.name,
				role: (member.role as "활동회원" | "준회원" | "정회원") || "활동회원",
				generation: member.generation || "",
				email: member.email,
				github_username: member.github_username || "",
				slack_id: member.slack_id || "",
				phone: member.phone || "",
				affiliation: (member.affiliation as "학부생" | "졸업생") || "학부생",
				created_at: createdAtFormatted,
			}
		})(),
	})

	const handleFormSubmit = async (data: MemberFormData) => {
		try {
			// 사용자가 변경 가능한 필드(role, affiliation)만 부모로 전달
			const payload: MemberUpdate = {
				role: data.role,
				affiliation: data.affiliation,
			}

			await onSubmit(payload)
			setOpen(false)
			reset()
		} catch (error) {
			console.error("Error submitting form:", error)
		}
	}

	const formContent = (
		<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
			<div className="grid grid-cols-3 gap-4 items-center">
				<Label className="col-span-1">이름</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{member?.name ?? ""}</div>
				</div>

				<Label className="col-span-1">자격</Label>
				<div className="col-span-2">
					<select
						{...register("role")}
						className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm"
					>
						<option>활동회원</option>
						<option>준회원</option>
						<option>정회원</option>
					</select>
				</div>

				<Label className="col-span-1">기수</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{member?.generation ?? ""}</div>
				</div>

				<Label className="col-span-1">이메일</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{member?.email ?? ""}</div>
				</div>

				<Label className="col-span-1">Github 아이디</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{member?.github_username ?? ""}</div>
				</div>

				<Label className="col-span-1">Slack 아이디</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{member?.slack_id ?? ""}</div>
				</div>

				<Label className="col-span-1">전화번호</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">{member?.phone ?? ""}</div>
				</div>

				<Label className="col-span-1">소속</Label>
				<div className="col-span-2">
					<select
						{...register("affiliation")}
						className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm"
					>
						<option>학부생</option>
						<option>졸업생</option>
					</select>
				</div>

				<Label className="col-span-1">계정 생성일</Label>
				<div className="col-span-2">
					<div className="text-sm text-gray-700">
						{member?.created_at || member?.join_date || ""}
					</div>
				</div>
			</div>

			<div className="flex justify-end space-x-2">
				<Button type="button" variant="outline" onClick={() => setOpen(false)}>
					취소
				</Button>
				<Button type="submit" disabled={isSubmitting} className="bg-[#FF6B6B] text-white">
					{isSubmitting ? "저장 중..." : "확인"}
				</Button>
			</div>
		</form>
	)

	if (trigger) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>{trigger}</DialogTrigger>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>{isEdit ? "회원 정보" : "새 회원 추가"}</DialogTitle>
					</DialogHeader>
					{formContent}
				</DialogContent>
			</Dialog>
		)
	}

	return formContent
}
