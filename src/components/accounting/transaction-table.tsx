"use client"

import { Edit, MessageSquare, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import type { Transaction } from "@/types"

interface TransactionTableProps {
	transactions: Transaction[]
	onUpdate: (id: number, data: any) => Promise<void>
	onDelete: (id: number) => Promise<void>
	onAddComment: (id: number, comment: string) => Promise<void>
}

export function TransactionTable({
	transactions,
	onUpdate,
	onDelete,
	onAddComment,
}: TransactionTableProps) {
	const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
	const [commentingTransaction, setCommentingTransaction] = useState<Transaction | null>(null)
	const [comment, setComment] = useState("")

	const getTypeBadgeVariant = (type: string) => {
		return type === "income" ? "default" : "destructive"
	}

	const getTypeText = (type: string) => {
		return type === "income" ? "수입" : "지출"
	}

	const handleAddComment = async () => {
		if (commentingTransaction && comment.trim()) {
			await onAddComment(commentingTransaction.id, comment.trim())
			setComment("")
			setCommentingTransaction(null)
		}
	}

	return (
		<>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>유형</TableHead>
							<TableHead>금액</TableHead>
							<TableHead>설명</TableHead>
							<TableHead>코멘트</TableHead>
							<TableHead>날짜</TableHead>
							<TableHead className="w-[50px]">작업</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{transactions.map((transaction) => (
							<TableRow key={transaction.id}>
								<TableCell>
									<Badge variant={getTypeBadgeVariant(transaction.transaction_type)}>
										{getTypeText(transaction.transaction_type)}
									</Badge>
								</TableCell>
								<TableCell className="font-medium">
									{transaction.amount.toLocaleString()}원
								</TableCell>
								<TableCell>{transaction.description}</TableCell>
								<TableCell className="max-w-xs truncate">{transaction.comments || "-"}</TableCell>
								<TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
								<TableCell>
									<div className="flex space-x-1">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setCommentingTransaction(transaction)}
										>
											<MessageSquare className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setEditingTransaction(transaction)}
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button variant="ghost" size="sm" onClick={() => onDelete(transaction.id)}>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Comment Dialog */}
			<Dialog open={!!commentingTransaction} onOpenChange={() => setCommentingTransaction(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>코멘트 추가</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<label className="text-sm font-medium">
								거래: {commentingTransaction?.description}
							</label>
							<Input
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								placeholder="코멘트를 입력하세요..."
								className="mt-2"
							/>
						</div>
						<div className="flex justify-end space-x-2">
							<Button
								variant="outline"
								onClick={() => {
									setCommentingTransaction(null)
									setComment("")
								}}
							>
								취소
							</Button>
							<Button onClick={handleAddComment}>코멘트 추가</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Transaction</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<label className="text-sm font-medium">Description</label>
							<Input
								defaultValue={editingTransaction?.description}
								placeholder="Enter description..."
								className="mt-2"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Amount</label>
							<Input
								type="number"
								step="0.01"
								defaultValue={editingTransaction?.amount}
								placeholder="Enter amount..."
								className="mt-2"
							/>
						</div>
						<div className="flex justify-end space-x-2">
							<Button variant="outline" onClick={() => setEditingTransaction(null)}>
								Cancel
							</Button>
							<Button onClick={() => setEditingTransaction(null)}>Save Changes</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
