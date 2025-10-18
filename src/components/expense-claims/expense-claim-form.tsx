"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
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
import { apiClient } from "@/lib/api"
import type { ExpenseClaim, ExpenseClaimCreate, Project } from "@/types"

const expenseClaimSchema = z.object({
	amount: z.number().positive("금액은 양수여야 합니다"),
	description: z.string().min(1, "설명은 필수입니다"),
	project_id: z.number().positive("프로젝트를 선택해주세요"),
	receipt_url: z.string().url("올바른 URL을 입력해주세요").optional().or(z.literal("")),
})

type ExpenseClaimFormData = z.infer<typeof expenseClaimSchema>

interface ExpenseClaimFormProps {
	expenseClaim?: ExpenseClaim
	onSubmit: (data: ExpenseClaimCreate) => Promise<void>
	trigger?: React.ReactNode
	memberId?: number
}

export function ExpenseClaimForm({
	expenseClaim,
	onSubmit,
	trigger,
	memberId = 1, // Default member ID for demo
}: ExpenseClaimFormProps) {
	const [open, setOpen] = useState(false)
	const [projects, setProjects] = useState<Project[]>([])
	const _isEdit = !!expenseClaim

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ExpenseClaimFormData>({
		resolver: zodResolver(expenseClaimSchema),
		defaultValues: expenseClaim
			? {
					amount: expenseClaim.amount,
					description: expenseClaim.description,
					project_id: expenseClaim.project_id,
					receipt_url: expenseClaim.receipt_url || "",
				}
			: {
					amount: 0,
					description: "",
					project_id: 0,
					receipt_url: "",
				},
	})

	useEffect(() => {
		const fetchProjects = async () => {
			try {
				const projectsData = await apiClient.getProjects()
				setProjects(projectsData)
			} catch (error) {
				console.error("Error fetching projects:", error)
			}
		}
		fetchProjects()
	}, [])

	const handleFormSubmit = async (data: ExpenseClaimFormData) => {
		try {
			const submitData = {
				...data,
				receipt_url: data.receipt_url || undefined,
			}
			await onSubmit(submitData)
			setOpen(false)
			reset()
		} catch (error) {
			console.error("Error submitting form:", error)
		}
	}

	const formContent = (
		<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
			<div>
				<Label htmlFor="project_id">Project</Label>
				<select
					id="project_id"
					{...register("project_id", { valueAsNumber: true })}
					className="w-full p-2 border rounded-md"
				>
					<option value={0}>Select a project</option>
					{projects.map((project) => (
						<option key={project.id} value={project.id}>
							{project.name}
						</option>
					))}
				</select>
				{errors.project_id && (
					<p className="text-sm text-destructive">{errors.project_id.message}</p>
				)}
			</div>

			<div>
				<Label htmlFor="amount">금액</Label>
				<Input
					id="amount"
					type="number"
					step="0.01"
					{...register("amount", { valueAsNumber: true })}
					placeholder="지출 금액을 입력하세요"
				/>
				{errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
			</div>

			<div>
				<Label htmlFor="description">설명</Label>
				<Input
					id="description"
					{...register("description")}
					placeholder="지출 내용을 설명해주세요"
				/>
				{errors.description && (
					<p className="text-sm text-destructive">{errors.description.message}</p>
				)}
			</div>

			<div>
				<Label htmlFor="receipt_url">영수증 URL (선택사항)</Label>
				<Input
					id="receipt_url"
					type="url"
					{...register("receipt_url")}
					placeholder="영수증 URL을 입력하세요"
				/>
				{errors.receipt_url && (
					<p className="text-sm text-destructive">{errors.receipt_url.message}</p>
				)}
			</div>

			<div className="flex justify-end space-x-2">
				<Button type="button" variant="outline" onClick={() => setOpen(false)}>
					취소
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "제출 중..." : "청구서 제출"}
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
						<DialogTitle>지출 청구서 제출</DialogTitle>
					</DialogHeader>
					{formContent}
				</DialogContent>
			</Dialog>
		)
	}

	return formContent
}
