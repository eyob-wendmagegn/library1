'use client'

import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
  role: string
}

export default function Layout({ children, role }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <Sidebar role={role} />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col lg-margin">
        {/* HEADER */}
        <Header />

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 lg:ml-0">
          {children}
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  )
}