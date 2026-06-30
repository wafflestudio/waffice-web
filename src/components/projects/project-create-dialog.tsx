"use client"

import { ChevronDown, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterRadioItem,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ProjectCreateFormValues } from "@/types"
import { PROJECT_STATUS_OPTIONS } from "./project-status-filter"

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

function ProjectCreateStatusSelect({
	value,
	onChange,
}: {
	value: ProjectCreateFormValues["status"]
	onChange: (value: ProjectCreateFormValues["status"]) => void
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex h-[50px] w-[360px] items-center justify-between rounded-[5px] border border-black-300 bg-white p-[16px] text-[15px] font-normal tracking-[-0.3px] text-black-600 outline-none hover:border-black-300 focus-visible:border-peach-300"
				>
					<span>{value || "선택"}</span>
					<ChevronDown className="size-[24px] text-black-600" strokeWidth={1.8} />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-[360px] rounded-[5px] border-black-300 p-0 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
			>
				<DropdownMenuRadioGroup
					value={value}
					onValueChange={(nextValue) => onChange(nextValue as ProjectCreateFormValues["status"])}
				>
					{PROJECT_STATUS_OPTIONS.map((status) => (
						<DropdownMenuFilterRadioItem
							key={status}
							value={status}
							className="h-[50px] px-[16px] text-[15px]"
						>
							{status}
						</DropdownMenuFilterRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
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
			<DialogContent
				className="w-[460px] max-w-[calc(100vw-32px)] gap-0 rounded-[12px] border border-black-300 bg-white px-[50px] pt-[10px] pb-[40px] shadow-none"
				showCloseButton={false}
			>
				<button
					type="button"
					aria-label="닫기"
					onClick={() => onOpenChange(false)}
					className="ml-auto flex size-[35px] items-center justify-center text-black-800 hover:text-black-900"
				>
					<X className="size-[28px]" strokeWidth={2.4} />
				</button>
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
								<ProjectCreateStatusSelect
									value={values.status}
									onChange={(status) => setValues((prev) => ({ ...prev, status }))}
								/>
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
							<button
								type="button"
								onClick={() => onOpenChange(false)}
								className="flex h-[50px] w-[121px] items-center justify-center rounded-[4px] border border-black-300 bg-white text-[15px] font-semibold leading-[24px] text-black-900 hover:bg-black-100"
							>
								취소
							</button>
							<button
								type="submit"
								className="flex h-[50px] w-[121px] items-center justify-center rounded-[4px] bg-peach-300 text-[15px] font-semibold leading-[24px] text-white hover:bg-peach-500"
							>
								확인
							</button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	)
}
