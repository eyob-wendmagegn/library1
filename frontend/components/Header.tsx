// components/Header.tsx
'use client';

import { useEffect, useState } from 'react';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '@/lib/i18n';

export default function Header({ role }: { role: string }) {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);
  const router = useRouter();
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') ?? 'unknown' : 'unknown';

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const r = role === 'admin'
          ? await api.get('/comments/unread')
          : await api.get('/news/unread', { params: { role, userId } });
        setCount(r.data.count ?? 0);
      } catch {
        console.error('Failed to fetch unread count');
      }
    };
    fetchCount();
    const id = setInterval(fetchCount, 10_000);
    return () => clearInterval(id);
  }, [role, userId]);

  const handleBellClick = async () => {
    if (!count) return;
    try {
      if (role === 'admin') {
        await api.post('/comments/read');
        router.push('/admin/comment');
      } else {
        await api.post('/news/read', { userId });
        router.push(`/${role}/news`);
      }
      setCount(0);
    } catch {
      console.error('Failed to mark as read');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40 h-14 sm:h-16">
      <div className="h-full flex items-center justify-between px-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9">
            <Image
              src="/wdu1.jpg"
              alt="Logo"
              fill
              className="object-contain rounded-lg"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <p className="text-xs font-semibold text-gray-800">{t('welcome')}</p>
            <p className="text-xs text-gray-500">{t('library')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBellClick}
            className="relative p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
          >
            <FaBell className="text-base" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center animate-pulse font-medium">
                {count}
              </span>
            )}
          </button>

          <LanguageSwitcher />

          <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition">
            <FaUserCircle className="text-lg" />
          </button>
        </div>
      </div>
    </header>
  );
}