"use client"

import { Loader2 } from "lucide-react"
import { useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { authClient } from "@/lib/auth"
import type { AuthResult, DevSigninRequest } from "@/types"

type Qualification = DevSigninRequest["qualification"]

interface PresetUser {
	label: string
	email: string
	name: string
	is_leader?: boolean
	is_admin?: boolean
	is_president?: boolean
	qualification: Qualification
}

const PRESET_USERS: PresetUser[] = [
	{
		label: "Admin User",
		email: "admin@example.com",
		name: "Admin User",
		is_leader: true,
		is_admin: true,
		is_president: true,
		qualification: "active",
	},
	{
		label: "Active User",
		email: "active@example.com",
		name: "Active User",
		qualification: "active",
	},
	{
		label: "Regular User",
		email: "regular@example.com",
		name: "Regular User",
		qualification: "regular",
	},
	{
		label: "Associate User",
		email: "associate@example.com",
		name: "Associate User",
		qualification: "associate",
	},
	{
		label: "Pending User",
		email: "pending@example.com",
		name: "Pending User",
		qualification: "pending",
	},
]

interface DevSigninFormProps {
	onSuccess: (result: AuthResult) => void
	onError: (error: string) => void
}

export function DevSigninForm({ onSuccess, onError }: DevSigninFormProps) {
	const id = useId()
	const [isLoading, setIsLoading] = useState(false)
	const [loadingPreset, setLoadingPreset] = useState<string | null>(null)
	const [showCustomForm, setShowCustomForm] = useState(false)

	// Custom form state
	const [email, setEmail] = useState("")
	const [name, setName] = useState("")
	const [qualification, setQualification] = useState<Qualification>("active")
	const [isAdmin, setIsAdmin] = useState(false)

	// Form element IDs
	const emailId = `${id}-email`
	const nameId = `${id}-name`
	const qualificationId = `${id}-qualification`
	const adminId = `${id}-admin`

	const handleSignin = async (request: DevSigninRequest, presetLabel?: string) => {
		setIsLoading(true)
		if (presetLabel) {
			setLoadingPreset(presetLabel)
		}

		try {
			const response = await authClient.devSignin(request)
			if (response.ok) {
				onSuccess(response.data)
			} else {
				onError("Dev signin failed")
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "Dev signin failed"
			onError(message)
		} finally {
			setIsLoading(false)
			setLoadingPreset(null)
		}
	}

	const handlePresetClick = (preset: PresetUser) => {
		handleSignin(
			{
				email: preset.email,
				name: preset.name,
				is_leader: preset.is_leader ?? false,
				is_admin: preset.is_admin ?? false,
				is_president: preset.is_president ?? false,
				qualification: preset.qualification,
			},
			preset.label,
		)
	}

	const handleCustomSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!email || !name) {
			onError("Email and name are required")
			return
		}
		handleSignin({
			email,
			name,
			is_admin: isAdmin,
			qualification,
		})
	}

	return (
		<div className="border-2 border-orange-500 rounded-lg p-4 space-y-4">
			<div className="flex items-center gap-2">
				<div className="h-2 w-2 rounded-full bg-orange-500" />
				<span className="text-sm font-medium text-orange-600">Dev Mode</span>
			</div>

			<div className="space-y-2">
				<p className="text-xs text-muted-foreground">Quick signin with preset users:</p>
				<div className="flex flex-wrap gap-2">
					{PRESET_USERS.map((preset) => (
						<Button
							key={preset.email}
							variant="outline"
							size="sm"
							disabled={isLoading}
							onClick={() => handlePresetClick(preset)}
						>
							{loadingPreset === preset.label ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
							{preset.label}
						</Button>
					))}
				</div>
			</div>

			<div className="border-t pt-4">
				<Button
					variant="ghost"
					size="sm"
					className="w-full text-muted-foreground"
					onClick={() => setShowCustomForm(!showCustomForm)}
					disabled={isLoading}
				>
					{showCustomForm ? "Hide custom form" : "Custom user..."}
				</Button>

				{showCustomForm && (
					<form onSubmit={handleCustomSubmit} className="mt-4 space-y-4">
						<div className="space-y-2">
							<Label htmlFor={emailId}>Email</Label>
							<Input
								id={emailId}
								type="email"
								placeholder="user@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={nameId}>Name</Label>
							<Input
								id={nameId}
								type="text"
								placeholder="Test User"
								value={name}
								onChange={(e) => setName(e.target.value)}
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={qualificationId}>Qualification</Label>
							<Select
								value={qualification}
								onValueChange={(value) => setQualification(value as Qualification)}
								disabled={isLoading}
							>
								<SelectTrigger id={qualificationId}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="regular">Regular</SelectItem>
									<SelectItem value="associate">Associate</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								id={adminId}
								checked={isAdmin}
								onCheckedChange={(checked) => setIsAdmin(checked === true)}
								disabled={isLoading}
							/>
							<Label htmlFor={adminId} className="text-sm font-normal cursor-pointer">
								Admin
							</Label>
						</div>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading && !loadingPreset ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing in...
								</>
							) : (
								"Sign in as custom user"
							)}
						</Button>
					</form>
				)}
			</div>
		</div>
	)
}
