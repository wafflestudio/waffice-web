import type { ProjectManagementRow, ProjectManagementStatus } from "@/types"

const STATUS_OPTIONS: ProjectManagementStatus[] = ["활성화", "유지보수", "종결"]

const DEFAULT_LINKS = [
	{ label: "Released", count: 3 },
	{ label: "GitHub", count: 2 },
	{ label: "ETC", count: 2 },
]

const DEFAULT_MEMBERS = [
	"홍길동",
	"김철수",
	"이영희",
	"홍길동",
	"김철수",
	"이영희",
	"홍길동",
	"김철수",
	"이영희",
]

const BASE_PROJECTS: Omit<ProjectManagementRow, "id">[] = [
	{
		name: "SNUTT",
		leader: "최유림",
		memberCount: 12,
		members: [
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
		links: DEFAULT_LINKS,
		status: "활성화",
	},
	{
		name: "식샤",
		leader: "한상현",
		memberCount: 24,
		members: [...DEFAULT_MEMBERS, "홍길동", "김철수", "이영희"],
		links: DEFAULT_LINKS,
		status: "활성화",
	},
	{
		name: "CSEreal",
		leader: "홍길동",
		memberCount: 6,
		members: DEFAULT_MEMBERS.slice(0, 6),
		links: DEFAULT_LINKS,
		status: "활성화",
	},
	{
		name: "Infra 팀",
		leader: "홍길동",
		memberCount: 13,
		members: [...DEFAULT_MEMBERS, "홍길동"],
		links: DEFAULT_LINKS,
		status: "활성화",
	},
	{
		name: "인터널 프로덕트",
		leader: "문재영",
		memberCount: 13,
		members: [
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
		links: DEFAULT_LINKS,
		status: "활성화",
	},
	{
		name: "올클",
		leader: "김민수",
		memberCount: 10,
		members: DEFAULT_MEMBERS,
		links: DEFAULT_LINKS,
		status: "활성화",
	},
	{
		name: "행사",
		leader: "홍길동",
		memberCount: 6,
		members: DEFAULT_MEMBERS.slice(0, 6),
		links: DEFAULT_LINKS,
		status: "활성화",
	},
	{
		name: "모이밍",
		leader: "홍길동",
		memberCount: 5,
		members: DEFAULT_MEMBERS.slice(0, 5),
		links: DEFAULT_LINKS,
		status: "활성화",
	},
	{
		name: "SunClear",
		leader: "홍길동",
		memberCount: 5,
		members: DEFAULT_MEMBERS.slice(0, 5),
		links: DEFAULT_LINKS,
		status: "활성화",
	},
	{
		name: "Memo With Tags",
		leader: "홍길동",
		memberCount: 10,
		members: DEFAULT_MEMBERS,
		links: DEFAULT_LINKS,
		status: "종결",
	},
	{
		name: "인턴하샤",
		leader: "홍길동",
		memberCount: 10,
		members: DEFAULT_MEMBERS,
		links: DEFAULT_LINKS,
		status: "종결",
	},
]

export const MOCK_PROJECT_MANAGEMENT_ROWS: ProjectManagementRow[] = Array.from(
	{ length: 5 },
	(_, pageIndex) =>
		BASE_PROJECTS.map((project, rowIndex) => ({
			...project,
			id: pageIndex * BASE_PROJECTS.length + rowIndex + 1,
			name: pageIndex === 0 ? project.name : `${project.name} ${pageIndex + 1}`,
			status:
				pageIndex === 0
					? project.status
					: STATUS_OPTIONS[(pageIndex + rowIndex) % STATUS_OPTIONS.length],
		})),
).flat()

export const MOCK_MY_PROJECT_ROWS = MOCK_PROJECT_MANAGEMENT_ROWS.filter((project) =>
	["SNUTT", "인터널 프로덕트"].includes(project.name),
)
