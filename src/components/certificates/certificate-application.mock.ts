import type { MyCertificateApplication } from "@/types"

// TODO(API): 본인 활동증명서 신청/목록 API가 준비되면 fixture로만 유지한다.
export const MOCK_MY_CERTIFICATE_APPLICATIONS: MyCertificateApplication[] = [
	{ id: 1, applicationNumber: "1234", appliedAt: "2025.10.01", status: "발급 완료" },
	{ id: 2, applicationNumber: "1234", appliedAt: "2025.10.01", status: "대기" },
	...Array.from({ length: 8 }, (_, index) => ({
		id: index + 3,
		applicationNumber: String(1235 + index),
		appliedAt: `2025.${String(9 - Math.floor(index / 2)).padStart(2, "0")}.${String(28 - index).padStart(2, "0")}`,
		status: index % 2 === 0 ? ("발급 완료" as const) : ("대기" as const),
	})),
]
