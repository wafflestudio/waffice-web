import type {
	CursorPage,
	MemberActivityStatus,
	MemberDetail,
	ProjectDetail,
	ProjectListItem,
	ProjectStatus,
} from "@/types"

const STATUS_CYCLE: ProjectStatus[] = ["active", "maintenance", "ended"]

const BASE_ITEMS: Omit<ProjectListItem, "id" | "status">[] = [
	{
		name: "SNUTT",
		leader_names: ["최유림"],
		member_count: 12,
		active_member_names: [
			"최유림",
			"임찬영",
			"송동엽",
			"양주현",
			"정해찬",
			"박신홍",
			"김기완",
			"민유진",
			"최유진",
			"박소은",
			"이정달",
			"최연서",
		],
	},
	{
		name: "식샤",
		leader_names: ["한상현"],
		member_count: 6,
		active_member_names: ["한상현", "홍길동", "김철수", "이영희", "박민지", "정우성"],
	},
	{
		name: "CSEreal",
		leader_names: ["홍길동"],
		member_count: 6,
		active_member_names: ["홍길동", "김철수", "이영희", "박민지", "정우성", "최유림"],
	},
	{
		name: "인터널 프로덕트",
		leader_names: ["문재영"],
		member_count: 13,
		active_member_names: [
			"문재영",
			"윤시현",
			"최세연",
			"부민석",
			"박소은",
			"김재민",
			"한영웅",
			"강현규",
			"김한우",
			"양보우",
			"장우석",
			"전민건",
			"유현빈",
		],
	},
	{
		name: "올클",
		leader_names: ["김민수"],
		member_count: 5,
		active_member_names: ["김민수", "홍길동", "김철수", "이영희", "박민지"],
	},
	{
		name: "인턴하샤",
		leader_names: ["홍길동"],
		member_count: 4,
		active_member_names: ["홍길동", "김철수", "이영희", "박민지"],
	},
]

/** 프로젝트 목록(GET /projects) mock — 백엔드 CursorPage[ProjectListItem]와 동일한 형태. */
export function buildMockProjectListPage(): CursorPage<ProjectListItem> {
	const items: ProjectListItem[] = BASE_ITEMS.map((item, index) => ({
		...item,
		id: index + 1,
		status: STATUS_CYCLE[index % STATUS_CYCLE.length],
	}))

	return { items, next_cursor: null }
}

/** 프로젝트 상세(GET /projects/{id}) mock — 백엔드 ProjectDetail(멤버 미포함)과 동일한 형태. */
export function buildMockProjectDetail(projectId: number): ProjectDetail {
	const listItem =
		buildMockProjectListPage().items.find((item) => item.id === projectId) ??
		buildMockProjectListPage().items[0]

	return {
		id: listItem.id,
		name: listItem.name,
		status: listItem.status,
		started_at: "2025-10-01",
		created_at: 1727740800,
		description: null,
		ended_at: null,
		websites: [
			{ url: "https://waffle.studio", type: "Web", description: "와플 스튜디오 관리 시스템" },
			{
				url: `https://github.com/wafflestudio/${listItem.name.toLowerCase()}`,
				type: "Server",
				description: `GitHub wafflestudio/${listItem.name}`,
			},
		],
	}
}

function buildMockMembers(names: string[], leaderNames: string[]): MemberDetail[] {
	return names.map((name, index) => {
		const isPastMember = index % 5 === 4
		return {
			id: index + 1,
			user: {
				id: 1000 + index,
				name,
				email: `${name}@waffle.studio`,
				avatar_url: null,
				github_username: `waffle-${index}`,
			},
			role: leaderNames.includes(name) ? "leader" : "member",
			position: null,
			joined_at: "2025-10-01",
			left_at: isPastMember ? "2025-12-31" : null,
			activity_status: isPastMember ? "inactive" : "active",
		}
	})
}

/** 팀원 목록(GET /projects/{id}/members) mock — 백엔드 CursorPage[MemberDetail]와 동일한 형태. */
export function buildMockProjectMembersPage(
	projectId: number,
	options: { status?: MemberActivityStatus; keyword?: string } = {},
): CursorPage<MemberDetail> {
	const listItem =
		buildMockProjectListPage().items.find((item) => item.id === projectId) ??
		buildMockProjectListPage().items[0]

	let members = buildMockMembers(listItem.active_member_names, listItem.leader_names)

	if (options.status) {
		members = members.filter((member) => member.activity_status === options.status)
	}
	if (options.keyword?.trim()) {
		const keyword = options.keyword.trim().toLowerCase()
		members = members.filter((member) => member.user.name.toLowerCase().includes(keyword))
	}

	return { items: members, next_cursor: null }
}
