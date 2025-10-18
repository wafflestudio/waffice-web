"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { MemberForm } from "@/components/members/member-form"
import { MemberTable } from "@/components/members/member-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { Member, type MemberCreate, type MemberUpdate } from "@/types"

export default function MembersPage() {
	const queryClient = useQueryClient()
	const [showAddForm, setShowAddForm] = useState(false)

	const {
		data: members = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["members"],
		queryFn: () => apiClient.getMembers(),
	})

	const createMemberMutation = useMutation({
		mutationFn: (data: MemberCreate) => apiClient.createMember(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["members"] })
			setShowAddForm(false)
		},
	})

	const updateMemberMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: MemberUpdate }) =>
			apiClient.updateMember(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["members"] })
		},
	})

	const deleteMemberMutation = useMutation({
		mutationFn: (id: number) => apiClient.deleteMember(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["members"] })
		},
	})

	const handleCreateMember = async (data: MemberCreate | MemberUpdate) => {
		await createMemberMutation.mutateAsync(data as MemberCreate)
	}

	const handleUpdateMember = async (id: number, data: MemberUpdate) => {
		await updateMemberMutation.mutateAsync({ id, data })
	}

	const handleDeleteMember = async (id: number) => {
		if (confirm("Are you sure you want to delete this member?")) {
			await deleteMemberMutation.mutateAsync(id)
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg">회원 목록을 불러오는 중...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg text-destructive">
					회원 목록을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">회원 관리</h1>
				<Button onClick={() => setShowAddForm(true)}>
					<Plus className="mr-2 h-4 w-4" />
					회원 추가
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>스튜디오 회원 ({members.length}명)</CardTitle>
				</CardHeader>
				<CardContent>
					<MemberTable
						members={members}
						onUpdate={handleUpdateMember}
						onDelete={handleDeleteMember}
					/>
				</CardContent>
			</Card>

			{showAddForm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
						<h2 className="text-lg font-semibold mb-4">새 회원 추가</h2>
						<MemberForm onSubmit={handleCreateMember} />
						<Button variant="outline" onClick={() => setShowAddForm(false)} className="mt-4 w-full">
							취소
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}
