import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import QueryClientProvider from "./components/providers/QueryClientProvider"
import { GlobalContextProvider } from "./components/providers/GlobalContext"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Canvas Graphics Editor",
  description: "A browser-based graphics editor built on a framework-agnostic engine.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <QueryClientProvider>
          <GlobalContextProvider>{children}</GlobalContextProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
