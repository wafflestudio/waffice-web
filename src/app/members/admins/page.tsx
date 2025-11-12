"use client"

import { Search } from "lucide-react"
import { useId, useState } from "react"
import { AdminForm } from "@/components/members/admin-form"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Toast } from "@/components/ui/toast"

interface Admin {
	id: number
	role: string
	name: string
	generation: string
	email: string
	permission: string
	belongTo: string
	category: string
}

// 임시 목 데이터
const mockAdmins: Admin[] = [
	{
		id: 1,
		role: "슈퍼 관리자",
		name: "홍길동",
		generation: "23.5기",
		email: "waffice@gmail.com",
		permission: "전메뉴",
		belongTo: "운영팀",
		category: "슈퍼 관리자 변경",
	},
	{
		id: 2,
		role: "관리자",
		name: "홍길동",
		generation: "23.5기",
		email: "waffice@gmail.com",
		permission: "전메뉴",
		belongTo: "운영팀",
		category: "",
	},
	{
		id: 3,
		role: "관리자",
		name: "홍길동",
		generation: "23.5기",
		email: "waffice@gmail.com",
		permission: "전메뉴",
		belongTo: "운영팀",
		category: "",
	},
	{
		id: 4,
		role: "관리자",
		name: "홍길동",
		generation: "23.5기",
		email: "waffice@gmail.com",
		permission: "전메뉴",
		belongTo: "운영팀",
		category: "",
	},
	{
		id: 5,
		role: "관리자",
		name: "홍길동",
		generation: "23.5기",
		email: "waffice@gmail.com",
		permission: "전메뉴",
		belongTo: "운영팀",
		category: "",
	},
	{
		id: 6,
		role: "관리자",
		name: "홍길동",
		generation: "23.5기",
		email: "waffice@gmail.com",
		permission: "전메뉴",
		belongTo: "운영팀",
		category: "",
	},
	{
		id: 7,
		role: "관리자",
		name: "홍길동",
		generation: "23.5기",
		email: "waffice@gmail.com",
		permission: "전메뉴",
		belongTo: "운영팀",
		category: "",
	},
	{
		id: 8,
		role: "팀장",
		name: "홍길동",
		generation: "23.5기",
		email: "waffice@gmail.com",
		permission: "프로젝트 관리(인터넷 프로덕트), 마이페이지",
		belongTo: "인터넷 프로덕트",
		category: "",
	},
	{
		id: 9,
		role: "팀장",
		name: "홍길동",
		generation: "23.5기",
		email: "waffice@gmail.com",
		permission: "프로젝트 관리(인터넷 프로덕트), 마이페이지",
		belongTo: "인터넷 프로덕트",
		category: "",
	},
]

export default function MemberAdminsPage() {
	const [_searchQuery, _setSearchQuery] = useState("")
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
	const [searchName, setSearchName] = useState("")
	const [selectedRole, setSelectedRole] = useState("")
	const [showToast, setShowToast] = useState(false)
	const [toastMessage, setToastMessage] = useState("")
	const [isSelectOpen, setIsSelectOpen] = useState(false)

	const [admins, setAdmins] = useState<Admin[]>(mockAdmins)
	const searchNameId = useId()

	const handleAdminUpdate = (id: number, data: Partial<Admin>) => {
		setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)))
		setShowToast(true)
		setToastMessage("관리자 정보가 업데이트되었습니다.")
	}

	const handleAddClick = () => {
		setIsAddDialogOpen(true)
		setSearchName("")
		setSelectedRole("")
		setIsSelectOpen(false)
	}

	const handleDeleteClick = (admin: Admin) => {
		setSelectedAdmin(admin)
		setIsDeleteDialogOpen(true)
	}

	// edit handled by AdminForm trigger in table

	const handleAddSubmit = () => {
		if (!searchName.trim()) {
			alert("회원 이름을 입력해주세요.")
			return
		}
		if (!selectedRole) {
			alert("분류를 선택해주세요.")
			return
		}

		// TODO: API 호출하여 관리자 추가
		console.log("추가할 관리자:", searchName, selectedRole)

		setIsAddDialogOpen(false)
		setSearchName("")
		setSelectedRole("")
		setToastMessage("관리자가 추가되었습니다.")
		setShowToast(true)
	}

	const handleDeleteSubmit = () => {
		// TODO: API 호출하여 관리자 삭제
		console.log("삭제할 관리자:", selectedAdmin)

		setIsDeleteDialogOpen(false)
		setSelectedAdmin(null)
		setToastMessage("관리자가 삭제되었습니다.")
		setShowToast(true)
	}

	return (
		<div className="space-y-6 p-8">
			{/* 헤더 */}
			<div>
				<h1 className="text-3xl font-bold">관리자 설정</h1>
			</div>

			{/* 버튼 */}
			<div className="flex justify-start">
				<Button className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white" onClick={handleAddClick}>
					관리자 추가 등록
				</Button>
			</div>

			{/* 테이블 */}
			<div className="rounded-lg border bg-white">
				<Table>
					<TableHeader>
						<TableRow className="bg-gray-50">
							<TableHead>분류</TableHead>
							<TableHead>이름</TableHead>
							<TableHead>기수</TableHead>
							<TableHead>이메일</TableHead>
							<TableHead>변경 가능 메뉴</TableHead>
							<TableHead>소속 팀</TableHead>
							<TableHead>편집</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{admins.map((admin) => (
							<TableRow key={admin.id}>
								<TableCell>{admin.role}</TableCell>
								<TableCell>{admin.name}</TableCell>
								<TableCell>{admin.generation}</TableCell>
								<TableCell>{admin.email}</TableCell>
								<TableCell>{admin.permission}</TableCell>
								<TableCell>{admin.belongTo}</TableCell>
								<TableCell className="flex items-center gap-2">
									<AdminForm
										admin={admin}
										onSubmit={(id, data) => handleAdminUpdate(id, data)}
										trigger={
											<Button variant="outline" size="sm" className="h-8 px-3">
												수정
											</Button>
										}
									/>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleDeleteClick(admin)}
										className="h-8 px-3"
									>
										−
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* 관리자 추가 다이얼로그 */}
			<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>관리자 추가</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						{/* 이름 검색 */}
						<div className="space-y-2">
							<Label htmlFor={searchNameId}>이름</Label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								{/* useId to generate unique id */}
								<Input
									id={searchNameId}
									placeholder="회원 이름을 검색해보세요."
									value={searchName}
									onChange={(e) => setSearchName(e.target.value)}
									className="pl-9"
								/>
							</div>
						</div>

						{/* 분류 선택 */}
						<div
							className={`space-y-2 transition-all duration-200 ${isSelectOpen ? "mb-20" : "mb-0"}`}
						>
							<Label>분류</Label>
							<Select
								value={selectedRole}
								onValueChange={setSelectedRole}
								onOpenChange={setIsSelectOpen}
							>
								<SelectTrigger>
									<SelectValue placeholder="선택" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="admin">관리자</SelectItem>
									<SelectItem value="teamleader">팀장</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
							취소
						</Button>
						<Button
							className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
							onClick={handleAddSubmit}
						>
							확인
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* 관리자 삭제 확인 다이얼로그 */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>선택한 관리자를 삭제하시겠습니까?</DialogTitle>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
							취소
						</Button>
						<Button
							className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
							onClick={handleDeleteSubmit}
						>
							확인
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* 성공 토스트 알림 */}
			<Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
		</div>
	)
}
