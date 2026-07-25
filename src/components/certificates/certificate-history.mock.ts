import type { CertificateIssueHistory } from "@/types"

// TODO(API): 활동증명서 발급 이력 API가 준비되면 fixture로만 유지하고 query 응답을 사용한다.
export const MOCK_CERTIFICATE_HISTORY: CertificateIssueHistory[] = [
	{
		id: 1,
		requestType: "본인 신청",
		issuedAt: "2025.09.01",
		recipient: "홍길동 (WAFFICE)",
		status: "발급 완료",
	},
	{
		id: 2,
		requestType: "본인 신청",
		issuedAt: "2025.09.01",
		recipient: "홍길동 (WAFFICE)",
		status: "발급 완료",
	},
]
