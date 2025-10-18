"use client"

import { FolderOpen, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for dashboard
const stats = {
	totalMembers: 12,
	activeProjects: 3,
	recentActivity: [
		{ type: "member", description: "새 회원 가입: 김철수", time: "2시간 전" },
		{ type: "project", description: '프로젝트 "웹앱" 상태가 활성으로 변경됨', time: "4시간 전" },
	],
}

export default function DashboardPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">대시보드</h1>
				<p className="text-muted-foreground">와플 스튜디오 관리 시스템에 오신 것을 환영합니다</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">총 회원 수</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalMembers}</div>
						<p className="text-xs text-muted-foreground">지난 달 대비 +2명</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">진행 중인 프로젝트</CardTitle>
						<FolderOpen className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.activeProjects}</div>
						<p className="text-xs text-muted-foreground">이번 달 완료: 1개</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>최근 활동</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{stats.recentActivity.map((activity, index) => (
								<div key={index} className="flex items-center space-x-4">
									<div className="w-2 h-2 bg-primary rounded-full" />
									<div className="flex-1 space-y-1">
										<p className="text-sm font-medium leading-none">{activity.description}</p>
										<p className="text-xs text-muted-foreground">{activity.time}</p>
									</div>
									<Badge variant="outline" className="text-xs">
										{activity.type === "member" ? "회원" : "프로젝트"}
									</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>빠른 작업</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
								<div className="flex items-center space-x-2">
									<Users className="h-4 w-4" />
									<span className="text-sm font-medium">새 회원 추가</span>
								</div>
							</div>
							<div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
								<div className="flex items-center space-x-2">
									<FolderOpen className="h-4 w-4" />
									<span className="text-sm font-medium">프로젝트 생성</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
