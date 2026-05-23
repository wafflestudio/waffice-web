"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
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
		enrollmentStatus: z.enum(["학부생", "졸업생"]),
		studentId: z.string().optional(),
		major: z.string().optional(),
		schoolEmail: z.string().email("이메일 형식이 올바르지 않습니다.").optional().or(z.literal("")),
		organization: z.string().optional(),
		position: z.string().optional(),
		githubId: z.string().optional(),
		slackId: z.string().optional(),
		phone: z.string().optional(),
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

			const schoolEmail = (data.schoolEmail ?? "").trim()
			if (!schoolEmail) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["schoolEmail"],
					message: "필수 입력값입니다.",
				})
			}
		}
	})

type MypageFormValues = z.infer<typeof mypageSchema>

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
			schoolEmail: "",
			organization: "",
			position: "",
			githubId: "",
			slackId: "",
			phone: "",
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
					let position = ""
					if (userData.bio) {
						const bioMatch = userData.bio.match(/^\d+(\.\d+)?기 - (.+)$/)
						if (bioMatch) {
							const extractedValue = bioMatch[2]
							if (STUDENT_ID_REGEX.test(extractedValue)) {
								studentId = extractedValue
							} else {
								position = extractedValue
							}
						}
					}

					// 재학 상태 추론 (affiliation이 학과명 형태면 학부생, 아니면 졸업생)
					const isStudentUser = userData.affiliation
						? /학부|학과|전공/.test(userData.affiliation) || studentId
						: false

					form.reset({
						name: userData.name || "",
						generation: userData.generation || "",
						email: userData.email || "",
						enrollmentStatus: isStudentUser ? "학부생" : "졸업생",
						studentId: studentId,
						major: isStudentUser ? userData.affiliation || "" : "",
						schoolEmail: "",
						organization: !isStudentUser ? userData.affiliation || "" : "",
						position: position,
						githubId: userData.github_username || "",
						slackId: userData.slack_id || "",
						phone: userData.phone || "",
						smsNotification: false,
						emailNotification: false,
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
			const affiliation = isStudent ? data.major : data.organization
			const bio = isStudent
				? `${data.generation}기 - ${data.studentId}`
				: data.position
					? `${data.generation}기 - ${data.position}`
					: undefined

			const response = await apiClient.updateMyProfile({
				name: data.name,
				generation: data.generation,
				phone: data.phone || null,
				affiliation: affiliation || null,
				bio: bio || null,
				github_username: data.githubId || null,
				slack_id: data.slackId || null,
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

	const createdAt = user?.created_at
		? new Date(user.created_at * 1000).toLocaleDateString("ko-KR", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			})
		: ""

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">마이페이지</h1>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
						{/* 왼쪽 컬럼 */}
						<div className="space-y-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											이름<span className="text-[#FF6B6B]">*</span>
										</FormLabel>
										<FormControl>
											<Input placeholder="홍길동" {...field} />
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
										<FormLabel>
											기수<span className="text-[#FF6B6B]">*</span>
										</FormLabel>
										<FormControl>
											<Input placeholder="23.5" {...field} />
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
										<FormLabel>
											이메일<span className="text-[#FF6B6B]">*</span>
										</FormLabel>
										<FormControl>
											<Input type="email" placeholder="example@gmail.com" {...field} />
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
										<FormLabel>Github ID</FormLabel>
										<FormControl>
											<Input placeholder="wafflestudio" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="slackId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Slack ID</FormLabel>
										<FormControl>
											<Input placeholder="waffice@gmail.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormItem>
								<FormLabel>계정 생성일</FormLabel>
								<Input value={createdAt} disabled className="bg-muted" />
							</FormItem>
						</div>

						{/* 오른쪽 컬럼 */}
						<div className="space-y-6">
							<FormItem>
								<FormLabel>자격</FormLabel>
								<Input
									value={user ? qualificationToKorean(user.qualification) : ""}
									disabled
									className="bg-muted"
								/>
							</FormItem>

							<FormField
								control={form.control}
								name="enrollmentStatus"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											재학여부<span className="text-[#FF6B6B]">*</span>
										</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
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

							{isStudent ? (
								<>
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="studentId"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														학번<span className="text-[#FF6B6B]">*</span>
													</FormLabel>
													<FormControl>
														<Input placeholder="2025-12345" maxLength={10} {...field} />
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
													<FormLabel>
														학과<span className="text-[#FF6B6B]">*</span>
													</FormLabel>
													<FormControl>
														<Input placeholder="컴퓨터공학부" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={form.control}
										name="schoolEmail"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													스누메일<span className="text-[#FF6B6B]">*</span>
												</FormLabel>
												<FormControl>
													<Input type="email" placeholder="example@snu.ac.kr" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</>
							) : (
								<>
									<FormField
										control={form.control}
										name="organization"
										render={({ field }) => (
											<FormItem>
												<FormLabel>소속</FormLabel>
												<FormControl>
													<Input placeholder="소속 기관명" {...field} />
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
													<Input placeholder="" {...field} />
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
										<FormLabel>전화번호</FormLabel>
										<FormControl>
											<Input placeholder="010-1234-5678" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="space-y-3">
								<FormLabel>동문회원 소식 수신</FormLabel>
								<div className="flex items-center gap-6">
									<FormField
										control={form.control}
										name="smsNotification"
										render={({ field }) => (
											<FormItem className="flex items-center space-x-2 space-y-0">
												<FormControl>
													<Checkbox checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<FormLabel className="font-normal cursor-pointer">SMS</FormLabel>
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="emailNotification"
										render={({ field }) => (
											<FormItem className="flex items-center space-x-2 space-y-0">
												<FormControl>
													<Checkbox checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<FormLabel className="font-normal cursor-pointer">Email</FormLabel>
											</FormItem>
										)}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* 버튼 영역 */}
					<div className="flex gap-4">
						<Button type="button" variant="outline" className="w-32" onClick={handleCancel}>
							취소
						</Button>
						<Button
							type="submit"
							className="w-32 bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									저장 중...
								</>
							) : (
								"확인"
							)}
						</Button>
					</div>
				</form>
			</Form>

			<Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
		</div>
	)
}
