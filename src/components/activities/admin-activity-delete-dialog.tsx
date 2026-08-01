"use client"

import type { AdminActivityRow } from "@/components/activities/admin-activity-history.utils"
import { DesignDialogContent } from "@/components/ui/design-dialog"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"

interface AdminActivityDeleteDialogProps {
	row: AdminActivityRow | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: (row: AdminActivityRow) => void
	submitting?: boolean
}

export function AdminActivityDeleteDialog({
	row,
	open,
	onOpenChange,
	onConfirm,
	submitting = false,
}: AdminActivityDeleteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DesignDialogContent className="w-[340px] max-w-[340px] rounded-[12px] border border-black-300 px-[40px] pt-[30px] pb-[26px] shadow-[0_0_10px_rgba(0,0,0,0.06)]">
				<DialogTitle className="sr-only">활동이력 삭제</DialogTitle>
				<p className="text-[15px] font-medium leading-[1.4] text-black-900">삭제하시겠습니까?</p>
				<div className="mt-[40px] flex justify-end gap-[10px]">
					<DialogActionButton
						variant="cancel"
						size="sm"
						disabled={submitting}
						onClick={() => onOpenChange(false)}
					>
						취소
					</DialogActionButton>
					<DialogActionButton
						size="sm"
						disabled={submitting}
						onClick={() => {
							if (row) onConfirm(row)
						}}
					>
						확인
					</DialogActionButton>
				</div>
			</DesignDialogContent>
		</Dialog>
	)
}
