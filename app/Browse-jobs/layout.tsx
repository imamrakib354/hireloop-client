import WebsiteLayout from "@/app/(website)/layout"

export default function BrowseJobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#09090b] [color-scheme:dark]">
      <WebsiteLayout>{children}</WebsiteLayout>
    </div>
  )
}
