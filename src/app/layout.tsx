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
	title: "WAFFICE",
	description: "와플스튜디오 회원 포털 WAFFICE입니다.",
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
