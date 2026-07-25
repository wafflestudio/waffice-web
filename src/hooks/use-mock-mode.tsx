"use client"

import { usePathname } from "next/navigation"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "waffice:mock-mode-paths"

function readStoredPaths(): Set<string> {
	if (typeof window === "undefined") return new Set()
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		return new Set(raw ? (JSON.parse(raw) as string[]) : [])
	} catch {
		return new Set()
	}
}

function writeStoredPaths(paths: Set<string>) {
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...paths]))
}

interface MockModeContextValue {
	mockPaths: Set<string>
	toggle: (path: string) => void
	isEnabled: (path: string) => boolean
}

const MockModeContext = createContext<MockModeContextValue | null>(null)

export function MockModeProvider({ children }: { children: React.ReactNode }) {
	const [mockPaths, setMockPaths] = useState<Set<string>>(new Set())

	useEffect(() => {
		setMockPaths(readStoredPaths())
	}, [])

	const toggle = useCallback((path: string) => {
		setMockPaths((prev) => {
			const next = new Set(prev)
			if (next.has(path)) {
				next.delete(path)
			} else {
				next.add(path)
			}
			writeStoredPaths(next)
			return next
		})
	}, [])

	const isEnabled = useCallback((path: string) => mockPaths.has(path), [mockPaths])

	const value = useMemo(() => ({ mockPaths, toggle, isEnabled }), [mockPaths, toggle, isEnabled])

	return <MockModeContext.Provider value={value}>{children}</MockModeContext.Provider>
}

function useMockModeContext() {
	const context = useContext(MockModeContext)
	if (!context) {
		throw new Error("useMockMode must be used within MockModeProvider")
	}
	return context
}

/** 현재 경로의 mock 모드 on/off 상태와 토글 함수를 반환한다. */
export function useMockMode() {
	const pathname = usePathname()
	const { isEnabled, toggle } = useMockModeContext()

	return {
		enabled: isEnabled(pathname),
		toggle: () => toggle(pathname),
	}
}
