import { Button } from "@/components/ui/button"

interface SignupButtonProps {
	onClick?: () => void
	disabled?: boolean
}

function SignupButton({ onClick, disabled = false }: SignupButtonProps) {
	return (
		<Button onClick={onClick} className="w-full h-[50px]" variant="outline" disabled={disabled}>
			회원가입
		</Button>
	)
}

export { SignupButton }
