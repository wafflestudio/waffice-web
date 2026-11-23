import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import localFont from "next/font/local"
import Script from "next/script"
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
	const gtmId = process.env.NEXT_PUBLIC_GTM_ID

	return (
		<html lang="en">
			<body className={`${pretendard.variable} ${geistMono.variable} font-sans antialiased`}>
				<ClientProviders>{children}</ClientProviders>
				{gtmId && (
					<>
						{/* biome-ignore lint/correctness/useUniqueElementIds: This script runs once in the root layout. */}
						<Script id="gtm-init" strategy="afterInteractive">
							{`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
              `}
						</Script>
						<Script
							src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
							strategy="afterInteractive"
						/>
					</>
				)}
			</body>
		</html>
	)
}
