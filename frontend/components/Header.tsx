'use client'

import { FaUserCircle, FaBell } from 'react-icons/fa'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* LEFT: WELCOME */}
        <div className="flex items-center gap-3">
          <FaUserCircle className="text-2xl text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-800">Welcome back!</p>
            <p className="text-xs text-gray-500">Library Management System</p>
          </div>
        </div>

        {/* RIGHT: ICONS */}
        <div className="flex items-center gap-4">
          {/* NOTIFICATION */}
          <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition">
            <FaBell className="text-lg" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* USER PROFILE */}
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition">
            <FaUserCircle className="text-xl" />
          </button>
        </div>
      </div>
    </header>
  )
}