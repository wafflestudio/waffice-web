import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"
import { ClientProviders } from "@/components/providers/client-providers"

const pretendard = localFont({
	src: "./fonts/PretendardVariable.woff2",
	variable: "--font-pretendard",
	weight: "45 920",
	display: "swap",
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "와플 스튜디오 관리 시스템",
	description: "와플 스튜디오 내부 관리 웹페이지",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={`${pretendard.variable} ${geistMono.variable} font-sans antialiased`}>
				<ClientProviders>{children}</ClientProviders>
			</body>
		</html>
	)
}
