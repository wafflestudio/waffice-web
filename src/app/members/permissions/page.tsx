"use client"

import { ChevronDown, ChevronRight } from "lucide-react"
import React, { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"

interface Permission {
	id: string
	name: string
	superAdmin: boolean
	admin: boolean
	teamLeader: boolean
	activeMember: boolean
	juniorMember: boolean
	prepareMember: boolean
	children?: Permission[]
}

// 권한 데이터 구조
const permissionsData: Permission[] = [
	{
		id: "dashboard",
		name: "대시보드",
		superAdmin: true,
		admin: true,
		teamLeader: true,
		activeMember: true,
		juniorMember: false,
		prepareMember: false,
	},
	{
		id: "members",
		name: "회원관리 홈",
		superAdmin: true,
		admin: true,
		teamLeader: true,
		activeMember: true,
		juniorMember: false,
		prepareMember: false,
		children: [
			{
				id: "members-application",
				name: "회원정보 열람",
				superAdmin: true,
				admin: true,
				teamLeader: true,
				activeMember: true,
				juniorMember: false,
				prepareMember: false,
			},
			{
				id: "members-info-edit",
				name: "회원정보 수정",
				superAdmin: true,
				admin: true,
				teamLeader: false,
				activeMember: false,
				juniorMember: false,
				prepareMember: false,
			},
			{
				id: "members-auto-update",
				name: "회원 자격 변경",
				superAdmin: true,
				admin: true,
				teamLeader: false,
				activeMember: false,
				juniorMember: false,
				prepareMember: false,
			},
			{
				id: "members-application-manage",
				name: "가입 신청 관리",
				superAdmin: true,
				admin: true,
				teamLeader: false,
				activeMember: false,
				juniorMember: false,
				prepareMember: false,
			},
			{
				id: "members-permission",
				name: "접근 권한 관리",
				superAdmin: true,
				admin: true,
				teamLeader: false,
				activeMember: false,
				juniorMember: false,
				prepareMember: false,
			},
		],
	},
	{
		id: "projects",
		name: "프로젝트 관리 홈",
		superAdmin: true,
		admin: true,
		teamLeader: false,
		activeMember: false,
		juniorMember: false,
		prepareMember: false,
	},
	{
		id: "operation",
		name: "운영사 발급",
		superAdmin: true,
		admin: true,
		teamLeader: false,
		activeMember: false,
		juniorMember: false,
		prepareMember: false,
	},
	{
		id: "seminar",
		name: "회계 관리",
		superAdmin: true,
		admin: true,
		teamLeader: false,
		activeMember: false,
		juniorMember: false,
		prepareMember: false,
	},
	{
		id: "seminar-schedule",
		name: "세미나 수강신청",
		superAdmin: true,
		admin: true,
		teamLeader: false,
		activeMember: false,
		juniorMember: false,
		prepareMember: false,
	},
	{
		id: "mypage",
		name: "마이페이지",
		superAdmin: true,
		admin: true,
		teamLeader: false,
		activeMember: false,
		juniorMember: false,
		prepareMember: false,
	},
	{
		id: "login",
		name: "로그인",
		superAdmin: true,
		admin: true,
		teamLeader: false,
		activeMember: false,
		juniorMember: false,
		prepareMember: true,
	},
]

export default function MemberPermissionsPage() {
	const [expandedItems, setExpandedItems] = useState<string[]>(["members"])
	const [permissions, setPermissions] = useState<Permission[]>(permissionsData)

	const toggleExpand = (id: string) => {
		setExpandedItems((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
		)
	}

	const handlePermissionChange = (
		id: string,
		role: keyof Omit<Permission, "id" | "name" | "children">,
		checked: boolean,
	) => {
		// Helper to update nested permissions by id
		function updatePermissionById(
			permissions: Permission[],
			targetId: string,
			targetRole: keyof Omit<Permission, "id" | "name" | "children">,
			value: boolean,
		): Permission[] {
			return permissions.map((perm) => {
				if (perm.id === targetId) {
					return { ...perm, [targetRole]: value }
				}
				if (perm.children) {
					return {
						...perm,
						children: updatePermissionById(perm.children, targetId, targetRole, value),
					}
				}
				return perm
			})
		}

		setPermissions((prevPermissions) => updatePermissionById(prevPermissions, id, role, checked))

		// TODO: API 호출하여 권한 변경
		console.log(`권한 변경: ${id}, ${role}, ${checked}`)
	}

	const renderPermissionRow = (permission: Permission, level: number = 0): React.ReactNode => {
		const hasChildren = permission.children && permission.children.length > 0
		const isExpanded = expandedItems.includes(permission.id)

		return (
			<React.Fragment key={permission.id}>
				<TableRow>
					<TableCell style={{ paddingLeft: `${level * 2 + 1}rem` }}>
						<div className="flex items-center gap-2">
							{hasChildren && (
								<button
									type="button"
									onClick={() => toggleExpand(permission.id)}
									className="hover:opacity-70"
								>
									{isExpanded ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									)}
								</button>
							)}
							<span>{permission.name}</span>
						</div>
					</TableCell>
					<TableCell className="text-center">
						<Checkbox
							checked={permission.superAdmin}
							onCheckedChange={(checked) =>
								handlePermissionChange(permission.id, "superAdmin", checked as boolean)
							}
						/>
					</TableCell>
					<TableCell className="text-center">
						<Checkbox
							checked={permission.admin}
							onCheckedChange={(checked) =>
								handlePermissionChange(permission.id, "admin", checked as boolean)
							}
						/>
					</TableCell>
					<TableCell className="text-center">
						<Checkbox
							checked={permission.teamLeader}
							onCheckedChange={(checked) =>
								handlePermissionChange(permission.id, "teamLeader", checked as boolean)
							}
						/>
					</TableCell>
					<TableCell className="text-center">
						<Checkbox
							checked={permission.activeMember}
							onCheckedChange={(checked) =>
								handlePermissionChange(permission.id, "activeMember", checked as boolean)
							}
						/>
					</TableCell>
					<TableCell className="text-center">
						<Checkbox
							checked={permission.juniorMember}
							onCheckedChange={(checked) =>
								handlePermissionChange(permission.id, "juniorMember", checked as boolean)
							}
						/>
					</TableCell>
					<TableCell className="text-center">
						<Checkbox
							checked={permission.prepareMember}
							onCheckedChange={(checked) =>
								handlePermissionChange(permission.id, "prepareMember", checked as boolean)
							}
						/>
					</TableCell>
				</TableRow>
				{hasChildren &&
					isExpanded &&
					permission.children?.map((child) => renderPermissionRow(child, level + 1))}
			</React.Fragment>
		)
	}

	return (
		<div className="space-y-6 p-8">
			{/* 헤더 */}
			<div>
				<h1 className="text-3xl font-bold">접근 권한 관리</h1>
			</div>

			{/* 권한 테이블 */}
			<div className="rounded-lg border bg-white">
				<Table>
					<TableHeader>
						<TableRow className="bg-gray-50">
							<TableHead>메뉴</TableHead>
							<TableHead className="text-center">슈퍼 관리자</TableHead>
							<TableHead className="text-center">관리자</TableHead>
							<TableHead className="text-center">팀장</TableHead>
							<TableHead className="text-center">정회원</TableHead>
							<TableHead className="text-center">준회원</TableHead>
							<TableHead className="text-center">미가입</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>{permissions.map((permission) => renderPermissionRow(permission))}</TableBody>
				</Table>
			</div>
		</div>
	)
}
