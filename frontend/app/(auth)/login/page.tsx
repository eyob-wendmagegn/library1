// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaIdCard } from 'react-icons/fa';
import { useTranslation } from '@/lib/i18n'; // ← Correct import
import api from '@/lib/api';

export default function FirstLogin() {
  const { t } = useTranslation(); // ← MUST CLOSE THIS WITH }

  const [creds, setCreds] = useState({ username: '', id: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const res = await api.post('/auth/first-login', creds);
      localStorage.setItem('changeToken', res.data.token);
      router.push('/change-password');
    } catch (err: any) {
      setMsg(err.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            {t('firstTimeLogin')}
          </h1>

          {msg && (
            <div className={`mb-6 p-3 rounded-lg text-center font-medium ${
              msg.includes('not found') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaUser /> {t('username')}
              </label>
              <input
                type="text"
                placeholder={t('enterUsername')}
                value={creds.username}
                onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                className="w-full px-4 py-3 pl-11 border rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaIdCard /> {t('id')}
              </label>
              <input
                type="text"
                placeholder={t('enterId')}
                value={creds.id}
                onChange={(e) => setCreds({ ...creds, id: e.target.value })}
                className="w-full px-4 py-3 pl-11 border rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
            >
              {loading ? t('checking') : t('continue')}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            {t('alreadySetPassword')}{' '}
            <a href="/login-normal" className="text-blue-600 hover:underline">
              {t('loginHere')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}