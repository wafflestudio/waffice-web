"use client"

import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuFilterRadioItem,
	DropdownMenuRadioGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface CalendarProps {
	value: string
	onChange: (value: string) => void
	className?: string
}

interface CalendarDateFieldProps {
	value: string
	onChange: (value: string) => void
	open?: boolean
	onOpenChange?: (open: boolean) => void
	className?: string
	popoverClassName?: string
}

function Calendar({ value, onChange, className }: CalendarProps) {
	const initialDate = useMemo(() => {
		const normalized = value.replaceAll(".", "-")
		const date = new Date(normalized)
		return Number.isNaN(date.getTime()) ? new Date(2026, 4, 7) : date
	}, [value])
	const [year, setYear] = useState(initialDate.getFullYear())
	const [month, setMonth] = useState(initialDate.getMonth() + 1)
	const [selectedDay, setSelectedDay] = useState(initialDate.getDate())

	const daysInMonth = new Date(year, month, 0).getDate()
	// 그리드가 월요일 시작이므로 JS의 일요일(0) 기준 요일을 월요일(0)~일요일(6) 기준으로 옮긴다.
	const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7
	const years = Array.from({ length: 11 }, (_, index) => 2026 - index)
	const months = Array.from({ length: 12 }, (_, index) => index + 1)

	const selectDay = (day: number) => {
		setSelectedDay(day)
		onChange(`${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`)
	}

	return (
		<div
			className={cn(
				"w-[360px] rounded-[12px] border border-[#ebebeb] bg-white px-[45px] py-[35px] shadow-[0px_4px_16px_rgba(170,170,170,0.03)]",
				className,
			)}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-[24px]">
					<CalendarSelect
						value={`${year}년`}
						options={years.map((item) => `${item}년`)}
						onSelect={(next) => setYear(Number.parseInt(next, 10))}
					/>
					<CalendarSelect
						value={`${month}월`}
						options={months.map((item) => `${item}월`)}
						onSelect={(next) => setMonth(Number.parseInt(next, 10))}
					/>
				</div>
				<div className="flex items-center gap-[14px] text-black-800">
					<button type="button" onClick={() => setMonth(month === 1 ? 12 : month - 1)}>
						<ChevronLeft className="size-[16px]" />
					</button>
					<button type="button" onClick={() => setMonth(month === 12 ? 1 : month + 1)}>
						<ChevronRight className="size-[16px]" />
					</button>
				</div>
			</div>
			<div className="mt-[40px] grid grid-cols-7 gap-x-[15px] gap-y-[23px] text-center">
				{["월", "화", "수", "목", "금", "토", "일"].map((day) => (
					<div key={day} className="text-[16px] font-medium text-black-900">
						{day}
					</div>
				))}
				{Array.from({ length: firstWeekday }, (_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: 위치만 채우는 빈 칸이라 값이 없다
					<div key={`leading-${index}`} />
				))}
				{Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => (
					<button
						type="button"
						key={day}
						onClick={() => selectDay(day)}
						className={cn(
							"flex size-[30px] items-center justify-center rounded-full text-[16px] font-medium text-black-600",
							selectedDay === day && "bg-peach-300 text-white",
						)}
					>
						{day}
					</button>
				))}
			</div>
		</div>
	)
}

function CalendarDateField({
	value,
	onChange,
	open,
	onOpenChange,
	className,
	popoverClassName,
}: CalendarDateFieldProps) {
	const [internalOpen, setInternalOpen] = useState(false)
	const isOpen = open ?? internalOpen

	const setOpen = (nextOpen: boolean) => {
		onOpenChange?.(nextOpen)
		if (open === undefined) {
			setInternalOpen(nextOpen)
		}
	}

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen(!isOpen)}
				className={cn(
					"flex h-[36px] w-[150px] items-center justify-between rounded-[5px] border border-black-300 bg-white px-[10px] text-[13px] text-black-700 focus-visible:border-peach-300",
					className,
				)}
			>
				<span>{value}</span>
				<CalendarDays className="size-[16px] text-black-600" />
			</button>
			{isOpen && (
				<div className={cn("absolute top-[44px] right-0 z-[70]", popoverClassName)}>
					<Calendar
						value={value}
						onChange={(nextValue) => {
							onChange(nextValue)
							setOpen(false)
						}}
					/>
				</div>
			)}
		</div>
	)
}

function CalendarSelect({
	value,
	options,
	onSelect,
}: {
	value: string
	options: string[]
	onSelect: (value: string) => void
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-[10px] text-[20px] font-semibold text-black-900"
				>
					{value}
					<ChevronDown className="size-[16px]" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="max-h-[300px] min-w-[112px] rounded-[6px] border-black-300 p-[5px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
			>
				<DropdownMenuRadioGroup value={value} onValueChange={onSelect}>
					{options.map((option) => (
						<DropdownMenuFilterRadioItem key={option} value={option}>
							{option}
						</DropdownMenuFilterRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export { Calendar, CalendarDateField }
export type { CalendarDateFieldProps, CalendarProps }
