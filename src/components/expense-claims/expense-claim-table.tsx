"use client"

import { Check, MoreHorizontal, Trash2, X } from "lucide-react"
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
import type { ExpenseClaim } from "@/types"

interface ExpenseClaimTableProps {
	expenseClaims: ExpenseClaim[]
	onApprove: (id: number) => Promise<void>
	onReject: (id: number) => Promise<void>
	onDelete: (id: number) => Promise<void>
	isAdmin?: boolean
}

export function ExpenseClaimTable({
	expenseClaims,
	onApprove,
	onReject,
	onDelete,
	isAdmin = false,
}: ExpenseClaimTableProps) {
	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "pending":
				return "secondary"
			case "approved":
				return "default"
			case "rejected":
				return "destructive"
			default:
				return "outline"
		}
	}

	const getStatusText = (status: string) => {
		switch (status) {
			case "pending":
				return "대기중"
			case "approved":
				return "승인됨"
			case "rejected":
				return "거부됨"
			default:
				return status
		}
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>금액</TableHead>
						<TableHead>설명</TableHead>
						<TableHead>프로젝트 ID</TableHead>
						<TableHead>상태</TableHead>
						<TableHead>제출일</TableHead>
						<TableHead>검토일</TableHead>
						{isAdmin && <TableHead className="w-[50px]">작업</TableHead>}
					</TableRow>
				</TableHeader>
				<TableBody>
					{expenseClaims.map((claim) => (
						<TableRow key={claim.id}>
							<TableCell className="font-medium">{claim.amount.toLocaleString()}원</TableCell>
							<TableCell className="max-w-xs truncate">{claim.description}</TableCell>
							<TableCell>{claim.project_id}</TableCell>
							<TableCell>
								<Badge variant={getStatusBadgeVariant(claim.status)}>
									{getStatusText(claim.status)}
								</Badge>
							</TableCell>
							<TableCell>{new Date(claim.submitted_at).toLocaleDateString()}</TableCell>
							<TableCell>
								{claim.reviewed_at ? new Date(claim.reviewed_at).toLocaleDateString() : "-"}
							</TableCell>
							{isAdmin && (
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											{claim.status === "pending" && (
												<>
													<DropdownMenuItem onClick={() => onApprove(claim.id)}>
														<Check className="mr-2 h-4 w-4" />
														승인
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => onReject(claim.id)}>
														<X className="mr-2 h-4 w-4" />
														거부
													</DropdownMenuItem>
												</>
											)}
											<DropdownMenuItem
												onClick={() => onDelete(claim.id)}
												className="text-destructive"
											>
												<Trash2 className="mr-2 h-4 w-4" />
												삭제
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							)}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
