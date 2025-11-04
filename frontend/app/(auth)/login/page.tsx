'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaUser, FaLock } from 'react-icons/fa'
import api, { setAuthToken } from '@/lib/api'

export default function Login() {
  const [creds, setCreds] = useState({ username: '', password: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    localStorage.clear()
    setAuthToken(null)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      const res = await api.post('/auth/login', creds)
      const { token, needsReset, role, name } = res.data

      setAuthToken(token)
      localStorage.setItem('token', token)
      localStorage.setItem('role', role)
      localStorage.setItem('name', name)

      if (needsReset) {
        router.push('/reset-password')
      } else {
        const path = role === 'admin' ? '/admin' : `/${role}`
        router.push(path)
      }
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <div className="w-full max-w-md">
        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* TITLE */}
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-tight">
            Library Login
          </h1>

          {/* ERROR MESSAGE */}
          {msg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
              {msg}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* USERNAME */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaUser className="text-blue-600" />
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                value={creds.username}
                onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaLock className="text-blue-600" />
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                value={creds.password}
                onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* FOOTER TEXT */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Woldia University Library System © 2025
          </p>
        </div>
      </div>
    </div>
  )
}