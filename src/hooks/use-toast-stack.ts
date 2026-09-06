import { useCallback, useRef, useState } from "react"
import type { ToastStackItem } from "@/components/ui/toast-stack"

export function useToastStack() {
	const [items, setItems] = useState<ToastStackItem[]>([])
	const nextIdRef = useRef(0)

	const push = useCallback((message: string) => {
		const id = `toast-${nextIdRef.current++}`
		setItems((current) => [...current, { id, message }])
	}, [])

	const pushMany = useCallback((messages: string[]) => {
		const newItems = messages.map((message) => ({
			id: `toast-${nextIdRef.current++}`,
			message,
		}))
		setItems((current) => [...current, ...newItems])
	}, [])

	const dismiss = useCallback((id: string) => {
		setItems((current) => current.filter((item) => item.id !== id))
	}, [])

	const clear = useCallback(() => {
		setItems([])
	}, [])

	return { items, push, pushMany, dismiss, clear }
}
