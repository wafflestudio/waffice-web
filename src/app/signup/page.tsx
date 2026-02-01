"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Logo } from "@/components/auth/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
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

const STUDENT_ID_REGEX = /^\d{4}-\d{5}$/
const STUDENT_ID_FORMAT_ERROR = "학번은 YYYY-XXXXX 형식이어야 합니다."

const signupSchema = z
	.object({
		name: z.string().min(1, "필수 입력항목입니다."),
		generation: z
			.string()
			.min(1, "기수를 입력해 주세요.")
			.regex(/^\d+(\.\d+)?$/, "기수는 숫자 형식으로 입력해 주세요. (예: 22, 22.5)"),
		email: z.string().email("이메일을 확인해주세요."),
		enrollmentStatus: z.enum(["학부생", "졸업생"]),
		studentId: z.string().optional(),
		major: z.string().optional(),
		schoolEmail: z.string().email("이메일 형식이 올바르지 않습니다.").optional().or(z.literal("")),
		organization: z.string().optional(),
		position: z.string().optional(),
		githubId: z.string().optional(),
		phone: z.string().optional(),
		termsPersonalInfo: z.boolean().refine((val) => val === true, {
			message: "필수 항목입니다.",
		}),
		termsWaffleStudio: z.boolean(),
		termsEmailSms: z.boolean(),
	})
	.superRefine((data, ctx) => {
		if (data.enrollmentStatus === "학부생") {
			const value = (data.studentId ?? "").trim()
			if (!value) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["studentId"],
					message: "학번은 YYYY-XXXXX 형식으로 입력해 주세요.",
				})
			} else if (!STUDENT_ID_REGEX.test(value)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["studentId"],
					message: STUDENT_ID_FORMAT_ERROR,
				})
			}
		} else {
			const value = (data.studentId ?? "").trim()
			if (value && !STUDENT_ID_REGEX.test(value)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["studentId"],
					message: STUDENT_ID_FORMAT_ERROR,
				})
			}
		}
	})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
	const router = useRouter()
	const [authToken, setAuthToken] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const hasProcessedToken = useRef(false)

	useEffect(() => {
		// Prevent double execution in React Strict Mode
		if (hasProcessedToken.current) {
			return
		}

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
			enrollmentStatus: "학부생",
			studentId: "",
			major: "",
			schoolEmail: "",
			organization: "",
			position: "",
			githubId: "",
			phone: "",
			termsPersonalInfo: false,
			termsWaffleStudio: false,
			termsEmailSms: false,
		},
	})

	const enrollmentStatus = form.watch("enrollmentStatus")
	const isStudent = enrollmentStatus === "학부생"
	const isGraduate = enrollmentStatus === "졸업생"

	const onSubmit = async (data: SignupFormValues) => {
		if (!authToken) {
			setError("인증 토큰이 없습니다. 다시 로그인해주세요.")
			return
		}

		setIsSubmitting(true)
		setError(null)

		try {
			// API 스펙에 맞춰 회원가입 요청
			const affiliation = isStudent ? data.major : data.organization
			const bio = isStudent
				? `${data.generation}기 - ${data.studentId}`
				: `${data.generation}기 - ${data.position}`

			const response = await authClient.signup({
				auth_token: authToken,
				name: data.name,
				phone: data.phone || undefined,
				affiliation: affiliation || undefined,
				bio: bio || undefined,
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
		} catch (error) {
			const message = error instanceof Error ? error.message : "회원가입에 실패했습니다."
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
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="flex flex-col items-start text-left space-y-3">
					<Logo size="md" />
					<h1 className="text-2xl font-bold">가입 신청</h1>
				</CardHeader>
				<CardContent>
					{error && (
						<div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">{error}</div>
					)}
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>이름</FormLabel>
										<FormControl>
											<Input placeholder="이름을 입력해 주세요." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="generation"
								render={({ field }) => (
									<FormItem>
										<FormLabel>기수</FormLabel>
										<FormControl>
											<Input placeholder="기수를 입력해 주세요." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>이메일</FormLabel>
										<FormControl>
											<Input type="email" placeholder="이메일을 입력해 주세요." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="enrollmentStatus"
								render={({ field }) => (
									<FormItem>
										<FormLabel>재학 상태</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="재학 상태를 선택해 주세요." />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="학부생">학부생</SelectItem>
												<SelectItem value="졸업생">졸업생</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{isStudent && (
								<>
									<FormField
										control={form.control}
										name="studentId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>학번</FormLabel>
												<FormControl>
													<Input
														placeholder="YYYY-XXXXX (예: 2021-12345)"
														maxLength={10}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="major"
										render={({ field }) => (
											<FormItem>
												<FormLabel>전공</FormLabel>
												<FormControl>
													<Input placeholder="전공을 입력해 주세요." {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="schoolEmail"
										render={({ field }) => (
											<FormItem>
												<FormLabel>학교 이메일</FormLabel>
												<FormControl>
													<Input
														type="email"
														placeholder="학교 이메일을 입력해 주세요."
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</>
							)}

							{isGraduate && (
								<>
									<FormField
										control={form.control}
										name="organization"
										render={({ field }) => (
											<FormItem>
												<FormLabel>소속</FormLabel>
												<FormControl>
													<Input placeholder="소속을 입력해 주세요." {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="position"
										render={({ field }) => (
											<FormItem>
												<FormLabel>직책</FormLabel>
												<FormControl>
													<Input placeholder="직책을 입력해 주세요." {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</>
							)}

							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>전화번호 (선택)</FormLabel>
										<FormControl>
											<Input placeholder="010-1234-5678" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="githubId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>GitHub ID (선택)</FormLabel>
										<FormControl>
											<Input placeholder="GitHub ID를 입력해 주세요." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="termsPersonalInfo"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0">
										<FormControl>
											<Checkbox checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>개인정보 수집 및 이용에 동의합니다. (필수)</FormLabel>
											<FormMessage />
										</div>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="termsWaffleStudio"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0">
										<FormControl>
											<Checkbox checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>와플스튜디오 이용약관에 동의합니다. (선택)</FormLabel>
											<FormMessage />
										</div>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="termsEmailSms"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0">
										<FormControl>
											<Checkbox checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>이메일 및 SMS 수신에 동의합니다. (선택)</FormLabel>
											<FormMessage />
										</div>
									</FormItem>
								)}
							/>

							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										가입 중...
									</>
								) : (
									"가입하기"
								)}
							</Button>

							<Button
								type="button"
								variant="ghost"
								className="w-full"
								onClick={() => router.replace("/login")}
								disabled={isSubmitting}
							>
								로그인 페이지로 돌아가기
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
