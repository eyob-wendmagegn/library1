'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { FaHome, FaUsers, FaComment, FaChartBar, FaFileAlt, FaBook, FaPlus, FaCog, FaSignOutAlt, FaBars, FaTimes, FaChevronDown, FaKey } from 'react-icons/fa'

interface MenuItem {
  label: string
  href: string
  icon: React.ElementType
  subItems?: { label: string; href: string; icon: React.ElementType }[]
}

interface SidebarProps {
  role: string
}

export default function Sidebar({ role }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const pathname = usePathname()

  const adminMenu: MenuItem[] = [
    { label: 'Dashboard', href: '/admin', icon: FaHome },
    { label: 'Users', href: '/admin/users', icon: FaUsers },
    { label: 'Comment', href: '/admin/comment', icon: FaComment },
    { label: 'Report', href: '/admin/report', icon: FaChartBar },
    { label: 'Post', href: '/admin/post', icon: FaFileAlt },
    {
      label: 'Setting',
      href: '/admin/setting',
      icon: FaCog,
      subItems: [
        { label: 'Change Password', href: '/admin/setting/change-password', icon: FaKey },
      ],
    },
  ]

  const otherMenu: MenuItem[] = [
    { label: 'Dashboard', href: `/${role}`, icon: FaHome },
    { label: 'Books', href: `/${role}/books`, icon: FaBook },
    { label: 'Comment', href: `/${role}/comment`, icon: FaComment },
    { label: 'News', href: `/${role}/news`, icon: FaPlus },
    {
      label: 'Setting',
      href: `/${role}/setting`,
      icon: FaCog,
      subItems: [
        { label: 'Change Password', href: `/${role}/setting/change-password`, icon: FaKey },
      ],
    },
  ]

  const menu = role === 'admin' ? adminMenu : otherMenu

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50"
      >
        <FaBars className="text-xl text-gray-700" />
      </button>

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="lg:hidden absolute top-4 right-4 z-50">
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <FaTimes className="text-xl text-gray-600" />
          </button>
        </div>

        <div className="p-6 border-b flex items-center gap-4">
          <div className="w-16 h-16 relative flex-shrink-0">
            <Image src="/wdu.jpg" alt="Logo" fill className="object-contain rounded-lg shadow-sm" priority />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Library System</h1>
            <p className="text-sm text-gray-600 capitalize">{role}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.subItems && item.subItems.some(sub => pathname === sub.href))
            const isSubOpen = openSubmenu === item.label

            return (
              <div key={item.label}>
                <div
                  onClick={() => item.subItems && toggleSubmenu(item.label)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all font-medium cursor-pointer ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Link href={item.href} className="flex items-center gap-3 flex-1" onClick={() => setIsOpen(false)}>
                    <Icon className="text-lg" />
                    <span>{item.label}</span>
                  </Link>
                  {item.subItems && (
                    <FaChevronDown className={`text-sm transition-transform ${isSubOpen ? 'rotate-180' : ''}`} />
                  )}
                </div>

                {item.subItems && isSubOpen && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon
                      const subActive = pathname === sub.href
                      return (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                            subActive ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <SubIcon className="text-sm" />
                          <span>{sub.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 text-red-600 hover:bg-red-50 w-full px-4 py-3 rounded-lg transition font-medium"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30" />
      )}
    </>
  )
}