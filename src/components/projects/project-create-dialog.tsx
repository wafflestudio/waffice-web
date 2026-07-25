"use client"

import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { DesignDialogContent } from "@/components/ui/design-dialog"
import { Dialog, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterRadioItem,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ProjectCreateFormValues, ProjectStatus } from "@/types"

interface ProjectCreateDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (values: ProjectCreateFormValues) => void
}

const initialValues: ProjectCreateFormValues = {
	name: "",
	status: "",
	description: "",
}

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
	active: "활성화",
	maintenance: "유지보수",
	ended: "종결",
}

const PROJECT_CREATE_STATUS_OPTIONS = ["active", "maintenance", "ended"] satisfies ProjectStatus[]

const fieldClass =
	"h-[50px] w-[360px] rounded-[5px] border-black-300 bg-white px-[15px] text-[14px] font-normal tracking-[-0.28px] text-black-900 shadow-none outline-none placeholder:text-black-600 focus-visible:border-peach-300 focus-visible:ring-0"

function ProjectCreateField({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex w-[360px] flex-col gap-[10px]">
			<span className="text-[15px] font-medium leading-normal text-black-900">{label}</span>
			{children}
		</div>
	)
}

export function ProjectCreateDialog({ open, onOpenChange, onSubmit }: ProjectCreateDialogProps) {
	const [values, setValues] = useState<ProjectCreateFormValues>(initialValues)

	useEffect(() => {
		if (!open) {
			setValues(initialValues)
		}
	}, [open])

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!values.status) return

		// TODO(API): 프로젝트 생성 API 스펙 확정 후 ProjectCreateFormValues를 요청 DTO에 맞춰 매핑.
		onSubmit(values)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DesignDialogContent
				className="w-[460px] max-w-[calc(100vw-32px)] rounded-[12px] border border-black-300 px-[50px] pt-[10px] pb-[40px] shadow-none"
				showDesignClose
				onClose={() => onOpenChange(false)}
			>
				<div className="mt-[10px] flex flex-col gap-[50px]">
					<DialogTitle className="text-[24px] font-medium leading-normal text-black-900">
						새 프로젝트 생성
					</DialogTitle>
					<form onSubmit={handleSubmit} className="flex flex-col items-end gap-[40px]">
						<div className="flex flex-col gap-[40px]">
							<ProjectCreateField label="새 프로젝트 이름">
								<Input
									required
									value={values.name}
									onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
									placeholder="프로젝트 이름을 입력해 주세요."
									className={fieldClass}
								/>
							</ProjectCreateField>
							<ProjectCreateField label="운영 상태">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<button
											type="button"
											className={cn(
												fieldClass,
												"flex items-center justify-between",
												!values.status && "text-black-600",
											)}
										>
											<span>{values.status ? PROJECT_STATUS_LABEL[values.status] : "선택"}</span>
											<ChevronDown className="ml-[10px] size-[20px] text-black-900" />
										</button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="start"
										className="w-[360px] rounded-[5px] border-black-300 p-0 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
									>
										<DropdownMenuRadioGroup
											value={values.status}
											onValueChange={(status) =>
												setValues((prev) => ({ ...prev, status: status as ProjectStatus }))
											}
										>
											{PROJECT_CREATE_STATUS_OPTIONS.map((status) => (
												<DropdownMenuFilterRadioItem
													key={status}
													value={status}
													className="h-[50px] px-[16px] text-[15px]"
												>
													{PROJECT_STATUS_LABEL[status]}
												</DropdownMenuFilterRadioItem>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</ProjectCreateField>
							<ProjectCreateField label="설명">
								<Textarea
									value={values.description}
									onChange={(event) =>
										setValues((prev) => ({ ...prev, description: event.target.value }))
									}
									placeholder="설명을 입력해 주세요."
									className="h-[90px] min-h-[90px] w-[360px] resize-none rounded-[5px] border-black-300 bg-white p-[16px] text-[14px] font-normal tracking-[-0.28px] text-black-900 shadow-none outline-none placeholder:text-black-600 focus-visible:border-peach-300 focus-visible:ring-0"
								/>
							</ProjectCreateField>
						</div>
						<div className="flex h-[50px] items-center gap-[10px]">
							<DialogActionButton variant="cancel" onClick={() => onOpenChange(false)}>
								취소
							</DialogActionButton>
							<DialogActionButton type="submit">확인</DialogActionButton>
						</div>
					</form>
				</div>
			</DesignDialogContent>
		</Dialog>
	)
}
