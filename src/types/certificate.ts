export type CertificateIssueStatus = "발급 완료" | "발급 대기" | "발급 실패"

export interface CertificateIssueHistory {
	id: number
	requestType: string
	issuedAt: string
	recipient: string
	status: CertificateIssueStatus
}
