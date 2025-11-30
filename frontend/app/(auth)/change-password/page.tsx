// app/(auth)/change-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n'; // ← ADDED
import api from '@/lib/api';

export default function ChangePassword() {
  const { t } = useTranslation(); // ← ADDED

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('changeToken');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setMsg(t('passwordMinLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg(t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('changeToken');

    if (!token) {
      setMsg(t('sessionExpired'));
      setLoading(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      await api.post('/auth/change-password', {
        username: payload.username,
        id: payload.userId,
        newPassword,
        confirmPassword,
      });

      localStorage.removeItem('changeToken');
      setMsg(t('passwordChanged'));
      setTimeout(() => router.push('/login-normal'), 1500);
    } catch (err: any) {
      setMsg(err.response?.data?.message || t('changePasswordFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          {t('setYourPassword')}
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          {t('firstLoginInstructions')}
        </p>

        {msg && (
          <div
            className={`mb-5 p-3 rounded-lg text-center font-medium text-sm ${
              msg.includes(t('passwordChanged'))
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder={t('newPasswordPlaceholder')}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder={t('confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition-all duration-200"
          >
            {loading ? t('saving') : t('changePassword')}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          {t('copyright')}
        </p>
      </div>
    </div>
  );
}