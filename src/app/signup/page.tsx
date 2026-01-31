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
import { Textarea } from "@/components/ui/textarea"
import { authClient } from "@/lib/auth"

const signupSchema = z.object({
	name: z.string().min(1, "필수 입력항목입니다.").max(100, "이름은 100자 이내여야 합니다."),
	phone: z.string().optional(),
	enrollmentStatus: z.enum(["학부생", "졸업생"]),
	affiliation: z.string().optional(),
	bio: z.string().max(500, "자기소개는 500자 이내여야 합니다.").optional(),
	githubUsername: z.string().optional(),
	termsPersonalInfo: z.boolean().refine((val) => val === true, {
		message: "필수 항목입니다.",
	}),
	termsWaffleStudio: z.boolean(),
	termsEmailSms: z.boolean(),
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
	const router = useRouter()
	const [authToken, setAuthToken] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)
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
			phone: "",
			enrollmentStatus: "학부생",
			affiliation: "",
			bio: "",
			githubUsername: "",
			termsPersonalInfo: false,
			termsWaffleStudio: false,
			termsEmailSms: false,
		},
	})

	const enrollmentStatus = form.watch("enrollmentStatus")
	const isStudent = enrollmentStatus === "학부생"

	const onSubmit = async (data: SignupFormValues) => {
		if (!authToken) {
			setSubmitError("인증 토큰이 없습니다. 다시 로그인해주세요.")
			return
		}

		setIsSubmitting(true)
		setSubmitError(null)

		try {
			const response = await authClient.signup({
				auth_token: authToken,
				name: data.name,
				phone: data.phone || undefined,
				affiliation: data.affiliation || undefined,
				bio: data.bio || undefined,
				github_username: data.githubUsername || undefined,
			})

			if (response.ok) {
				if (response.data.status === "pending") {
					router.replace("/signup/pending")
				} else {
					router.replace("/")
				}
			} else {
				setSubmitError("회원가입에 실패했습니다.")
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "회원가입에 실패했습니다."
			setSubmitError(message)
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
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							{submitError && (
								<div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
									{submitError}
								</div>
							)}

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
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>연락처 (선택)</FormLabel>
										<FormControl>
											<Input placeholder="연락처를 입력해 주세요." {...field} />
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

							<FormField
								control={form.control}
								name="affiliation"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{isStudent ? "소속 (선택)" : "소속/회사 (선택)"}</FormLabel>
										<FormControl>
											<Input
												placeholder={
													isStudent ? "소속을 입력해 주세요." : "소속 또는 회사를 입력해 주세요."
												}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="bio"
								render={({ field }) => (
									<FormItem>
										<FormLabel>자기소개 (선택)</FormLabel>
										<FormControl>
											<Textarea
												placeholder="간단한 자기소개를 입력해 주세요."
												className="resize-none"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="githubUsername"
								render={({ field }) => (
									<FormItem>
										<FormLabel>GitHub 사용자명 (선택)</FormLabel>
										<FormControl>
											<Input placeholder="@를 제외한 사용자명을 입력해 주세요." {...field} />
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
