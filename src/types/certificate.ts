export type CertificateIssueStatus = "발급 완료" | "발급 대기" | "발급 실패"

export interface CertificateIssueHistory {
	id: number
	requestType: string
	issuedAt: string
	recipient: string
	status: CertificateIssueStatus
}

export type MyCertificateApplicationStatus = "발급 완료" | "대기"
export type CertificateSigner = "와플스튜디오 회장" | "지도교수"

export interface MyCertificateApplication {
	id: number
	applicationNumber: string
	appliedAt: string
	status: MyCertificateApplicationStatus
}

export interface CertificateApplicationFormValues {
	signer: CertificateSigner
	purpose: string
	includedContents: string[]
}
