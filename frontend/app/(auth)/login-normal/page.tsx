// app/(auth)/login-normal/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTranslation } from '@/lib/i18n';
import api, { setAuthToken } from '@/lib/api';

export default function NormalLogin() {
  const { t } = useTranslation();

  const [creds, setCreds] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Clear any old session
  useEffect(() => {
    localStorage.clear();
    setAuthToken(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const res = await api.post('/auth/login', creds);
      const { token, role, name } = res.data;

      // Save session
      setAuthToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);

      // Redirect based on role
      const path = role === 'admin' ? '/admin' : `/${role}`;
      router.push(path);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || t('loginFailed');
      setMsg(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-tight">
            {t('login')}
          </h1>

          {/* ERROR / INFO MESSAGES */}
          {msg && (
            <div
              className={`mb-6 p-3 rounded-lg text-sm text-center font-medium border transition-all ${
                msg.includes('deactivated')
                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                  : msg.includes('first')
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* USERNAME */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaUser className="text-blue-600" />
                {t('username')}
              </label>
              <input
                type="text"
                placeholder={t('enterUsername')}
                className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={creds.username}
                onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            {/* PASSWORD WITH EYE ICON */}
            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaLock className="text-blue-600" />
                {t('password')}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('enterPassword')}
                className="w-full px-4 py-3 pl-11 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={creds.password}
                onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                required
                disabled={loading}
              />
              {/* EYE ICON */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-11 text-gray-500 hover:text-gray-700 transition"
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
              >
                {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
              </button>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition-all duration-200"
            >
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>

          {/* FIRST TIME LINK */}
          <p className="text-center text-xs text-gray-500 mt-6">
            {t('firstTime')}?{' '}
            <a href="/login" className="text-blue-600 hover:underline font-medium">
              {t('setPasswordHere')}
            </a>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            {t('copyright')}
          </p>
        </div>
      </div>
    </div>
  );
}