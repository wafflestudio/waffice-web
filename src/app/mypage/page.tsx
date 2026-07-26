"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Camera, Loader2, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { type ChangeEvent, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SelectField } from "@/components/ui/select-field"
import { Toast } from "@/components/ui/toast"
import { useGoogleRelink } from "@/hooks/use-google-relink"
import { apiClient } from "@/lib/api"
import type { Qualification, UserDetail } from "@/types"

const STUDENT_ID_REGEX = /^\d{4}-\d{5}$/
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024

const mypageSchema = z.object({
	name: z.string().optional(),
	generation: z.string().optional(),
	email: z.string().optional(),
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
			return "가입 대기"
		default:
			return "가입 대기"
	}
}

const userRoleFlagsToKorean = (
	user?: Pick<UserDetail, "is_leader" | "is_admin" | "is_president"> | null,
): string => {
	if (!user) return ""

	const roles = [
		...(user.is_president ? ["와장"] : []),
		...(user.is_admin ? ["운영진"] : []),
		...(user.is_leader ? ["팀장"] : []),
	]

	return roles.length > 0 ? roles.join(", ") : "정회원"
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

const getRelinkErrorMessage = (message: string) => {
	if (message.includes("GOOGLE_ACCOUNT_ALREADY_LINKED")) {
		return "이미 다른 회원에게 연동된 Google 계정입니다."
	}

	if (message.includes("EMAIL_ALREADY_IN_USE")) {
		return "이미 다른 회원이 사용 중인 이메일입니다."
	}

	if (message.includes("INVALID_AUTH_TOKEN")) {
		return "Google 인증 정보가 유효하지 않습니다. 다시 시도해주세요."
	}

	return message || "연동 계정 변경에 실패했습니다."
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

function ProfileUpdateSuccessDialog({
	open,
	onOpenChange,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="flex w-[360px] max-w-[calc(100%-32px)] flex-col items-start overflow-hidden rounded-[12px] border-black-300 bg-white px-[40px] pb-[26px] pt-[30px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.06)] sm:max-w-[360px]"
			>
				<div className="flex w-full flex-col items-end gap-[40px]">
					<DialogTitle className="w-full text-[15px] font-medium leading-[1.4] text-black-900">
						성공적으로 변경이 완료되었습니다.
					</DialogTitle>
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="flex h-[40px] items-center justify-center rounded-[4px] bg-peach-300 px-[30px] py-[8px] text-[15px] font-medium leading-[24px] text-white hover:bg-peach-500"
					>
						확인
					</button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default function MyPage() {
	const router = useRouter()
	const { user: authUser, isLoading: isAuthLoading, setUser: setAuthUser } = useAuth()
	const [user, setUser] = useState<UserDetail | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [showToast, setShowToast] = useState(false)
	const [toastMessage, setToastMessage] = useState("")
	const [showSuccessDialog, setShowSuccessDialog] = useState(false)
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
	const profileImageInputRef = useRef<HTMLInputElement>(null)

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

	const { openRelinkPopup, isLoading: isRelinking } = useGoogleRelink({
		onSuccess: (result) => {
			setUser(result.user)
			setAuthUser(result.user)
			form.setValue("email", result.user.email ?? "")
			setToastMessage("연동 계정이 변경되었습니다.")
			setShowToast(true)
		},
		onError: (message) => {
			setToastMessage(getRelinkErrorMessage(message))
			setShowToast(true)
		},
	})

	useEffect(() => {
		if (isAuthLoading) return

		if (!authUser) {
			setError("사용자 정보를 불러오는데 실패했습니다.")
			return
		}

		setUser(authUser)
		setError(null)

		let studentId = ""
		if (authUser.bio) {
			const bioMatch = authUser.bio.match(/^\d+(\.\d+)?기 - (.+)$/)
			if (bioMatch) {
				const extractedValue = bioMatch[2]
				if (STUDENT_ID_REGEX.test(extractedValue)) {
					studentId = extractedValue
				}
			}
		}

		const notificationChannel = authUser.notification_channel

		form.reset({
			name: authUser.name || "",
			generation: authUser.generation || "",
			email: authUser.email || "",
			enrollmentStatus: authUser.graduation_status || "학부생",
			studentId: authUser.student_id || studentId,
			major: authUser.department || authUser.affiliation || "",
			linkedInUrl: getLinkedInUrl(authUser.websites),
			githubId: authUser.github_username || "",
			phone: authUser.phone || "",
			contactEmail: authUser.contact_email || "",
			smsNotification: notificationChannel === "sms" || notificationChannel === "both",
			emailNotification: notificationChannel === "email" || notificationChannel === "both",
		})
	}, [authUser, form, isAuthLoading])

	const onSubmit = async (data: MypageFormValues) => {
		setIsSubmitting(true)
		setError(null)

		try {
			// API 스펙에 맞춰 프로필 업데이트 요청
			const websites = buildWebsites(user?.websites, data.linkedInUrl || "")

			const response = await apiClient.updateMyProfile({
				phone: data.phone || null,
				github_username: data.githubId || null,
				websites,
				graduation_status: data.enrollmentStatus,
				contact_email: data.contactEmail || null,
				notification_channel: toNotificationChannel(data.smsNotification, data.emailNotification),
			})

			if (response.ok) {
				setShowSuccessDialog(true)
				if (response.data) {
					setUser(response.data)
					setAuthUser(response.data)
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

	const handleProfileImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		event.target.value = ""

		if (!file) return

		if (!file.type.startsWith("image/")) {
			setToastMessage("이미지 파일만 선택할 수 있습니다.")
			setShowToast(true)
			return
		}

		if (file.size > MAX_PROFILE_IMAGE_SIZE) {
			setToastMessage("프로필 이미지는 5MB 이하만 업로드할 수 있습니다.")
			setShowToast(true)
			return
		}

		setIsUploadingAvatar(true)
		setShowToast(false)

		try {
			const profileResponse = await apiClient.uploadProfileImage(file)

			if (!profileResponse.ok || !profileResponse.data) {
				throw new Error(profileResponse.message || "프로필 이미지 변경에 실패했습니다.")
			}

			setUser(profileResponse.data)
			setAuthUser(profileResponse.data)
			setToastMessage("프로필 이미지가 변경되었습니다.")
			setShowToast(true)
		} catch (err) {
			setToastMessage(err instanceof Error ? err.message : "프로필 이미지 변경에 실패했습니다.")
			setShowToast(true)
		} finally {
			setIsUploadingAvatar(false)
		}
	}

	const handleCancel = () => {
		router.back()
	}

	if (isAuthLoading) {
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
		<div className="flex w-full flex-col items-start">
			<div className="flex w-full max-w-[1140px] flex-col gap-[40px]">
				<h1 className="text-[28px] font-medium leading-normal text-black-900">마이페이지</h1>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-[30px]">
						<div className="flex items-center gap-[30px]">
							<input
								ref={profileImageInputRef}
								type="file"
								accept="image/*"
								onChange={handleProfileImageChange}
								className="sr-only"
								aria-label="프로필 이미지 파일 선택"
							/>
							<button
								type="button"
								onClick={() => profileImageInputRef.current?.click()}
								disabled={isUploadingAvatar}
								aria-label="프로필 이미지 변경"
								className="group relative flex size-[100px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-black-300 text-white outline-none focus-visible:ring-2 focus-visible:ring-peach-500 focus-visible:ring-offset-2 disabled:cursor-wait"
							>
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
								<span className="absolute inset-0 flex items-center justify-center bg-black-900/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-disabled:opacity-100">
									{isUploadingAvatar ? (
										<Loader2 className="size-[24px] animate-spin" />
									) : (
										<Camera className="size-[24px]" strokeWidth={1.8} />
									)}
								</span>
							</button>
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
									onClick={openRelinkPopup}
									disabled={isRelinking}
									className="flex h-[28px] w-fit items-center justify-center rounded-[4px] border border-black-300 bg-white px-[14px] py-[4px] text-[12px] font-medium leading-[24px] text-black-900"
								>
									{isRelinking ? (
										<Loader2 className="size-[14px] animate-spin" />
									) : (
										"연동 계정 변경"
									)}
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
											value={userRoleFlagsToKorean(user)}
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
								<DialogActionButton variant="cancel" onClick={handleCancel}>
									취소
								</DialogActionButton>
								<DialogActionButton type="submit" disabled={isSubmitting}>
									{isSubmitting ? <Loader2 className="size-[18px] animate-spin" /> : "확인"}
								</DialogActionButton>
							</div>
						</div>
					</form>
				</Form>

				<Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
				<ProfileUpdateSuccessDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog} />
			</div>
		</div>
	)
}
