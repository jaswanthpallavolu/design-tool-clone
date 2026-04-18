import AuthWrapper from "../components/auth/AuthWrapper"

export default function DesignLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthWrapper>{children}</AuthWrapper>
}
