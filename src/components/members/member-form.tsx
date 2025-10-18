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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Member, MemberCreate, MemberUpdate } from "@/types"

const memberSchema = z.object({
	name: z.string().min(1, "이름은 필수입니다"),
	email: z.string().email("올바른 이메일 주소를 입력해주세요"),
	phone: z.string().optional(),
	status: z.enum(["active", "inactive", "suspended"]).optional(),
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
		formState: { errors, isSubmitting },
	} = useForm<MemberFormData>({
		resolver: zodResolver(memberSchema),
		defaultValues: member
			? {
					name: member.name,
					email: member.email,
					phone: member.phone || "",
					status: member.status,
				}
			: {
					name: "",
					email: "",
					phone: "",
					status: "active",
				},
	})

	const handleFormSubmit = async (data: MemberFormData) => {
		try {
			await onSubmit(data)
			setOpen(false)
			reset()
		} catch (error) {
			console.error("Error submitting form:", error)
		}
	}

	const formContent = (
		<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
			<div>
				<Label htmlFor="name">이름</Label>
				<Input id="name" {...register("name")} placeholder="회원 이름을 입력하세요" />
				{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
			</div>

			<div>
				<Label htmlFor="email">이메일</Label>
				<Input
					id="email"
					type="email"
					{...register("email")}
					placeholder="이메일 주소를 입력하세요"
				/>
				{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
			</div>

			<div>
				<Label htmlFor="phone">전화번호 (선택사항)</Label>
				<Input id="phone" {...register("phone")} placeholder="전화번호를 입력하세요" />
				{errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
			</div>

			<div className="flex justify-end space-x-2">
				<Button type="button" variant="outline" onClick={() => setOpen(false)}>
					취소
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "저장 중..." : isEdit ? "수정" : "생성"}
				</Button>
			</div>
		</form>
	)

	if (trigger) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>{trigger}</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{isEdit ? "회원 수정" : "새 회원 추가"}</DialogTitle>
					</DialogHeader>
					{formContent}
				</DialogContent>
			</Dialog>
		)
	}

	return formContent
}
