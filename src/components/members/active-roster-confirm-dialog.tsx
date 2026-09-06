"use client"

import { DesignDialogContent } from "@/components/ui/design-dialog"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import type { ActiveRosterCounts } from "@/types"

interface ActiveRosterConfirmDialogProps {
	open: boolean
	counts: ActiveRosterCounts | null
	isSubmitting?: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: () => void
}

/**
 * "갱신 전 결과 확인" 모달. /users/active-roster/preview로 계산한 diff 집계를
 * 보여주고, 확인해야 실제 반영(apply)이 일어난다.
 */
export function ActiveRosterConfirmDialog({
	open,
	counts,
	isSubmitting = false,
	onOpenChange,
	onConfirm,
}: ActiveRosterConfirmDialogProps) {
	if (!counts) return null

	return (
		<Dialog open={open} onOpenChange={(next) => !isSubmitting && onOpenChange(next)}>
			<DesignDialogContent className="w-[400px] max-w-[calc(100vw-32px)] rounded-[12px] border border-black-300 px-[40px] pt-[30px] pb-[26px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.06)]">
				<DialogTitle className="sr-only">갱신 전 결과 확인</DialogTitle>
				<div className="flex flex-col items-end gap-[40px]">
					<div className="flex w-full flex-col gap-[15px]">
						<p className="text-[15px] font-medium leading-[1.4] text-black-900">
							다음과 같이 집계되었습니다. 계속하시겠습니까?
						</p>
						<ul className="flex flex-col gap-[4px] text-[13px] leading-[1.6] text-black-700">
							<li>
								정회원 → 활동회원: {counts.promoted_count}명
								{counts.new_temporary_count > 0 &&
									` (신규 임시회원 ${counts.new_temporary_count}명 포함)`}
							</li>
							<li>활동회원 → 정회원: {counts.demoted_count}명</li>
							<li>활동회원 유지: {counts.maintained_count}명</li>
						</ul>
					</div>
					<div className="flex items-center gap-[10px]">
						<DialogActionButton
							variant="cancel"
							size="sm"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							취소
						</DialogActionButton>
						<DialogActionButton size="sm" onClick={onConfirm} disabled={isSubmitting}>
							{isSubmitting ? "반영 중..." : "확인"}
						</DialogActionButton>
					</div>
				</div>
			</DesignDialogContent>
		</Dialog>
	)
}
