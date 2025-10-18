"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { ExpenseClaimForm } from "@/components/expense-claims/expense-claim-form"
import { ExpenseClaimTable } from "@/components/expense-claims/expense-claim-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import type { ExpenseClaimCreate } from "@/types"

export default function ExpenseClaimsPage() {
	const queryClient = useQueryClient()
	const [showAddForm, setShowAddForm] = useState(false)
	const [isAdmin] = useState(true) // For demo purposes

	const {
		data: expenseClaims = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["expense-claims"],
		queryFn: () => apiClient.getExpenseClaims(),
	})

	const createExpenseClaimMutation = useMutation({
		mutationFn: (data: ExpenseClaimCreate) => apiClient.createExpenseClaim(data, 1), // Using member ID 1 for demo
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expense-claims"] })
			setShowAddForm(false)
		},
	})

	const approveExpenseClaimMutation = useMutation({
		mutationFn: (id: number) => apiClient.approveExpenseClaim(id, 1, "Approved by admin"), // Using admin ID 1 for demo
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expense-claims"] })
		},
	})

	const rejectExpenseClaimMutation = useMutation({
		mutationFn: (id: number) => apiClient.rejectExpenseClaim(id, 1, "Rejected by admin"), // Using admin ID 1 for demo
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expense-claims"] })
		},
	})

	const deleteExpenseClaimMutation = useMutation({
		mutationFn: (id: number) => apiClient.deleteExpenseClaim(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expense-claims"] })
		},
	})

	const handleCreateExpenseClaim = async (data: ExpenseClaimCreate) => {
		await createExpenseClaimMutation.mutateAsync(data)
	}

	const handleApprove = async (id: number) => {
		if (confirm("Are you sure you want to approve this expense claim?")) {
			await approveExpenseClaimMutation.mutateAsync(id)
		}
	}

	const handleReject = async (id: number) => {
		if (confirm("Are you sure you want to reject this expense claim?")) {
			await rejectExpenseClaimMutation.mutateAsync(id)
		}
	}

	const handleDelete = async (id: number) => {
		if (confirm("Are you sure you want to delete this expense claim?")) {
			await deleteExpenseClaimMutation.mutateAsync(id)
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg">지출 청구서를 불러오는 중...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg text-destructive">
					지출 청구서를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">지출 청구</h1>
				<Button onClick={() => setShowAddForm(true)}>
					<Plus className="mr-2 h-4 w-4" />
					청구서 제출
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>지출 청구서 ({expenseClaims.length}건)</CardTitle>
				</CardHeader>
				<CardContent>
					<ExpenseClaimTable
						expenseClaims={expenseClaims}
						onApprove={handleApprove}
						onReject={handleReject}
						onDelete={handleDelete}
						isAdmin={isAdmin}
					/>
				</CardContent>
			</Card>

			{showAddForm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
						<h2 className="text-lg font-semibold mb-4">지출 청구서 제출</h2>
						<ExpenseClaimForm onSubmit={handleCreateExpenseClaim} />
						<Button variant="outline" onClick={() => setShowAddForm(false)} className="mt-4 w-full">
							취소
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}
