"use client"

import { Edit, MoreHorizontal, Trash2 } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import type { Member } from "@/types"
import { MemberForm } from "./member-form"

interface MemberTableProps {
	members: Member[]
	onUpdate: (id: number, data: any) => Promise<void>
	onDelete: (id: number) => Promise<void>
}

export function MemberTable({ members, onUpdate, onDelete }: MemberTableProps) {
	const [editingMember, setEditingMember] = useState<Member | null>(null)

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "active":
				return "default"
			case "inactive":
				return "secondary"
			case "suspended":
				return "destructive"
			default:
				return "outline"
		}
	}

	const getStatusText = (status: string) => {
		switch (status) {
			case "active":
				return "활성"
			case "inactive":
				return "비활성"
			case "suspended":
				return "정지"
			default:
				return status
		}
	}

	const handleEdit = (member: Member) => {
		setEditingMember(member)
	}

	const handleUpdate = async (data: any) => {
		if (editingMember) {
			await onUpdate(editingMember.id, data)
			setEditingMember(null)
		}
	}

	return (
		<>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>이름</TableHead>
							<TableHead>이메일</TableHead>
							<TableHead>전화번호</TableHead>
							<TableHead>상태</TableHead>
							<TableHead>가입일</TableHead>
							<TableHead className="w-[50px]">작업</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{members.map((member) => (
							<TableRow key={member.id}>
								<TableCell className="font-medium">{member.name}</TableCell>
								<TableCell>{member.email}</TableCell>
								<TableCell>{member.phone || "-"}</TableCell>
								<TableCell>
									<Badge variant={getStatusBadgeVariant(member.status)}>
										{getStatusText(member.status)}
									</Badge>
								</TableCell>
								<TableCell>{new Date(member.join_date).toLocaleDateString()}</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => handleEdit(member)}>
												<Edit className="mr-2 h-4 w-4" />
												수정
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => onDelete(member.id)}
												className="text-destructive"
											>
												<Trash2 className="mr-2 h-4 w-4" />
												삭제
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{editingMember && (
				<MemberForm
					member={editingMember}
					onSubmit={handleUpdate}
					trigger={
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
							<div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
								<h2 className="text-lg font-semibold mb-4">회원 수정</h2>
								<MemberForm member={editingMember} onSubmit={handleUpdate} />
								<Button
									variant="outline"
									onClick={() => setEditingMember(null)}
									className="mt-4 w-full"
								>
									취소
								</Button>
							</div>
						</div>
					}
				/>
			)}
		</>
	)
}
