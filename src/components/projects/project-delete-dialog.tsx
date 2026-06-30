"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
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
			<DialogContent
				className="w-[360px] max-w-[360px] gap-0 rounded-[12px] border border-black-300 bg-white px-[40px] pt-[30px] pb-[26px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.06)]"
				showCloseButton={false}
			>
				<DialogTitle className="sr-only">프로젝트 삭제</DialogTitle>
				<p className="text-[15px] font-medium leading-[1.4] text-black-900">
					{project
						? `${project.name} 프로젝트를 삭제하시겠습니까?`
						: "프로젝트를 삭제하시겠습니까?"}
				</p>
				<div className="mt-[40px] flex justify-end gap-[10px]">
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="flex h-[40px] items-center justify-center rounded-[4px] border border-black-500 bg-white px-[30px] text-[15px] font-semibold leading-[24px] text-black-900 hover:bg-black-100"
					>
						취소
					</button>
					<button
						type="button"
						onClick={handleConfirm}
						className="flex h-[40px] items-center justify-center rounded-[4px] bg-peach-300 px-[30px] text-[15px] font-semibold leading-[24px] text-white hover:bg-peach-500"
					>
						확인
					</button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
