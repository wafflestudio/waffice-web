"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SelectField } from "@/components/ui/select-field"
import { Toast } from "@/components/ui/toast"
import { apiClient } from "@/lib/api"
import { authClient } from "@/lib/auth"
import type { Qualification, UserDetail } from "@/types"

const STUDENT_ID_REGEX = /^\d{4}-\d{5}$/

const mypageSchema = z
	.object({
		name: z.string().min(1, "필수 입력값입니다."),
		generation: z
			.string()
			.min(1, "필수 입력값입니다.")
			.regex(/^\d+(\.\d+)?$/, "기수는 숫자 형식으로 입력해 주세요. (예: 22, 22.5)"),
		email: z.string().email("이메일 형식이 올바르지 않습니다."),
		enrollmentStatus: z.enum(["학부생", "대학원생", "휴학생", "졸업생"]),
		studentId: z.string().optional(),
		major: z.string().optional(),
		linkedInUrl: z.string().optional(),
		githubId: z.string().optional(),
		phone: z.string().optional(),
		contactEmail: z.string().email("이메일 형식이 올바르지 않습니다.").optional().or(z.literal("")),
		smsNotification: z.boolean(),
		emailNotification: z.boolean(),
	})
	.superRefine((data, ctx) => {
		if (data.enrollmentStatus === "학부생") {
			const studentId = (data.studentId ?? "").trim()
			if (!studentId) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["studentId"],
					message: "필수 입력값입니다.",
				})
			} else if (!STUDENT_ID_REGEX.test(studentId)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["studentId"],
					message: "학번은 YYYY-XXXXX 형식이어야 합니다.",
				})
			}

			if (!(data.major ?? "").trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["major"],
					message: "필수 입력값입니다.",
				})
			}
		}
	})

type MypageFormValues = z.infer<typeof mypageSchema>

const ENROLLMENT_OPTIONS = ["학부생", "대학원생", "졸업생"] as const

const qualificationToKorean = (qualification: Qualification): string => {
	switch (qualification) {
		case "active":
			return "활동회원"
		case "regular":
			return "정회원"
		case "associate":
			return "준회원"
		case "pending":
			return "승인대기"
		default:
			return "미가입"
	}
}

const fieldClass =
	"h-[40px] w-full rounded-[5px] border-black-300 bg-white px-[16px] text-[14px] font-normal text-black-900 shadow-none outline-none placeholder:text-black-500 focus-visible:border-peach-300 focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-black-100 disabled:text-black-900 disabled:opacity-100 xl:w-[360px]"

const inactiveFieldClass =
	"h-[40px] w-full rounded-[5px] border-black-300 bg-black-100 px-[16px] text-[14px] font-normal text-black-900 shadow-none outline-none placeholder:text-black-500 focus-visible:ring-0 xl:w-[360px]"

const smallFieldClass =
	"h-[40px] min-w-0 flex-1 rounded-[5px] border-black-300 bg-black-100 px-[16px] text-[14px] font-normal text-black-900 shadow-none outline-none xl:w-[175px] xl:flex-none"

const getLinkedInUrl = (websites: UserDetail["websites"]) =>
	websites?.find((website) => website.type.toLowerCase() === "linkedin")?.url ?? ""

const buildWebsites = (websites: UserDetail["websites"] | undefined, linkedInUrl: string) => {
	const nextWebsites =
		websites?.filter((website) => website.type.toLowerCase() !== "linkedin") ?? []
	const trimmedUrl = linkedInUrl.trim()

	if (trimmedUrl) {
		nextWebsites.push({
			type: "linkedin",
			url: trimmedUrl,
		})
	}

	return nextWebsites.length > 0 ? nextWebsites : null
}

const toNotificationChannel = (sms: boolean, email: boolean) => {
	if (sms && email) return "both"
	if (sms) return "sms"
	if (email) return "email"
	return null
}

const formatCreatedAt = (createdAt?: number) => {
	if (!createdAt) return ""
	const date = new Date(createdAt * 1000)

	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
		date.getDate(),
	).padStart(2, "0")}`
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="relative flex min-h-[60px] w-full items-center py-[10px] pl-[120px] xl:w-[500px] xl:pl-[140px]">
			<div className="absolute left-0 top-1/2 w-[110px] -translate-y-1/2 text-[14px] font-medium tracking-[-0.28px] text-black-900 xl:w-auto">
				{label}
			</div>
			{children}
		</div>
	)
}

export default function MyPage() {
	const router = useRouter()
	const [user, setUser] = useState<UserDetail | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [showToast, setShowToast] = useState(false)
	const [toastMessage, setToastMessage] = useState("")

	const form = useForm<MypageFormValues>({
		resolver: zodResolver(mypageSchema),
		defaultValues: {
			name: "",
			generation: "",
			email: "",
			enrollmentStatus: "학부생",
			studentId: "",
			major: "",
			linkedInUrl: "",
			githubId: "",
			phone: "",
			contactEmail: "",
			smsNotification: false,
			emailNotification: false,
		},
	})

	const enrollmentStatus = form.watch("enrollmentStatus")
	const isStudent = enrollmentStatus === "학부생"

	// 사용자 정보 불러오기
	useEffect(() => {
		const fetchUser = async () => {
			try {
				setIsLoading(true)
				const response = await authClient.getMe()
				if (response.ok && response.data?.user) {
					const userData = response.data.user
					setUser(userData)

					// bio에서 추가 정보 추출 (형식: "23.5기 - 2021-12345" 또는 "23.5기 - 직책")
					let studentId = ""
					if (userData.bio) {
						const bioMatch = userData.bio.match(/^\d+(\.\d+)?기 - (.+)$/)
						if (bioMatch) {
							const extractedValue = bioMatch[2]
							if (STUDENT_ID_REGEX.test(extractedValue)) {
								studentId = extractedValue
							}
						}
					}

					const notificationChannel = userData.notification_channel

					form.reset({
						name: userData.name || "",
						generation: userData.generation || "",
						email: userData.email || "",
						enrollmentStatus: userData.graduation_status || "학부생",
						studentId: userData.student_id || studentId,
						major: userData.department || userData.affiliation || "",
						linkedInUrl: getLinkedInUrl(userData.websites),
						githubId: userData.github_username || "",
						phone: userData.phone || "",
						contactEmail: userData.contact_email || "",
						smsNotification: notificationChannel === "sms" || notificationChannel === "both",
						emailNotification: notificationChannel === "email" || notificationChannel === "both",
					})
				} else {
					setError("사용자 정보를 불러오는데 실패했습니다.")
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "사용자 정보를 불러오는데 실패했습니다.")
			} finally {
				setIsLoading(false)
			}
		}

		fetchUser()
	}, [form])

	const onSubmit = async (data: MypageFormValues) => {
		setIsSubmitting(true)
		setError(null)

		try {
			// API 스펙에 맞춰 프로필 업데이트 요청
			const websites = buildWebsites(user?.websites, data.linkedInUrl || "")

			const response = await apiClient.updateMyProfile({
				name: data.name,
				phone: data.phone || null,
				affiliation: data.major || null,
				bio: isStudent ? `${data.generation}기 - ${data.studentId}` : null,
				github_username: data.githubId || null,
				websites,
				graduation_status: data.enrollmentStatus,
				student_id: data.studentId || null,
				department: data.major || null,
				contact_email: data.contactEmail || null,
				notification_channel: toNotificationChannel(data.smsNotification, data.emailNotification),
			})

			if (response.ok) {
				setToastMessage("프로필이 성공적으로 업데이트되었습니다.")
				setShowToast(true)
				if (response.data) {
					setUser(response.data)
				}
			} else {
				setToastMessage(response.message || "프로필 업데이트에 실패했습니다.")
				setShowToast(true)
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "프로필 업데이트에 실패했습니다."
			setToastMessage(message)
			setShowToast(true)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleCancel = () => {
		router.back()
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	if (error && !user) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen space-y-4">
				<p className="text-destructive">{error}</p>
				<Button onClick={() => window.location.reload()}>다시 시도</Button>
			</div>
		)
	}

	const createdAt = formatCreatedAt(user?.created_at)

	return (
		<div className="flex w-full flex-col items-center">
			<div className="flex w-full max-w-[1162px] flex-col gap-[40px]">
				<h1 className="text-[28px] font-medium leading-normal text-black-900">마이페이지</h1>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-[30px]">
						<div className="flex items-center gap-[30px]">
							<div className="flex size-[100px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-black-300 text-white">
								{user?.avatar_url ? (
									<div
										aria-label={`${user.name} 프로필`}
										className="size-full bg-cover bg-center"
										role="img"
										style={{ backgroundImage: `url(${user.avatar_url})` }}
									/>
								) : (
									<UserRound className="size-[48px]" strokeWidth={1.8} />
								)}
							</div>
							<div className="flex flex-col gap-[10px]">
								<div className="flex w-[157px] flex-col gap-[6px]">
									<p className="text-[18px] font-medium leading-normal text-black-900">
										{user?.name || form.watch("name")}
									</p>
									<p className="text-[14px] font-normal leading-normal text-black-500">
										{user?.email || form.watch("email")}
									</p>
								</div>
								<button
									type="button"
									className="flex h-[28px] w-fit items-center justify-center rounded-[4px] border border-black-300 bg-white px-[14px] py-[4px] text-[12px] font-medium leading-[24px] text-black-900"
								>
									연동 계정 변경
								</button>
							</div>
						</div>

						<div className="flex w-full flex-col gap-[15px]">
							<div className="grid w-full grid-cols-1 items-start gap-y-[10px] pt-[10px] xl:grid-cols-[500px_500px] xl:justify-between xl:gap-y-0">
								<div className="flex flex-col">
									<FieldRow label="이름">
										<Input
											aria-disabled
											readOnly
											placeholder="홍길동"
											className={inactiveFieldClass}
											{...form.register("name")}
										/>
									</FieldRow>
									<FieldRow label="자격">
										<Input
											aria-disabled
											readOnly
											value={user ? qualificationToKorean(user.qualification) : ""}
											className={inactiveFieldClass}
										/>
									</FieldRow>
									<FieldRow label="기수">
										<Input
											aria-disabled
											readOnly
											placeholder="26"
											className={inactiveFieldClass}
											{...form.register("generation")}
										/>
									</FieldRow>
									<FieldRow label="접근 권한">
										<Input
											aria-disabled
											readOnly
											value={user?.is_admin ? "운영진" : "회원"}
											className={inactiveFieldClass}
										/>
									</FieldRow>
									<FieldRow label="학번 · 학과">
										<div className="flex gap-[10px]">
											<Input
												aria-disabled
												readOnly
												placeholder="2025-12345"
												className={smallFieldClass}
												{...form.register("studentId")}
											/>
											<Input
												aria-disabled
												readOnly
												placeholder="컴퓨터공학부"
												className={smallFieldClass}
												{...form.register("major")}
											/>
										</div>
									</FieldRow>
									<FieldRow label="계정 생성일">
										<Input
											aria-disabled
											readOnly
											value={createdAt}
											className={inactiveFieldClass}
										/>
									</FieldRow>
								</div>

								<div className="flex flex-col">
									<FieldRow label="재학여부">
										<FormField
											control={form.control}
											name="enrollmentStatus"
											render={({ field }) => (
												<SelectField
													value={field.value}
													options={ENROLLMENT_OPTIONS}
													onChange={field.onChange}
													triggerClassName={fieldClass}
													contentClassName="w-[360px]"
													itemClassName="h-[50px] px-[16px] text-[15px]"
												/>
											)}
										/>
									</FieldRow>
									<FieldRow label="링크드인 링크">
										<Input
											placeholder="URL을 입력해주세요"
											className={fieldClass}
											{...form.register("linkedInUrl")}
										/>
									</FieldRow>
									<FieldRow label="전화번호">
										<Input
											placeholder="전화번호를 입력해주세요."
											className={fieldClass}
											{...form.register("phone")}
										/>
									</FieldRow>
									<FieldRow label="Github 아이디">
										<Input
											placeholder="waffice@gmail.com"
											className={fieldClass}
											{...form.register("githubId")}
										/>
									</FieldRow>
									<FieldRow label="소식 수신용 이메일">
										<Input
											type="email"
											placeholder="example@gmail.com"
											className={fieldClass}
											{...form.register("contactEmail")}
										/>
									</FieldRow>
									<FieldRow label="동문회원 소식 수신">
										<div className="flex items-center gap-[30px]">
											<FormField
												control={form.control}
												name="smsNotification"
												render={({ field }) => (
													<FormItem className="flex items-center gap-[16px] space-y-0">
														<FormControl>
															<Checkbox
																checked={field.value}
																onCheckedChange={field.onChange}
																className="size-[16px] rounded-[4px] border-black-500 data-[state=checked]:border-peach-300 data-[state=checked]:bg-peach-300"
															/>
														</FormControl>
														<FormLabel className="cursor-pointer text-[14px] font-normal tracking-[-0.28px] text-black-700">
															SMS
														</FormLabel>
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="emailNotification"
												render={({ field }) => (
													<FormItem className="flex items-center gap-[16px] space-y-0">
														<FormControl>
															<Checkbox
																checked={field.value}
																onCheckedChange={field.onChange}
																className="size-[16px] rounded-[4px] border-black-500 data-[state=checked]:border-peach-300 data-[state=checked]:bg-peach-300"
															/>
														</FormControl>
														<FormLabel className="cursor-pointer text-[14px] font-normal tracking-[-0.28px] text-black-700">
															Email
														</FormLabel>
													</FormItem>
												)}
											/>
										</div>
									</FieldRow>
								</div>
							</div>
						</div>

						<div className="flex w-full justify-end">
							<div className="flex h-[50px] items-center gap-[10px]">
								<button
									type="button"
									onClick={handleCancel}
									className="flex h-[50px] w-[121px] items-center justify-center rounded-[4px] border border-black-300 bg-white text-[15px] font-semibold leading-[24px] text-black-900 hover:bg-black-100"
								>
									취소
								</button>
								<button
									type="submit"
									disabled={isSubmitting}
									className="flex h-[50px] w-[121px] items-center justify-center rounded-[4px] bg-peach-300 text-[15px] font-semibold leading-[24px] text-white hover:bg-peach-500 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{isSubmitting ? <Loader2 className="size-[18px] animate-spin" /> : "확인"}
								</button>
							</div>
						</div>
					</form>
				</Form>

				<Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
			</div>
		</div>
	)
}
