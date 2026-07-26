"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Logo } from "@/components/auth/logo"
import { SignupErrorToast } from "@/components/auth/signup-error-toast"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { authClient } from "@/lib/auth"
import { cn } from "@/lib/utils"

const TERMS_URL = "https://app.notion.com/p/22870e37e9c780728b2cc86f0adaa593?source=copy_link"
const PRIVACY_POLICY_URL =
	"https://app.notion.com/p/WAFFICE-3a970e37e9c780418298cf4c252c370c?source=copy_link"

const signupSchema = z.object({
	name: z.string().min(1, "이름을 입력해 주세요."),
	generation: z
		.string()
		.min(1, "기수를 입력해 주세요.")
		.regex(/^\d+(\.\d+)?$/, "기수는 숫자 형식으로 입력해 주세요. (예: 22, 22.5)"),
	studentId: z.string().min(1, "학번을 입력해 주세요."),
	affiliation: z.string().min(1, "소속을 입력해 주세요."),
	email: z.string().min(1, "이메일을 입력해 주세요.").email("이메일을 확인해주세요."),
	phone: z.string().min(1, "연락처를 입력해 주세요."),
	qualification: z.enum(["준회원", "정회원", "활동회원"], {
		error: "자격을 선택해 주세요.",
	}),
	graduationStatus: z.enum(["학부생", "졸업생", "대학원생"], {
		error: "재학여부를 선택해 주세요.",
	}),
	termsPersonalInfo: z.boolean().refine((value) => value, {
		message: "꼭 동의해야하는 항목이에요.",
	}),
	termsWaffleStudio: z.boolean().refine((value) => value, {
		message: "꼭 동의해야하는 항목이에요.",
	}),
	termsEmail: z.boolean(),
	termsSms: z.boolean(),
})

type SignupFormValues = z.infer<typeof signupSchema>

const QUALIFICATION_TO_API: Record<
	SignupFormValues["qualification"],
	"associate" | "regular" | "active"
> = {
	준회원: "associate",
	정회원: "regular",
	활동회원: "active",
}

function RequiredLabel({ label }: { label: string }) {
	return (
		<div className="flex items-center">
			<span className="text-[15px] font-medium text-[#121212]">{label}</span>
			<span className="text-[17px] font-medium text-red-500">*</span>
		</div>
	)
}

export default function SignupPage() {
	const router = useRouter()
	const [authToken, setAuthToken] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [termsError, setTermsError] = useState<string | null>(null)
	const hasProcessedToken = useRef(false)

	useEffect(() => {
		if (hasProcessedToken.current) return

		const token = sessionStorage.getItem("auth_token")
		if (!token) {
			router.replace("/login")
			return
		}

		hasProcessedToken.current = true
		setAuthToken(token)
		sessionStorage.removeItem("auth_token")
		setIsLoading(false)
	}, [router])

	const form = useForm<SignupFormValues>({
		resolver: zodResolver(signupSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
			generation: "",
			studentId: "",
			affiliation: "",
			email: "",
			phone: "",
			qualification: undefined,
			graduationStatus: undefined,
			termsPersonalInfo: false,
			termsWaffleStudio: false,
			termsEmail: false,
			termsSms: false,
		},
	})

	const onSubmit = async (data: SignupFormValues) => {
		if (!data.termsPersonalInfo || !data.termsWaffleStudio) {
			setTermsError("꼭 동의해야하는 항목이에요.")
			return
		}

		if (!authToken) {
			setError("인증 토큰이 없습니다. 다시 로그인해주세요.")
			return
		}

		setIsSubmitting(true)
		setError(null)
		setTermsError(null)

		try {
			const response = await authClient.signup({
				auth_token: authToken,
				name: data.name,
				generation: data.generation,
				student_id: data.studentId,
				affiliation: data.affiliation,
				graduation_status: data.graduationStatus,
				email: data.email,
				phone: data.phone,
				qualification: QUALIFICATION_TO_API[data.qualification],
				privacy_policy_agreed: true,
				terms_agreed: true,
				email_notifications_agreed: data.termsEmail,
				sms_notifications_agreed: data.termsSms,
			})

			if (response.ok) {
				if (response.data.status === "pending") {
					router.replace("/signup/pending")
				} else {
					router.replace("/")
				}
			} else {
				setError("회원가입에 실패했습니다.")
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "회원가입에 실패했습니다."
			setError(message)
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<SignupErrorToast
				message={termsError ?? error ?? ""}
				isVisible={!!termsError || !!error}
				onClose={() => {
					setTermsError(null)
					setError(null)
				}}
			/>
			<div className="flex justify-start items-center gap-2.5 px-[50px] py-[70px] rounded-[15px] border border-[#dbdfe0] bg-white">
				<div className="flex flex-col justify-start items-start gap-[50px]">
					{/* 헤더 */}
					<div className="flex items-center gap-2.5">
						<Logo size="sm" />
						<h1 className="text-2xl font-semibold text-[#0a0a0a]">회원가입</h1>
					</div>

					<div className="flex flex-col gap-[30px]">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-[30px]">
								{/* 입력 필드 그룹 */}
								<div className="flex flex-col gap-[25px]">
									{/* 이름 */}
									<FormField
										control={form.control}
										name="name"
										render={({ field, fieldState }) => (
											<FormItem className="gap-1.5">
												<RequiredLabel label="이름" />
												<FormControl>
													<Input
														placeholder="홍길동"
														className={cn(
															"w-[360px] h-[50px] rounded-[5px] text-[15px]",
															fieldState.error ? "border-red-500" : "border-black-600",
														)}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 기수 */}
									<FormField
										control={form.control}
										name="generation"
										render={({ field, fieldState }) => (
											<FormItem className="gap-1.5">
												<RequiredLabel label="기수" />
												<FormControl>
													<Input
														placeholder="23.5"
														className={cn(
															"w-[360px] h-[50px] rounded-[5px] text-[15px]",
															fieldState.error ? "border-red-500" : "border-black-600",
														)}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 학번 */}
									<FormField
										control={form.control}
										name="studentId"
										render={({ field, fieldState }) => (
											<FormItem className="gap-1.5">
												<RequiredLabel label="학번" />
												<FormControl>
													<Input
														placeholder="202X-XXXXX"
														className={cn(
															"w-[360px] h-[50px] rounded-[5px] text-[15px]",
															fieldState.error ? "border-red-500" : "border-black-600",
														)}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 소속 */}
									<FormField
										control={form.control}
										name="affiliation"
										render={({ field, fieldState }) => (
											<FormItem className="gap-1.5">
												<RequiredLabel label="소속" />
												<FormControl>
													<Input
														placeholder="컴퓨터공학부"
														className={cn(
															"w-[360px] h-[50px] rounded-[5px] text-[15px]",
															fieldState.error ? "border-red-500" : "border-black-600",
														)}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 소식 수신용 이메일 */}
									<FormField
										control={form.control}
										name="email"
										render={({ field, fieldState }) => (
											<FormItem className="gap-1.5">
												<RequiredLabel label="소식 수신용 이메일" />
												<FormControl>
													<Input
														type="email"
														placeholder="example@gmail.com"
														className={cn(
															"w-[360px] h-[50px] rounded-[5px] text-[15px]",
															fieldState.error ? "border-red-500" : "border-black-600",
														)}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 전화번호 */}
									<FormField
										control={form.control}
										name="phone"
										render={({ field, fieldState }) => (
											<FormItem className="gap-1.5">
												<RequiredLabel label="전화번호" />
												<FormControl>
													<Input
														placeholder="010-1234-5678"
														className={cn(
															"w-[360px] h-[50px] rounded-[5px] text-[15px]",
															fieldState.error ? "border-red-500" : "border-black-600",
														)}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 자격 */}
									<FormField
										control={form.control}
										name="qualification"
										render={({ field, fieldState }) => (
											<FormItem className="gap-1.5">
												<RequiredLabel label="자격" />
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger
															className={cn(
																"w-[360px] h-[50px] rounded-[5px] text-[17px] text-black-700 px-4 [&>svg]:text-black-600 data-[state=open]:rounded-b-none data-[state=open]:border-b-0",
																fieldState.error ? "border-red-500" : "border-black-600",
															)}
														>
															<SelectValue placeholder="선택" />
														</SelectTrigger>
													</FormControl>
													<SelectContent
														className="w-[360px] rounded-t-none rounded-b-[5px] border-black-600 p-0 shadow-none data-[side=bottom]:translate-y-0"
														sideOffset={0}
													>
														<SelectItem
															value="정회원"
															className="h-[50px] px-4 text-[17px] text-black-700 data-[state=checked]:text-peach-500 data-[state=checked]:font-medium focus:bg-transparent"
														>
															정회원
														</SelectItem>
														<SelectItem
															value="활동회원"
															className="h-[50px] px-4 text-[17px] text-black-700 data-[state=checked]:text-peach-500 data-[state=checked]:font-medium focus:bg-transparent"
														>
															활동회원
														</SelectItem>
														<SelectItem
															value="준회원"
															className="h-[50px] px-4 text-[17px] text-black-700 data-[state=checked]:text-peach-500 data-[state=checked]:font-medium focus:bg-transparent"
														>
															준회원
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 재학여부 */}
									<FormField
										control={form.control}
										name="graduationStatus"
										render={({ field, fieldState }) => (
											<FormItem className="gap-1.5">
												<RequiredLabel label="재학여부" />
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger
															className={cn(
																"w-[360px] h-[50px] rounded-[5px] text-[17px] text-black-700 px-4 [&>svg]:text-black-600 data-[state=open]:rounded-b-none data-[state=open]:border-b-0",
																fieldState.error ? "border-red-500" : "border-black-600",
															)}
														>
															<SelectValue placeholder="선택" />
														</SelectTrigger>
													</FormControl>
													<SelectContent
														className="w-[360px] rounded-t-none rounded-b-[5px] border-black-600 p-0 shadow-none data-[side=bottom]:translate-y-0"
														sideOffset={0}
													>
														<SelectItem
															value="학부생"
															className="h-[50px] px-4 text-[17px] text-black-700 data-[state=checked]:text-peach-500 data-[state=checked]:font-medium focus:bg-transparent"
														>
															학부생
														</SelectItem>
														<SelectItem
															value="졸업생"
															className="h-[50px] px-4 text-[17px] text-black-700 data-[state=checked]:text-peach-500 data-[state=checked]:font-medium focus:bg-transparent"
														>
															졸업생
														</SelectItem>
														<SelectItem
															value="대학원생"
															className="h-[50px] px-4 text-[17px] text-black-700 data-[state=checked]:text-peach-500 data-[state=checked]:font-medium focus:bg-transparent"
														>
															대학원생
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* 약관 */}
								<div className="flex flex-col w-[290px] gap-2">
									<FormField
										control={form.control}
										name="termsPersonalInfo"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center gap-2.5 space-y-0">
												<FormControl>
													<Checkbox checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<span className="text-[13px]">
													<span className="text-[#505050]">[필수] </span>
													<a
														href={PRIVACY_POLICY_URL}
														target="_blank"
														rel="noopener noreferrer"
														className="text-[#121212] underline"
													>
														개인정보 수집·이용 동의
													</a>
												</span>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="termsWaffleStudio"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center gap-2.5 space-y-0">
												<FormControl>
													<Checkbox checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<span className="text-[13px]">
													<span className="text-[#505050]">[필수] </span>
													<a
														href={TERMS_URL}
														target="_blank"
														rel="noopener noreferrer"
														className="text-[#121212] underline"
													>
														와플스튜디오 정관 및 규정 동의
													</a>
												</span>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="termsEmail"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center gap-2.5 space-y-0">
												<FormControl>
													<Checkbox checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<span className="text-[13px] text-[#505050]">
													[선택] 이메일 정보 수신 동의
												</span>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="termsSms"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center gap-2.5 space-y-0">
												<FormControl>
													<Checkbox checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<span className="text-[13px] text-[#505050]">
													[선택] SMS 정보 수신 동의
												</span>
											</FormItem>
										)}
									/>
								</div>

								{/* 가입하기 버튼 */}
								<Button
									type="submit"
									className="w-[360px] h-[50px] rounded-[5px] bg-[#121212] text-[15px] font-semibold text-white hover:bg-[#121212]/90 disabled:opacity-40"
									disabled={isSubmitting || !form.formState.isValid}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											가입 중...
										</>
									) : (
										"회원가입"
									)}
								</Button>
							</form>
						</Form>
					</div>
				</div>
			</div>
		</div>
	)
}
