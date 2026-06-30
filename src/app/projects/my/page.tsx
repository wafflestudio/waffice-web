"use client"

import { MyProjectsView } from "@/components/projects/my-projects-view"
import { MOCK_MY_PROJECT_ROWS } from "@/components/projects/project-management.mock"

export default function MyProjectsPage() {
	// TODO(API): 내 프로젝트 목록 조회 hook이 생기면 MOCK_MY_PROJECT_ROWS를 API 응답으로 교체.
	return <MyProjectsView projects={MOCK_MY_PROJECT_ROWS} />
}
