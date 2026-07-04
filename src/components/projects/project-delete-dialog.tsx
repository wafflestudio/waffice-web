"use client"

import { DesignDialogContent } from "@/components/ui/design-dialog"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import type { ProjectManagementRow } from "@/types"

interface ProjectDeleteDialogProps {
	project: ProjectManagementRow | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: (project: ProjectManagementRow) => void
}

export function ProjectDeleteDialog({
	project,
	open,
	onOpenChange,
	onConfirm,
}: ProjectDeleteDialogProps) {
	const handleConfirm = () => {
		if (!project) return
		onConfirm(project)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DesignDialogContent className="w-[360px] max-w-[360px] rounded-[12px] border border-black-300 px-[40px] pt-[30px] pb-[26px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.06)]">
				<DialogTitle className="sr-only">프로젝트 삭제</DialogTitle>
				<p className="text-[15px] font-medium leading-[1.4] text-black-900">
					{project
						? `${project.name} 프로젝트를 삭제하시겠습니까?`
						: "프로젝트를 삭제하시겠습니까?"}
				</p>
				<div className="mt-[40px] flex justify-end gap-[10px]">
					<DialogActionButton variant="cancel" size="sm" onClick={() => onOpenChange(false)}>
						취소
					</DialogActionButton>
					<DialogActionButton size="sm" onClick={handleConfirm}>
						확인
					</DialogActionButton>
				</div>
			</DesignDialogContent>
		</Dialog>
	)
}
