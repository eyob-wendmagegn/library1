// components/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaHome, FaUsers, FaComment, FaChartBar, FaFileAlt, FaBook, FaBookOpen,
  FaPlus, FaCog, FaSignOutAlt, FaBars, FaTimes, FaChevronDown, FaKey,
} from 'react-icons/fa';
import { useTranslation } from '@/lib/i18n';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  subItems?: { label: string; href: string; icon: React.ElementType }[];
}

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const adminMenu: MenuItem[] = [
    { label: t('dashboard'), href: '/admin', icon: FaHome },
    { label: t('users'), href: '/admin/users', icon: FaUsers },
    { label: t('comment'), href: '/admin/comment', icon: FaComment },
    { label: t('report'), href: '/admin/report', icon: FaChartBar },
    { label: t('post'), href: '/admin/post', icon: FaFileAlt },
    {
      label: t('setting'),
      href: '/admin/setting',
      icon: FaCog,
      subItems: [{ label: t('changePassword'), href: '/admin/setting/change-password', icon: FaKey }],
    },
  ];

  const librarianMenu: MenuItem[] = [
    { label: t('dashboard'), href: '/librarian', icon: FaHome },
    { label: t('books'), href: '/librarian/books', icon: FaBook },
    { label: t('borrow'), href: '/librarian/borrow', icon: FaBookOpen },
    { label: t('comment'), href: '/librarian/comment', icon: FaComment },
    { label: t('news'), href: '/librarian/news', icon: FaPlus },
    {
      label: t('setting'),
      href: '/librarian/setting',
      icon: FaCog,
      subItems: [{ label: t('changePassword'), href: '/librarian/setting/change-password', icon: FaKey }],
    },
  ];

  const teacherMenu: MenuItem[] = [
    { label: t('dashboard'), href: '/teacher', icon: FaHome },
    { label: t('books'), href: '/teacher/books', icon: FaBook },
    { label: t('comment'), href: '/teacher/comment', icon: FaComment },
    { label: t('news'), href: '/teacher/news', icon: FaPlus },
    {
      label: t('setting'),
      href: '/teacher/setting',
      icon: FaCog,
      subItems: [{ label: t('changePassword'), href: '/teacher/setting/change-password', icon: FaKey }],
    },
  ];

  const studentMenu: MenuItem[] = [
    { label: t('dashboard'), href: '/student', icon: FaHome },
    { label: t('books'), href: '/student/books', icon: FaBook },
    { label: t('comment'), href: '/student/comment', icon: FaComment },
    { label: t('news'), href: '/student/news', icon: FaPlus },
    {
      label: t('setting'),
      href: '/student/setting',
      icon: FaCog,
      subItems: [{ label: t('changePassword'), href: '/student/setting/change-password', icon: FaKey }],
    },
  ];

  const menuMap: Record<string, MenuItem[]> = {
    admin: adminMenu,
    librarian: librarianMenu,
    teacher: teacherMenu,
    student: studentMenu,
  };
  const menu = menuMap[role] ?? [];

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(prev => prev === label ? null : label);
  };

  if (!menu.length) return null;

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[70] p-3 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition"
        aria-label="Open menu"
      >
        <FaBars className="text-xl text-gray-800" />
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        h-screen  <!-- Full height -->
      `}>
        {/* Close Button (Mobile) */}
        <div className="absolute top-4 right-3 lg:hidden">
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <FaTimes className="text-xl text-gray-600" />
          </button>
        </div>

        {/* Scrollable Menu Area - Takes available space */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-300">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.subItems?.some(s => pathname === s.href) ?? false);
            const isSubOpen = openSubmenu === item.label;

            return (
              <div key={item.label}>
                <div
                  onClick={() => item.subItems && toggleSubmenu(item.label)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all font-medium text-sm ${
                    isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 flex-1"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="text-lg" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                  {item.subItems && (
                    <FaChevronDown className={`text-sm transition-transform ${isSubOpen ? 'rotate-180' : ''}`} />
                  )}
                </div>

                {/* Submenu */}
                {item.subItems && isSubOpen && (
                  <div className="ml-10 mt-2 space-y-1">
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const subActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                            subActive ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <SubIcon className="text-sm" />
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout - Fixed at Bottom */}
        <div className="border-t border-gray-200 px-3 py-4 mt-auto">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login-normal';
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-medium text-sm"
          >
            <FaSignOutAlt className="text-lg" />
            <span>{t('logout')}</span>
          </button>
        </div>-
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        />
      )}
    </>
  );
}