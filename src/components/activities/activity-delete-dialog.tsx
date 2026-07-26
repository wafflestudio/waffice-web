"use client"

import { DesignDialogContent } from "@/components/ui/design-dialog"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import type { ActivityHistoryItem } from "@/types"

interface ActivityDeleteDialogProps {
	record: ActivityHistoryItem | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: (record: ActivityHistoryItem) => void
	submitting?: boolean
}

export function ActivityDeleteDialog({
	record,
	open,
	onOpenChange,
	onConfirm,
	submitting = false,
}: ActivityDeleteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DesignDialogContent className="w-[360px] max-w-[360px] rounded-[12px] border border-black-300 px-[40px] pt-[30px] pb-[26px] shadow-[0_0_10px_rgba(0,0,0,0.06)]">
				<DialogTitle className="sr-only">활동 이력 삭제 요청</DialogTitle>
				<p className="text-[15px] font-medium leading-[1.4] text-black-900">
					정말 해당 활동 이력을 삭제하시겠습니까?
				</p>
				<div className="mt-[40px] flex justify-end gap-[10px]">
					<DialogActionButton variant="cancel" size="sm" onClick={() => onOpenChange(false)}>
						취소
					</DialogActionButton>
					<DialogActionButton
						size="sm"
						disabled={submitting}
						onClick={() => {
							if (record) onConfirm(record)
						}}
					>
						확인
					</DialogActionButton>
				</div>
			</DesignDialogContent>
		</Dialog>
	)
}
