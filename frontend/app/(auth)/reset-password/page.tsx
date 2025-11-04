'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api, { setAuthToken } from '@/lib/api'

export default function ResetPassword() {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) router.replace('/login')
    else setAuthToken(token)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      setMsg('Passwords do not match')
      return
    }

    setLoading(true)
    const token = localStorage.getItem('token')

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      })

      localStorage.clear()
      setAuthToken(null)
      setMsg('Password changed! Redirecting to login...')
      setTimeout(() => router.push('/login'), 1500)
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Set New Password</h1>
        {msg && (
          <p className={`text-center mb-4 font-medium ${msg.includes('changed') ? 'text-green-600' : 'text-red-600'}`}>
            {msg}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-3 border rounded-lg"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            required
            minLength={6}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 border rounded-lg"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
            minLength={6}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}