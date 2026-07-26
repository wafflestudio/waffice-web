import type { GraduationStatus, Qualification } from "./common"
import type { UserDetail } from "./user"

export type AuthStatus = "new" | "pending" | "active"

export interface GoogleTokenRequest {
	code: string
	redirect_uri: string
}

export interface GoogleTokenResponse {
	ok: boolean
	data: {
		status: AuthStatus
		auth_token: string
	}
}

export interface SigninRequest {
	auth_token: string
}

export interface RelinkGoogleAccountRequest {
	auth_token: string
}

export interface SignupRequest {
	auth_token: string
	name: string
	generation: string
	student_id: string
	email: string
	graduation_status: GraduationStatus
	qualification: Exclude<Qualification, "pending">
	privacy_policy_agreed: true
	terms_agreed: true
	email_notifications_agreed?: boolean
	sms_notifications_agreed?: boolean
	phone?: string
	affiliation?: string
	bio?: string
	github_username?: string
}

export interface DevSigninRequest {
	email: string
	name: string
	is_leader?: boolean
	is_admin?: boolean
	is_president?: boolean
	qualification?: Qualification
}

export interface Token {
	access_token: string
	token_type: string
}

export interface AuthResult {
	status: AuthStatus
	user: UserDetail
}

export interface AuthResponse {
	ok: boolean
	data: AuthResult
}
