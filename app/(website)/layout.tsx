import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { getCurrentUser } from "@/lib/getUserSession"

export default async function WebsiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <>
      <Navbar user={user ? { name: user.name, role: user.role } : null} />
      {children}
      <Footer />
    </>
  )
}
