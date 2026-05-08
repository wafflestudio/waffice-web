"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Logo } from "@/components/auth/logo"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { authClient } from "@/lib/auth"

const signupSchema = z.object({
	name: z.string().min(1, "이름을 입력해 주세요."),
	generation: z
		.string()
		.min(1, "기수를 입력해 주세요.")
		.regex(/^\d+(\.\d+)?$/, "기수는 숫자 형식으로 입력해 주세요. (예: 22, 22.5)"),
	email: z.string().min(1, "이메일을 입력해 주세요.").email("이메일을 확인해주세요."),
	enrollmentStatus: z.enum(["학부생", "대학원생", "졸업생", "기타"], {
		errorMap: () => ({ message: "재학여부를 선택해 주세요." }),
	}),
	qualification: z.enum(["준회원", "정회원", "활동회원"], {
		errorMap: () => ({ message: "자격을 선택해 주세요." }),
	}),
	githubId: z.string().optional(),
	termsPersonalInfo: z.boolean().refine((val) => val === true, {
		message: "필수 항목입니다.",
	}),
	termsWaffleStudio: z.boolean().refine((val) => val === true, {
		message: "필수 항목입니다.",
	}),
	termsEmailSms: z.boolean(),
})

type SignupFormValues = z.infer<typeof signupSchema>

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
		defaultValues: {
			name: "",
			generation: "",
			email: "",
			enrollmentStatus: undefined,
			qualification: undefined,
			githubId: "",
			termsPersonalInfo: false,
			termsWaffleStudio: false,
			termsEmailSms: false,
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
				github_username: data.githubId || undefined,
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
			<div className="flex justify-start items-center gap-2.5 px-[50px] py-[70px] rounded-[15px] border border-[#dbdfe0] bg-white">
				<div className="flex flex-col justify-start items-start gap-[50px]">
					{/* 헤더 */}
					<div className="flex items-center gap-2.5">
						<Logo size="sm" />
						<h1 className="text-2xl font-semibold text-[#0a0a0a]">회원가입</h1>
					</div>

					<div className="flex flex-col gap-[30px]">
						{error && (
							<div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
								{error}
							</div>
						)}

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-[30px]">
								{/* 입력 필드 그룹 */}
								<div className="flex flex-col gap-[25px]">
									{/* 이름 */}
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem className="gap-1.5">
												<RequiredLabel label="이름" />
												<FormControl>
													<Input
														placeholder="홍길동"
														className="w-[360px] h-[50px] rounded-[5px] border-[#777] text-[15px]"
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
										render={({ field }) => (
											<FormItem className="gap-1.5">
												<RequiredLabel label="기수" />
												<FormControl>
													<Input
														placeholder="23.5"
														className="w-[360px] h-[50px] rounded-[5px] border-[#777] text-[15px]"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 이메일 */}
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem className="gap-1.5">
												<RequiredLabel label="이메일" />
												<FormControl>
													<Input
														type="email"
														placeholder="example@gmail.com"
														className="w-[360px] h-[50px] rounded-[5px] border-[#777] text-[15px]"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 재학여부 */}
									<FormField
										control={form.control}
										name="enrollmentStatus"
										render={({ field }) => (
											<FormItem className="gap-1.5">
												<RequiredLabel label="재학여부" />
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger className="w-[360px] h-[50px] rounded-[5px] border-[#777] text-[15px]">
															<SelectValue placeholder="선택" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="학부생">학부생</SelectItem>
														<SelectItem value="대학원생">대학원생</SelectItem>
														<SelectItem value="졸업생">졸업생</SelectItem>
														<SelectItem value="기타">기타</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 자격 */}
									<FormField
										control={form.control}
										name="qualification"
										render={({ field }) => (
											<FormItem className="gap-1.5">
												<RequiredLabel label="자격" />
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger className="w-[360px] h-[50px] rounded-[5px] border-[#777] text-[15px]">
															<SelectValue placeholder="선택" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="준회원">준회원</SelectItem>
														<SelectItem value="정회원">정회원</SelectItem>
														<SelectItem value="활동회원">활동회원</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Github ID */}
									<FormField
										control={form.control}
										name="githubId"
										render={({ field }) => (
											<FormItem className="gap-1.5">
												<span className="text-[15px] font-medium text-[#121212]">Github ID</span>
												<FormControl>
													<Input
														placeholder="example"
														className="w-[360px] h-[50px] rounded-[5px] border-[#777] text-[15px]"
														{...field}
													/>
												</FormControl>
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
													<span className="text-[#121212]">개인정보 수집·이용 동의</span>
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
													<span className="text-[#121212]">와플스튜디오 정관 및 규정 동의</span>
												</span>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="termsEmailSms"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center gap-2.5 space-y-0">
												<FormControl>
													<Checkbox checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<span className="text-[13px] text-[#505050]">[선택] 이메일 SMS 정보 수신 동의</span>
											</FormItem>
										)}
									/>
								</div>

								{/* 필수 동의 에러 팝업 */}
								{termsError && (
									<div className="flex items-center gap-2 px-[30px] py-[25px] rounded-md border border-destructive bg-destructive/5">
										<svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
											<circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" />
											<path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
										</svg>
										<span className="text-[15px] text-destructive">{termsError}</span>
									</div>
								)}

								{/* 가입하기 버튼 */}
								<Button
									type="submit"
									className="w-[360px] h-[50px] rounded-[5px] bg-[#121212] text-[15px] font-semibold text-white hover:bg-[#121212]/90"
									disabled={isSubmitting}
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
