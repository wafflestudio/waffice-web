import type { UserBrief } from "./user"

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

export const CERTIFICATE_INCLUDED_CONTENT_OPTIONS = [
	"회원 자격 취득, 변동 및 상실의 각 기준일 및 사유",
	"구성원으로서 활동한 소속 프로젝트의 명칭, 기간 및 역할",
	"임원 또는 집행부원으로 활동한 기간 및 역할",
] as const

export interface CertificateApplicationFormValues {
	signer: CertificateSigner
	purpose: string
	includedContents: string[]
}

/** 신청 다이얼로그 폼 값 → 백엔드 CertificateOptions 요청 바디로 변환. */
export function toCertificateOptions(values: CertificateApplicationFormValues): CertificateOptions {
	const [qualificationLabel, projectsLabel, executiveLabel] = CERTIFICATE_INCLUDED_CONTENT_OPTIONS

	return {
		signer: values.signer === "지도교수" ? "advisor" : "president",
		purpose: values.purpose,
		include_qualification_history: values.includedContents.includes(qualificationLabel),
		include_projects: values.includedContents.includes(projectsLabel),
		include_executive: values.includedContents.includes(executiveLabel),
	}
}

export interface SignatureDetail {
	id: number
	user_id: number
	url: string
	created_at: number
	updated_at: number
}

// === 백엔드 활동증명서(certificate of activities) API 스키마 ===
// PR #18/#20/#21 (feat/certificate-render-draft, -issue-number, -original-registration) 기준.

export type CertificateSignerCode = "president" | "advisor"
export type CertificateKind = "self" | "draft"
export type CertificateStatus = "issued" | "original_pending"
export type CertificateEventAction = "applied" | "issued" | "draft_created" | "original_registered"
export type CertificateActorType = "applicant" | "system" | "president" | "admin"

export interface CertificateOptions {
	signer?: CertificateSignerCode
	advisor_name?: string | null
	purpose: string
	include_qualification_history?: boolean
	include_projects?: boolean
	include_executive?: boolean
}

export interface DraftCertificateCreate {
	user_id: number
	options: CertificateOptions
}

export interface CertificateEventItem {
	id: number
	action: CertificateEventAction
	actor_type: CertificateActorType
	actor: UserBrief | null
	created_at: number
}

export interface CertificateDetail {
	id: number
	kind: CertificateKind
	status: CertificateStatus
	user: UserBrief
	requested_by: UserBrief | null
	options: CertificateOptions
	issue_number: string | null
	issued_at: number | null
	expires_at: number | null
	created_at: number
	updated_at: number
	events: CertificateEventItem[]
}

/** GET /certificates/me 목록 항목. */
export interface CertificateSummary {
	id: number
	kind: CertificateKind
	status: CertificateStatus
	issue_number: string | null
	created_at: number
	issued_at: number | null
}

const formatEpochDate = (epochSeconds: number) =>
	new Date(epochSeconds * 1000).toISOString().slice(0, 10).replaceAll("-", ".")

/** GET /certificates/me 응답 항목 → 신청 이력 테이블 행으로 변환. */
export function toMyCertificateApplication(summary: CertificateSummary): MyCertificateApplication {
	return {
		id: summary.id,
		applicationNumber: String(summary.id),
		appliedAt: formatEpochDate(summary.created_at),
		status: summary.status === "issued" ? "발급 완료" : "대기",
	}
}
