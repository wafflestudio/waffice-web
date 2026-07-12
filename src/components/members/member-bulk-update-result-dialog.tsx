"use client"

import { DesignDialogContent } from "@/components/ui/design-dialog"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import type { SkippedTemporaryMember } from "@/types"

interface MemberBulkUpdateResultDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	createdCount: number
	skipped: SkippedTemporaryMember[]
}

export function MemberBulkUpdateResultDialog({
	open,
	onOpenChange,
	createdCount,
	skipped,
}: MemberBulkUpdateResultDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DesignDialogContent
				showDesignClose
				onClose={() => onOpenChange(false)}
				className="w-[520px] max-w-[calc(100vw-32px)] rounded-[12px] border border-black-300 px-[40px] pt-[10px] pb-[40px] shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
			>
				<div className="flex flex-col gap-[30px]">
					<div className="flex flex-col gap-[10px]">
						<DialogTitle className="text-[24px] font-medium leading-normal text-black-900">
							활동회원 명부 갱신 결과
						</DialogTitle>
						<p className="text-[14px] leading-[1.5] text-black-700">
							{createdCount}명은 반영되었고, 아래 {skipped.length}명은 제외되었습니다.
						</p>
					</div>

					<div className="max-h-[300px] overflow-y-auto rounded-[6px] border border-black-300">
						<div className="grid grid-cols-[100px_120px_1fr] bg-black-100 px-[15px] py-[10px] text-[13px] font-medium text-black-900">
							<span>이름</span>
							<span>학번</span>
							<span>제외 사유</span>
						</div>
						{skipped.map((member, index) => (
							<div
								key={`${member.student_id}-${member.name}-${index}`}
								className="grid grid-cols-[100px_120px_1fr] border-black-200 border-t px-[15px] py-[12px] text-[13px] leading-[1.4] text-black-800"
							>
								<span className="truncate" title={member.name}>
									{member.name || "-"}
								</span>
								<span className="truncate" title={member.student_id}>
									{member.student_id || "-"}
								</span>
								<span>{member.message}</span>
							</div>
						))}
					</div>

					<div className="flex justify-end">
						<DialogActionButton onClick={() => onOpenChange(false)}>확인</DialogActionButton>
					</div>
				</div>
			</DesignDialogContent>
		</Dialog>
	)
}
