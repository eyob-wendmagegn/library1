// app/[role]/setting/change-password/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { useTranslation } from '@/lib/i18n' // ← ADDED
import api from '@/lib/api'

interface Props {
  params: { role: string }
}

export default function ChangePassword({ params }: Props) {
  const { t } = useTranslation() // ← ADDED

  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const role = params.role

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.newPassword !== form.confirmPassword) {
      setMsg(t('passwordsDoNotMatch'))
      return
    }

    if (form.newPassword.length < 6) {
      setMsg(t('passwordMinLength'))
      return
    }

    setLoading(true)
    setMsg('')

    try {
      await api.post('/auth/change-password-after-login', form)
      setMsg(t('passwordChangedSuccess'))
      setTimeout(() => router.push(`/${role}`), 1500)
    } catch (err: any) {
      setMsg(err.response?.data?.message || t('changePasswordFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout role={role}>
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {t('changePassword')} {/* ← TRANSLATED */}
        </h1>

        {msg && (
          <p
            className={`text-center mb-4 p-3 rounded-lg text-sm font-medium ${
              msg.includes(t('success'))
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {msg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            placeholder={t('oldPassword')} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={form.oldPassword}
            onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder={t('newPassword')} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            required
            minLength={6}
            disabled={loading}
          />

          <input
            type="password"
            placeholder={t('confirmNewPassword')} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
            minLength={6}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
          >
            {loading ? t('changing') : t('changePassword')} {/* ← TRANSLATED */}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          {t('copyright')} {/* ← TRANSLATED */}
        </p>
      </div>
    </Layout>
  )
}